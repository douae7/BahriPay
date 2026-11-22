package com.maritime.service.impl;

import com.maritime.dto.NotificationDto;
import com.maritime.entity.Notification;
import com.maritime.enums.NotificationCategory;
import com.maritime.enums.NotificationSeverity;
import com.maritime.exception.ResourceNotFoundException;
import com.maritime.mapper.MaritimeMapper;
import com.maritime.repository.NotificationRepository;
import com.maritime.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final MaritimeMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> listAll() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(mapper::toNotificationDto)
                .toList();
    }

    @Override
    @Transactional
    public NotificationDto markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable : " + id));
        notification.setRead(true);
        return mapper.toNotificationDto(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public List<NotificationDto> markAllAsRead() {
        List<Notification> all = notificationRepository.findAllByOrderByCreatedAtDesc();
        all.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(all);
        return all.stream().map(mapper::toNotificationDto).toList();
    }

    @Override
    @Transactional
    public void createAlert(String title, String message, NotificationCategory category, NotificationSeverity severity, String targetPage) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .category(category)
                .severity(severity != null ? severity : NotificationSeverity.INFO)
                .targetPage(targetPage)
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();
        notificationRepository.save(notification);
    }
}
