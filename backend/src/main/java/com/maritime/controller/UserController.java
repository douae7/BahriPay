package com.maritime.controller;

import com.maritime.dto.AuthDtos;
import com.maritime.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','ARMATEUR')")
public class UserController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<AuthDtos.UserDto>> listUsers() {
        return ResponseEntity.ok(authService.listUsers());
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<AuthDtos.UserDto> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody AuthDtos.UpdateUserRoleRequest request
    ) {
        return ResponseEntity.ok(authService.updateUserRole(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
