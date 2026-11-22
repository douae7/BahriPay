package com.maritime.dto;

import com.maritime.enums.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

public final class AuthDtos {

    private AuthDtos() {}

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RegisterRequest {
        @NotBlank(message = "Le nom complet est obligatoire.")
        @Size(min = 2, max = 150)
        private String fullName;

        @NotBlank(message = "L'adresse e-mail est obligatoire.")
        @Email(message = "Format d'adresse e-mail invalide.")
        private String email;

        @NotBlank(message = "Le mot de passe est obligatoire.")
        @Size(min = 6, max = 120, message = "Le mot de passe doit contenir au moins 6 caractères.")
        private String password;

        private RoleName role;

        private String portAttache;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LoginRequest {
        @NotBlank(message = "L'adresse e-mail est obligatoire.")
        @Email(message = "Format d'adresse e-mail invalide.")
        private String email;

        @NotBlank(message = "Le mot de passe est obligatoire.")
        private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DemoLoginRequest {
        @NotNull(message = "Le rôle est obligatoire.")
        private RoleName role;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ForgotPasswordRequest {
        @NotBlank(message = "L'adresse e-mail est obligatoire.")
        @Email(message = "Format d'adresse e-mail invalide.")
        private String email;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RefreshTokenRequest {
        @NotBlank
        private String refreshToken;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateUserRoleRequest {
        @NotNull
        private RoleName role;
        private Boolean enabled;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserDto {
        private Long id;
        private String fullName;
        private String email;
        private String role;
        private String portAttache;
        private String avatarInitials;
        private boolean enabled;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private String refreshToken;
        private String tokenType;
        private long expiresIn;
        private UserDto user;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MessageResponse {
        private String message;
        private boolean success;
    }
}
