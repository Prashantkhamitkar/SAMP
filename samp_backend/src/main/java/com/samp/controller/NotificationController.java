package com.samp.controller;

import com.samp.dto.response.ApiResponse;
import com.samp.dto.response.NotificationResponse;
import com.samp.entity.User;
import com.samp.service.impl.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification endpoints for all roles")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all my notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAll(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        notificationService.getAllNotifications(user)
                )
        );
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications only")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnread(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        notificationService.getUnreadNotifications(user)
                )
        );
    }

    @GetMapping("/unread/count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        notificationService.getUnreadCount(user)
                )
        );
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notification marked as read",
                        notificationService.markAsRead(id, user)
                )
        );
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal User user) {

        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(
                ApiResponse.success("All notifications marked as read")
        );
    }
}