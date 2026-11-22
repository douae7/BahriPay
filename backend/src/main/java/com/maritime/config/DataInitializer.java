package com.maritime.config;

import com.maritime.entity.Role;
import com.maritime.entity.User;
import com.maritime.enums.RoleName;
import com.maritime.repository.RoleRepository;
import com.maritime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        ensureUser(
                "direction@bahripay-armement.fr",
                "Jean-Baptiste Le Gall",
                "Concarneau",
                "JB",
                RoleName.ARMATEUR
        );
        ensureUser(
                "y.keravec@bahripay-armement.fr",
                "Yannick Keravec",
                "Concarneau",
                "YK",
                RoleName.CAPITAINE
        );
        ensureUser(
                "finances@bahripay-armement.fr",
                "Claire Moreau",
                "Lorient",
                "CM",
                RoleName.FINANCIER
        );
        ensureUser(
                "audit@bahripay-armement.fr",
                "Marc Delacroix",
                "La Rochelle",
                "MD",
                RoleName.OBSERVATEUR
        );
        ensureUser(
                "admin@bahripay-armement.fr",
                "Administrateur Bahripay",
                "Concarneau",
                "AB",
                RoleName.ADMIN
        );
    }

    private void ensureUser(String email, String fullName, String port, String initials, RoleName roleName) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return;
        }
        Role role = roleRepository.findByName(roleName).orElseGet(() ->
                roleRepository.save(Role.builder()
                        .name(roleName)
                        .description("Rôle " + roleName.name())
                        .build())
        );

        User user = User.builder()
                .email(email)
                .fullName(fullName)
                .portAttache(port)
                .avatarInitials(initials)
                .role(role)
                .passwordHash(passwordEncoder.encode("Bahripay2026!"))
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(user);
    }
}
