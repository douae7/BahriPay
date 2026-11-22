import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface OceanCanvas3DProps {
  className?: string;
  theme?: 'light' | 'dark';
}

interface FishActor {
  group: THREE.Group;
  tailPivot: THREE.Group;
  leftFin: THREE.Mesh;
  rightFin: THREE.Mesh;
  speed: number;
  direction: 1 | -1;
  baseY: number;
  baseZ: number;
  phase: number;
  boundsX: number;
  pitchBias: number;
  dodgeY: number;
  speedBoost: number;
}

interface KelpBlade {
  pivot: THREE.Group;
  phase: number;
  amp: number;
  speed: number;
}

interface SceneThemeHandles {
  scene: THREE.Scene;
  hemiLight: THREE.HemisphereLight;
  sunKeyLight: THREE.DirectionalLight;
  rimLight: THREE.DirectionalLight;
  dustMat: THREE.PointsMaterial;
  bubbleMat: THREE.MeshStandardMaterial;
  kelpMat: THREE.MeshStandardMaterial;
}

const LIGHT_OCEAN_BG = 0xd9f4fa;
const DARK_OCEAN_BG = 0x041e32;

// Pre-allocated math helpers (Zero GC in render loop)
const _dummy = new THREE.Object3D();

export const OceanCanvas3D: React.FC<OceanCanvas3DProps> = ({
  className = '',
  theme = 'dark',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const handlesRef = useRef<SceneThemeHandles | null>(null);
  const themeRef = useRef<'light' | 'dark'>(theme);
  themeRef.current = theme;

  useEffect(() => {
    const h = handlesRef.current;
    if (!h) return;

    const isLight = theme === 'light';
    const bgHex = isLight ? LIGHT_OCEAN_BG : DARK_OCEAN_BG;
    h.scene.background = new THREE.Color(bgHex);
    h.scene.fog = new THREE.FogExp2(bgHex, isLight ? 0.026 : 0.036);

    if (isLight) {
      h.hemiLight.color.setHex(0xffffff);
      h.hemiLight.groundColor.setHex(0x16c5c0);
      h.hemiLight.intensity = 1.65;
      h.sunKeyLight.color.setHex(0xfffbeb);
      h.sunKeyLight.intensity = 2.5;
      h.rimLight.color.setHex(0x0a4565);
      h.rimLight.intensity = 0.85;
      h.dustMat.color.setHex(0x0a4565);
      h.dustMat.opacity = 0.25;
      h.bubbleMat.color.setHex(0xffffff);
      h.bubbleMat.opacity = 0.55;
      h.kelpMat.color.setHex(0x0e7490);
    } else {
      h.hemiLight.color.setHex(0x7ddceb);
      h.hemiLight.groundColor.setHex(0x031524);
      h.hemiLight.intensity = 1.35;
      h.sunKeyLight.color.setHex(0xb8f6ff);
      h.sunKeyLight.intensity = 2.2;
      h.rimLight.color.setHex(0x16c5c0);
      h.rimLight.intensity = 1.1;
      h.dustMat.color.setHex(0x7ddceb);
      h.dustMat.opacity = 0.45;
      h.bubbleMat.color.setHex(0xcffafe);
      h.bubbleMat.opacity = 0.42;
      h.kelpMat.color.setHex(0x14b8a6);
    }
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // 1. Software WebGL probe
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const initialLight = themeRef.current === 'light';
    const initialBgHex = initialLight ? LIGHT_OCEAN_BG : DARK_OCEAN_BG;

    // 2. Scene, Camera, Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(initialBgHex);
    scene.fog = new THREE.FogExp2(initialBgHex, initialLight ? 0.026 : 0.036);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 14);

    // 3. Renderer setup (graceful fallback if WebGL context is unavailable)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // 4. Studio Environment Map for metallic fish scales
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 5. Warm/Cool Underwater Lighting Rig
    const hemiLight = new THREE.HemisphereLight(
      initialLight ? 0xffffff : 0x7ddceb,
      initialLight ? 0x16c5c0 : 0x031524,
      initialLight ? 1.65 : 1.35
    );
    scene.add(hemiLight);

    const sunKeyLight = new THREE.DirectionalLight(
      initialLight ? 0xfffbeb : 0xb8f6ff,
      initialLight ? 2.5 : 2.2
    );
    sunKeyLight.position.set(6, 14, 8);
    scene.add(sunKeyLight);

    const rimLight = new THREE.DirectionalLight(
      initialLight ? 0x0a4565 : 0x16c5c0,
      initialLight ? 0.85 : 1.1
    );
    rimLight.position.set(-8, -4, -6);
    scene.add(rimLight);

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // 6. Composite 5-Part Procedural 3D Fish Builder
    const bodyPoints = [
      new THREE.Vector2(0.001, -1.05),
      new THREE.Vector2(0.14, -0.82),
      new THREE.Vector2(0.28, -0.45),
      new THREE.Vector2(0.36, -0.05),
      new THREE.Vector2(0.33, 0.35),
      new THREE.Vector2(0.21, 0.72),
      new THREE.Vector2(0.08, 0.96),
      new THREE.Vector2(0.001, 1.05),
    ];
    const fishBodyGeo = new THREE.LatheGeometry(bodyPoints, 18);
    fishBodyGeo.rotateZ(-Math.PI / 2);
    fishBodyGeo.scale(1, 0.85, 0.45);
    geometriesToDispose.push(fishBodyGeo);

    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0);
    tailShape.lineTo(-0.55, 0.44);
    tailShape.quadraticCurveTo(-0.34, 0, -0.55, -0.44);
    tailShape.closePath();
    const tailGeo = new THREE.ExtrudeGeometry(tailShape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
    });
    tailGeo.translate(0, 0, -0.015);
    geometriesToDispose.push(tailGeo);

    const dorsalShape = new THREE.Shape();
    dorsalShape.moveTo(-0.22, 0);
    dorsalShape.quadraticCurveTo(0.04, 0.36, 0.25, 0.06);
    dorsalShape.closePath();
    const dorsalGeo = new THREE.ExtrudeGeometry(dorsalShape, {
      depth: 0.024,
      bevelEnabled: false,
    });
    dorsalGeo.translate(0, 0, -0.012);
    geometriesToDispose.push(dorsalGeo);

    const pectoralGeo = new THREE.ConeGeometry(0.12, 0.32, 6);
    pectoralGeo.rotateZ(Math.PI * 0.65);
    pectoralGeo.scale(1, 0.3, 1);
    geometriesToDispose.push(pectoralGeo);

    const eyeGeo = new THREE.SphereGeometry(0.042, 10, 10);
    geometriesToDispose.push(eyeGeo);

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.1,
      metalness: 0.1,
    });
    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x031524,
      roughness: 0.05,
      metalness: 0.2,
    });
    materialsToDispose.push(eyeMat, pupilMat);

    const fishSpecs: Array<{
      bodyColor: number;
      finColor: number;
      scale: number;
      y: number;
      z: number;
      x: number;
      dir: 1 | -1;
      speed: number;
    }> = [
      { bodyColor: 0x0e6e8c, finColor: 0x16c5c0, scale: 1.05, y: 2.4, z: -2.2, x: -7, dir: 1, speed: 1.35 },
      { bodyColor: 0x16c5c0, finColor: 0x7ddceb, scale: 0.85, y: -2.1, z: -1.4, x: 6, dir: -1, speed: 1.55 },
      { bodyColor: 0x0a4565, finColor: 0x38bdf8, scale: 1.22, y: 0.6, z: -4.8, x: -2, dir: 1, speed: 0.95 },
      { bodyColor: 0x14b8a6, finColor: 0xfbbf24, scale: 0.72, y: 3.3, z: -3.5, x: 4, dir: -1, speed: 1.4 },
      { bodyColor: 0x0c5b7c, finColor: 0x7ddceb, scale: 0.92, y: -3.2, z: -4.1, x: -9, dir: 1, speed: 1.1 },
      { bodyColor: 0x1e88a8, finColor: 0x16c5c0, scale: 0.68, y: -0.6, z: -6.2, x: 9, dir: -1, speed: 0.85 },
    ];

    const activeSpecs = isMobile ? fishSpecs.slice(0, 4) : fishSpecs;
    const actors: FishActor[] = [];

    activeSpecs.forEach((spec, idx) => {
      const group = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color: spec.bodyColor,
        roughness: 0.28,
        metalness: 0.65,
      });
      const finMat = new THREE.MeshStandardMaterial({
        color: spec.finColor,
        roughness: 0.55,
        metalness: 0.15,
        transparent: true,
        opacity: 0.88,
      });
      materialsToDispose.push(bodyMat, finMat);

      const body = new THREE.Mesh(fishBodyGeo, bodyMat);
      group.add(body);

      const dorsal = new THREE.Mesh(dorsalGeo, finMat);
      dorsal.position.set(-0.05, 0.24, 0);
      group.add(dorsal);

      const tailPivot = new THREE.Group();
      tailPivot.position.set(-0.98, 0, 0);
      const tail = new THREE.Mesh(tailGeo, finMat);
      tailPivot.add(tail);
      group.add(tailPivot);

      const leftFin = new THREE.Mesh(pectoralGeo, finMat);
      leftFin.position.set(0.2, -0.08, 0.16);
      group.add(leftFin);

      const rightFin = new THREE.Mesh(pectoralGeo, finMat);
      rightFin.position.set(0.2, -0.08, -0.16);
      group.add(rightFin);

      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(0.72, 0.08, 0.11);
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.72, 0.08, -0.11);
      group.add(eyeL, eyeR);

      group.scale.setScalar(spec.scale);
      group.position.set(spec.x, spec.y, spec.z);
      group.rotation.y = spec.dir === 1 ? 0 : Math.PI;
      scene.add(group);

      actors.push({
        group,
        tailPivot,
        leftFin,
        rightFin,
        speed: spec.speed,
        direction: spec.dir,
        baseY: spec.y,
        baseZ: spec.z,
        phase: idx * 1.4,
        boundsX: 14,
        pitchBias: 0,
        dodgeY: 0,
        speedBoost: 1,
      });
    });

    // 7. InstancedMesh School of Small Fish
    const schoolCount = isMobile ? 14 : 26;
    const schoolGeo = new THREE.ConeGeometry(0.08, 0.42, 6);
    schoolGeo.rotateZ(-Math.PI / 2);
    schoolGeo.scale(1, 0.75, 0.45);
    const schoolMat = new THREE.MeshStandardMaterial({
      color: 0x16c5c0,
      roughness: 0.22,
      metalness: 0.72,
    });
    geometriesToDispose.push(schoolGeo);
    materialsToDispose.push(schoolMat);

    const schoolMesh = new THREE.InstancedMesh(schoolGeo, schoolMat, schoolCount);
    schoolMesh.frustumCulled = false;
    const schoolOffsets = Array.from({ length: schoolCount }, (_, i) => ({
      dx: (Math.random() - 0.5) * 4.5,
      dy: (Math.random() - 0.5) * 2.1,
      dz: (Math.random() - 0.5) * 2.5,
      scale: 0.7 + Math.random() * 0.5,
      phase: i * 0.5,
    }));
    scene.add(schoolMesh);

    // 8. 3D Seabed Swaying Kelp Blades (Anchored to ocean floor)
    const kelpShape = new THREE.Shape();
    kelpShape.moveTo(-0.18, 0);
    kelpShape.quadraticCurveTo(-0.28, 1.4, -0.05, 2.8);
    kelpShape.quadraticCurveTo(0.08, 3.3, 0.0, 3.6);
    kelpShape.quadraticCurveTo(0.24, 2.1, 0.18, 0);
    kelpShape.closePath();
    const kelpGeo = new THREE.ExtrudeGeometry(kelpShape, {
      depth: 0.04,
      bevelEnabled: false,
    });
    const kelpMat = new THREE.MeshStandardMaterial({
      color: initialLight ? 0x0e7490 : 0x14b8a6,
      roughness: 0.65,
      metalness: 0.08,
      transparent: true,
      opacity: 0.45,
    });
    geometriesToDispose.push(kelpGeo);
    materialsToDispose.push(kelpMat);

    const kelpCount = isMobile ? 6 : 12;
    const kelpBlades: KelpBlade[] = [];
    for (let i = 0; i < kelpCount; i++) {
      const pivot = new THREE.Group();
      const mesh = new THREE.Mesh(kelpGeo, kelpMat);
      pivot.add(mesh);
      const isLeft = i % 2 === 0;
      const xPos = isLeft ? -11.5 + i * 0.7 : 11.5 - (i - 1) * 0.7;
      pivot.position.set(xPos, -6.9, -2.5 - (i % 4) * 1.4);
      pivot.scale.setScalar(0.75 + (i % 3) * 0.25);
      pivot.rotation.y = (i * 0.45) % Math.PI;
      scene.add(pivot);
      kelpBlades.push({
        pivot,
        phase: i * 0.9,
        amp: 0.1 + (i % 3) * 0.04,
        speed: 1.0 + (i % 4) * 0.2,
      });
    }

    // 9. InstancedMesh 3D Rising Bubbles
    const bubbleCount = isMobile ? 22 : 46;
    const bubbleGeo = new THREE.SphereGeometry(0.065, 10, 10);
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: initialLight ? 0xffffff : 0xcffafe,
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: initialLight ? 0.55 : 0.42,
    });
    geometriesToDispose.push(bubbleGeo);
    materialsToDispose.push(bubbleMat);

    const bubbleMesh = new THREE.InstancedMesh(bubbleGeo, bubbleMat, bubbleCount);
    bubbleMesh.frustumCulled = false;
    const bubblesData = Array.from({ length: bubbleCount }, (_, i) => ({
      x: (Math.random() - 0.5) * 24,
      y: (Math.random() - 0.5) * 14,
      z: -1 - Math.random() * 7,
      speed: 0.55 + Math.random() * 0.9,
      scale: 0.45 + Math.random() * 1.15,
      phase: i * 0.7,
    }));
    scene.add(bubbleMesh);

    // 10. Underwater Floating Dust / Plankton Points
    const dustCount = isMobile ? 70 : 160;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 26;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      dustPositions[i * 3 + 2] = -0.5 - Math.random() * 9;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: initialLight ? 0x0a4565 : 0x7ddceb,
      size: 0.055,
      transparent: true,
      opacity: initialLight ? 0.25 : 0.45,
      sizeAttenuation: true,
    });
    geometriesToDispose.push(dustGeo);
    materialsToDispose.push(dustMat);
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    handlesRef.current = {
      scene,
      hemiLight,
      sunKeyLight,
      rimLight,
      dustMat,
      bubbleMat,
      kelpMat,
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      mouseCurrent.current.x = THREE.MathUtils.damp(
        mouseCurrent.current.x,
        mouseTarget.current.x,
        4.5,
        delta
      );
      mouseCurrent.current.y = THREE.MathUtils.damp(
        mouseCurrent.current.y,
        mouseTarget.current.y,
        4.5,
        delta
      );

      camera.position.x = mouseCurrent.current.x * 0.9;
      camera.position.y = 0.3 + mouseCurrent.current.y * 0.6;
      camera.lookAt(0, 0, -3);

      // Approximate cursor in world plane at fish depth
      const cursorWorldX = mouseCurrent.current.x * 11;
      const cursorWorldY = mouseCurrent.current.y * 5.8;

      if (!prefersReducedMotion) {
        for (let i = 0; i < actors.length; i++) {
          const f = actors[i];
          const dx = f.group.position.x - cursorWorldX;
          const dy = f.group.position.y - cursorWorldY;
          const distSq = dx * dx + dy * dy;

          // Subtle lifelike cursor reaction: nearby fish bank away & accelerate smoothly
          const influence = Math.max(0, 1 - distSq / 24);
          const targetDodgeY = influence * (dy >= 0 ? 1.15 : -1.15);
          const targetSpeedBoost = 1 + influence * 0.75;
          const targetPitch = influence * (dy >= 0 ? 0.16 : -0.16) * f.direction;

          f.dodgeY = THREE.MathUtils.damp(f.dodgeY, targetDodgeY, 3.2, delta);
          f.speedBoost = THREE.MathUtils.damp(f.speedBoost, targetSpeedBoost, 3.5, delta);
          f.pitchBias = THREE.MathUtils.damp(f.pitchBias, targetPitch, 4.0, delta);

          f.group.position.x += f.direction * f.speed * f.speedBoost * delta;
          if (f.direction === 1 && f.group.position.x > f.boundsX) {
            f.group.position.x = -f.boundsX;
          } else if (f.direction === -1 && f.group.position.x < -f.boundsX) {
            f.group.position.x = f.boundsX;
          }

          f.group.position.y = f.baseY + Math.sin(elapsed * 1.1 + f.phase) * 0.35 + f.dodgeY;
          f.group.rotation.z = Math.cos(elapsed * 1.1 + f.phase) * 0.04 * f.direction + f.pitchBias;
          f.tailPivot.rotation.y = Math.sin(elapsed * (7.5 * f.speedBoost) + f.phase) * 0.38;
          f.leftFin.rotation.y = Math.sin(elapsed * 4.5 + f.phase) * 0.25;
          f.rightFin.rotation.y = -Math.sin(elapsed * 4.5 + f.phase) * 0.25;
        }

        const schoolCenterX = ((elapsed * 1.15) % 28) - 14;
        const schoolCenterY =
          Math.sin(elapsed * 0.55) * 1.2 + 1.2 + mouseCurrent.current.y * 0.45;
        for (let i = 0; i < schoolCount; i++) {
          const o = schoolOffsets[i];
          _dummy.position.set(
            schoolCenterX + o.dx,
            schoolCenterY + o.dy + Math.sin(elapsed * 2.2 + o.phase) * 0.14,
            -4.5 + o.dz
          );
          _dummy.rotation.set(0, Math.sin(elapsed * 9 + o.phase) * 0.12, 0);
          _dummy.scale.setScalar(o.scale);
          _dummy.updateMatrix();
          schoolMesh.setMatrixAt(i, _dummy.matrix);
        }
        schoolMesh.instanceMatrix.needsUpdate = true;

        // Sway seabed kelp gently with current + slight cursor drift
        for (let i = 0; i < kelpBlades.length; i++) {
          const k = kelpBlades[i];
          k.pivot.rotation.z =
            Math.sin(elapsed * k.speed + k.phase) * k.amp + mouseCurrent.current.x * 0.04;
        }

        for (let i = 0; i < bubbleCount; i++) {
          const b = bubblesData[i];
          b.y += b.speed * delta;
          if (b.y > 7.5) b.y = -7.5;
          _dummy.position.set(
            b.x + Math.sin(elapsed * 1.4 + b.phase) * 0.18 + mouseCurrent.current.x * 0.15,
            b.y,
            b.z
          );
          _dummy.rotation.set(0, 0, 0);
          _dummy.scale.setScalar(b.scale);
          _dummy.updateMatrix();
          bubbleMesh.setMatrixAt(i, _dummy.matrix);
        }
        bubbleMesh.instanceMatrix.needsUpdate = true;

        dustPoints.rotation.y = Math.sin(elapsed * 0.08) * 0.05;
        dustPoints.position.y = Math.sin(elapsed * 0.25) * 0.25;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      handlesRef.current = null;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      envTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
