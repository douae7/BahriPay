package com.maritime.controller;

import com.maritime.dto.NotificationDto;
import com.maritime.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> listNotifications() {
        return ResponseEntity.ok(notificationService.listAll());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<List<NotificationDto>> markAllAsRead() {
        return ResponseEntity.ok(notificationService.markAllAsRead());
    }
}
