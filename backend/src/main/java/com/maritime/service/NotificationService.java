package com.maritime.service;

import com.maritime.dto.NotificationDto;
import com.maritime.enums.NotificationCategory;
import com.maritime.enums.NotificationSeverity;

import java.util.List;

public interface NotificationService {
    List<NotificationDto> listAll();
    NotificationDto markAsRead(Long id);
    List<NotificationDto> markAllAsRead();
    void createAlert(String title, String message, NotificationCategory category, NotificationSeverity severity, String targetPage);
}
