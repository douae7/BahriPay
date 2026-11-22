package com.maritime.dto;

import com.maritime.enums.NotificationCategory;
import com.maritime.enums.NotificationSeverity;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private NotificationCategory category;
    private NotificationSeverity severity;
    private String createdAt;
    private boolean read;
    private String targetPage;
}
