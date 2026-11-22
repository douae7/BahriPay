package com.maritime.controller;

import com.maritime.dto.FlotteDtos;
import com.maritime.enums.VesselStatus;
import com.maritime.service.FlotteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bateaux")
@RequiredArgsConstructor
public class BateauController {

    private final FlotteService flotteService;

    @GetMapping
    public ResponseEntity<List<FlotteDtos.BateauResponse>> listBateaux() {
        return ResponseEntity.ok(flotteService.listBateaux());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlotteDtos.BateauResponse> getBateau(@PathVariable Long id) {
        return ResponseEntity.ok(flotteService.getBateau(id));
    }

    @PostMapping
    public ResponseEntity<FlotteDtos.BateauResponse> createBateau(@Valid @RequestBody FlotteDtos.BateauRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flotteService.createBateau(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlotteDtos.BateauResponse> updateBateau(
            @PathVariable Long id,
            @Valid @RequestBody FlotteDtos.BateauRequest request
    ) {
        return ResponseEntity.ok(flotteService.updateBateau(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FlotteDtos.BateauResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        VesselStatus status = VesselStatus.fromValue(payload.get("status"));
        return ResponseEntity.ok(flotteService.updateBateauStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBateau(@PathVariable Long id) {
        flotteService.deleteBateau(id);
        return ResponseEntity.noContent().build();
    }
}
