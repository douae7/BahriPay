package com.maritime.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Map<String, Instant> revokedTokens = new ConcurrentHashMap<>();

    public void revoke(String token, Instant expiresAt) {
        if (token != null && !token.isBlank()) {
            revokedTokens.put(token, expiresAt != null ? expiresAt : Instant.now().plusSeconds(86400));
            cleanupExpired();
        }
    }

    public boolean isRevoked(String token) {
        Instant exp = revokedTokens.get(token);
        if (exp == null) {
            return false;
        }
        if (exp.isBefore(Instant.now())) {
            revokedTokens.remove(token);
            return false;
        }
        return true;
    }

    private void cleanupExpired() {
        Instant now = Instant.now();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}
