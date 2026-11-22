package com.maritime.service;

import com.maritime.dto.AuthDtos;

import java.util.List;

public interface AuthService {
    AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request);
    AuthDtos.AuthResponse login(AuthDtos.LoginRequest request);
    AuthDtos.AuthResponse demoLogin(AuthDtos.DemoLoginRequest request);
    AuthDtos.AuthResponse refreshToken(AuthDtos.RefreshTokenRequest request);
    AuthDtos.MessageResponse logout(String bearerHeader);
    AuthDtos.MessageResponse forgotPassword(AuthDtos.ForgotPasswordRequest request);
    AuthDtos.UserDto getCurrentUser(String email);
    List<AuthDtos.UserDto> listUsers();
    AuthDtos.UserDto updateUserRole(Long userId, AuthDtos.UpdateUserRoleRequest request);
    void deleteUser(Long userId);
}
