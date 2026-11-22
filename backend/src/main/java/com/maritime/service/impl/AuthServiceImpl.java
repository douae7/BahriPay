package com.maritime.service.impl;

import com.maritime.dto.AuthDtos;
import com.maritime.entity.Role;
import com.maritime.entity.User;
import com.maritime.enums.RoleName;
import com.maritime.exception.BadRequestException;
import com.maritime.exception.ConflictException;
import com.maritime.exception.ResourceNotFoundException;
import com.maritime.mapper.MaritimeMapper;
import com.maritime.repository.RoleRepository;
import com.maritime.repository.UserRepository;
import com.maritime.security.JwtService;
import com.maritime.security.TokenBlacklistService;
import com.maritime.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final MaritimeMapper mapper;

    @Override
    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("Un compte utilise déjà cette adresse e-mail.");
        }

        RoleName targetRole = request.getRole() != null ? request.getRole() : RoleName.USER;
        if (targetRole == RoleName.ADMIN) {
            // Prevent arbitrary self-elevation to ADMIN via public signup unless explicitly seeded
            targetRole = RoleName.USER;
        }

        Role role = resolveRole(targetRole);
        String initials = buildInitials(request.getFullName());

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .portAttache(request.getPortAttache() != null && !request.getPortAttache().isBlank()
                        ? request.getPortAttache().trim()
                        : "Concarneau")
                .avatarInitials(initials)
                .role(role)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim(), request.getPassword())
        );

        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable."));
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse demoLogin(AuthDtos.DemoLoginRequest request) {
        String demoEmail = switch (request.getRole()) {
            case ARMATEUR -> "direction@bahripay-armement.fr";
            case CAPITAINE -> "y.keravec@bahripay-armement.fr";
            case FINANCIER -> "finances@bahripay-armement.fr";
            case OBSERVATEUR -> "audit@bahripay-armement.fr";
            case ADMIN -> "admin@bahripay-armement.fr";
            default -> "direction@bahripay-armement.fr";
        };
        User user = userRepository.findByEmailIgnoreCase(demoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Compte de démonstration introuvable : " + demoEmail));
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse refreshToken(AuthDtos.RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (tokenBlacklistService.isRevoked(token) || jwtService.isTokenExpired(token)) {
            throw new BadRequestException("Refresh token expiré ou révoqué.");
        }
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable."));
        return buildAuthResponse(user);
    }

    @Override
    public AuthDtos.MessageResponse logout(String bearerHeader) {
        if (bearerHeader != null && bearerHeader.startsWith("Bearer ")) {
            String token = bearerHeader.substring(7);
            try {
                tokenBlacklistService.revoke(token, jwtService.extractExpiration(token));
            } catch (Exception ignored) {
                // Invalid/expired token still results in clean logout
            }
        }
        return AuthDtos.MessageResponse.builder()
                .success(true)
                .message("Déconnexion effectuée. Le jeton JWT a été révoqué.")
                .build();
    }

    @Override
    public AuthDtos.MessageResponse forgotPassword(AuthDtos.ForgotPasswordRequest request) {
        boolean exists = userRepository.existsByEmailIgnoreCase(request.getEmail().trim());
        String msg = exists
                ? "Un lien de réinitialisation sécurisé vient d’être envoyé à " + request.getEmail().trim() + "."
                : "Si un compte existe pour " + request.getEmail().trim() + ", un lien de réinitialisation a été envoyé.";
        return AuthDtos.MessageResponse.builder()
                .success(true)
                .message(msg)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthDtos.UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable."));
        return mapper.toUserDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthDtos.UserDto> listUsers() {
        return userRepository.findAll().stream().map(mapper::toUserDto).toList();
    }

    @Override
    @Transactional
    public AuthDtos.UserDto updateUserRole(Long userId, AuthDtos.UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + userId));
        Role role = resolveRole(request.getRole());
        user.setRole(role);
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        return mapper.toUserDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Utilisateur introuvable : " + userId);
        }
        userRepository.deleteById(userId);
    }

    private Role resolveRole(RoleName roleName) {
        return roleRepository.findByName(roleName).orElseGet(() ->
                roleRepository.save(Role.builder()
                        .name(roleName)
                        .description("Rôle " + roleName.name())
                        .build())
        );
    }

    private AuthDtos.AuthResponse buildAuthResponse(User user) {
        return AuthDtos.AuthResponse.builder()
                .token(jwtService.generateAccessToken(user))
                .refreshToken(jwtService.generateRefreshToken(user))
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationSeconds())
                .user(mapper.toUserDto(user))
                .build();
    }

    private String buildInitials(String fullName) {
        String initials = Arrays.stream(fullName.trim().split("\\s+"))
                .filter(s -> !s.isBlank())
                .map(s -> s.substring(0, 1).toUpperCase())
                .collect(Collectors.joining());
        if (initials.isEmpty()) return "BP";
        return initials.length() > 2 ? initials.substring(0, 2) : initials;
    }
}
