package com.samp.service.impl;

import com.samp.dto.response.NotificationResponse;
import com.samp.entity.Notification;
import com.samp.entity.User;
import com.samp.enums.NotificationType;
import com.samp.exception.ResourceNotFoundException;
import com.samp.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ── Send (Async) ──────────────────────────────────────────────────────────

    @Async
    @Transactional
    public void sendNotification(User user,
                                 String message,
                                 NotificationType type) {
        try {
            Notification notification = Notification.builder()
                    .user(user)
                    .message(message)
                    .type(type)
                    .read(false)
                    .build();

            notificationRepository.save(notification);
            log.info("Notification sent to {}: {}", user.getEmail(), message);

        } catch (Exception e) {
            log.error("Failed to send notification to {}: {}",
                    user.getEmail(), e.getMessage());
        }
    }

    // ── Get All ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllNotifications(User user) {
        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get Unread ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(User user) {
        return notificationRepository
                .findByUserAndReadOrderByCreatedAtDesc(user, false)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Unread Count ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndRead(user, false);
    }

    // ── Mark One as Read ──────────────────────────────────────────────────────

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, User user) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification", notificationId
                ));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException(
                    "Notification", notificationId
            );
        }

        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    // ── Mark All as Read ──────────────────────────────────────────────────────

    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadByUser(user);
        log.info("All notifications marked as read for: {}", user.getEmail());
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    public NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}