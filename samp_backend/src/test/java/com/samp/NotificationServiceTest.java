package com.samp;

import com.samp.dto.response.NotificationResponse;
import com.samp.entity.Notification;
import com.samp.entity.User;
import com.samp.enums.NotificationType;
import com.samp.enums.Role;
import com.samp.exception.ResourceNotFoundException;
import com.samp.repository.NotificationRepository;
import com.samp.service.impl.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Tests")
class NotificationServiceTest {

    @Mock NotificationRepository notificationRepository;

    @InjectMocks NotificationService notificationService;

    private User         mockUser;
    private Notification unreadNotif;
    private Notification readNotif;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).email("student@samp.edu")
                .role(Role.STUDENT).active(true).build();

        unreadNotif = Notification.builder().id(1L).user(mockUser)
                .message("Grade posted: A in CS101")
                .type(NotificationType.GRADE_POSTED)
                .read(false).build();

        readNotif = Notification.builder().id(2L).user(mockUser)
                .message("You enrolled in CS202")
                .type(NotificationType.ENROLLMENT_CONFIRMED)
                .read(true).build();
    }

    // ── getAllNotifications ────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllNotifications — returns all sorted by date")
    void getAllNotifications_returnsList() {
        when(notificationRepository.findByUserOrderByCreatedAtDesc(mockUser))
                .thenReturn(List.of(unreadNotif, readNotif));

        List<NotificationResponse> result =
                notificationService.getAllNotifications(mockUser);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getMessage()).isEqualTo("Grade posted: A in CS101");
    }

    // ── getUnreadNotifications ─────────────────────────────────────────────────

    @Test
    @DisplayName("getUnreadNotifications — returns only unread")
    void getUnreadNotifications_returnsOnlyUnread() {
        when(notificationRepository.findByUserAndReadOrderByCreatedAtDesc(mockUser, false))
                .thenReturn(List.of(unreadNotif));

        List<NotificationResponse> result =
                notificationService.getUnreadNotifications(mockUser);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isRead()).isFalse();
    }

    // ── getUnreadCount ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("getUnreadCount — returns correct count")
    void getUnreadCount_returnsCount() {
        when(notificationRepository.countByUserAndRead(mockUser, false)).thenReturn(3L);

        long count = notificationService.getUnreadCount(mockUser);

        assertThat(count).isEqualTo(3L);
    }

    // ── markAsRead ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("markAsRead — sets read=true on notification")
    void markAsRead_setsReadTrue() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(unreadNotif));
        when(notificationRepository.save(unreadNotif)).thenReturn(unreadNotif);

        NotificationResponse response =
                notificationService.markAsRead(1L, mockUser);

        assertThat(unreadNotif.isRead()).isTrue();
        assertThat(response.isRead()).isTrue();
        verify(notificationRepository).save(unreadNotif);
    }

    @Test
    @DisplayName("markAsRead — notification not found throws ResourceNotFoundException")
    void markAsRead_notFound_throws() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(99L, mockUser))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("markAsRead — wrong user throws ResourceNotFoundException")
    void markAsRead_wrongUser_throws() {
        User otherUser = User.builder().id(99L).email("other@test.com").build();
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(unreadNotif));

        assertThatThrownBy(() -> notificationService.markAsRead(1L, otherUser))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── markAllAsRead ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("markAllAsRead — calls bulk update query")
    void markAllAsRead_callsBulkUpdate() {
        notificationService.markAllAsRead(mockUser);

        verify(notificationRepository).markAllAsReadByUser(mockUser);
    }

    // ── sendNotification ───────────────────────────────────────────────────────

    @Test
    @DisplayName("sendNotification — saves notification to repository")
    void sendNotification_savesNotification() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(unreadNotif);

        notificationService.sendNotification(
                mockUser, "Test message", NotificationType.GENERAL);

        verify(notificationRepository).save(any(Notification.class));
    }
}