package com.samp;

import com.samp.dto.request.AcademicCalendarRequest;
import com.samp.dto.response.AcademicCalendarResponse;
import com.samp.entity.AcademicCalendar;
import com.samp.exception.BusinessException;
import com.samp.exception.DuplicateResourceException;
import com.samp.exception.ResourceNotFoundException;
import com.samp.repository.AcademicCalendarRepository;
import com.samp.service.impl.AcademicCalendarService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AcademicCalendarService Tests")
class AcademicCalendarServiceTest {

    @Mock AcademicCalendarRepository calendarRepository;

    @InjectMocks AcademicCalendarService calendarService;

    private AcademicCalendar      calendar;
    private AcademicCalendarRequest request;

    @BeforeEach
    void setUp() {
        calendar = AcademicCalendar.builder()
                .id(1L).semesterName("Fall 2026")
                .startDate(LocalDate.of(2026, 8, 24))
                .endDate(LocalDate.of(2026, 12, 15))
                .enrollmentOpenDate(LocalDate.of(2026, 7, 1))
                .enrollmentCloseDate(LocalDate.of(2026, 8, 31))
                .dropDeadline(LocalDate.of(2026, 9, 15))
                .published(false).build();

        request = new AcademicCalendarRequest();
        request.setSemesterName("Fall 2026");
        request.setStartDate(LocalDate.of(2026, 8, 24));
        request.setEndDate(LocalDate.of(2026, 12, 15));
        request.setEnrollmentOpenDate(LocalDate.of(2026, 7, 1));
        request.setEnrollmentCloseDate(LocalDate.of(2026, 8, 31));
        request.setDropDeadline(LocalDate.of(2026, 9, 15));
    }

    // ── create ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create — success with valid dates")
    void create_success() {
        when(calendarRepository.existsBySemesterName("Fall 2026")).thenReturn(false);
        when(calendarRepository.save(any())).thenReturn(calendar);

        AcademicCalendarResponse response = calendarService.create(request);

        assertThat(response.getSemesterName()).isEqualTo("Fall 2026");
        assertThat(response.isPublished()).isFalse();
        verify(calendarRepository).save(any(AcademicCalendar.class));
    }

    @Test
    @DisplayName("create — duplicate semester name throws DuplicateResourceException")
    void create_duplicateName_throws() {
        when(calendarRepository.existsBySemesterName("Fall 2026")).thenReturn(true);

        assertThatThrownBy(() -> calendarService.create(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Semester already exists");
    }

    @Test
    @DisplayName("create — end date before start date throws BusinessException")
    void create_endBeforeStart_throws() {
        request.setEndDate(LocalDate.of(2026, 1, 1)); // before start

        when(calendarRepository.existsBySemesterName(any())).thenReturn(false);

        assertThatThrownBy(() -> calendarService.create(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("End date cannot be before start date");
    }

    @Test
    @DisplayName("create — drop deadline after end date throws BusinessException")
    void create_dropDeadlineAfterEnd_throws() {
        request.setDropDeadline(LocalDate.of(2027, 1, 1)); // after end

        when(calendarRepository.existsBySemesterName(any())).thenReturn(false);

        assertThatThrownBy(() -> calendarService.create(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Drop deadline cannot be after semester end date");
    }

    @Test
    @DisplayName("create — enrollment close before open throws BusinessException")
    void create_enrollmentCloseBeforeOpen_throws() {
        request.setEnrollmentCloseDate(LocalDate.of(2026, 1, 1)); // before open

        when(calendarRepository.existsBySemesterName(any())).thenReturn(false);

        assertThatThrownBy(() -> calendarService.create(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Enrollment close date cannot be before open date");
    }

    // ── publish ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("publish — sets published=true")
    void publish_setsPublishedTrue() {
        when(calendarRepository.findById(1L)).thenReturn(Optional.of(calendar));
        when(calendarRepository.save(any())).thenReturn(calendar);

        AcademicCalendarResponse response = calendarService.publish(1L);

        assertThat(calendar.isPublished()).isTrue();
        verify(calendarRepository).save(calendar);
    }

    @Test
    @DisplayName("publish — not found throws ResourceNotFoundException")
    void publish_notFound_throws() {
        when(calendarRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> calendarService.publish(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── unpublish ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("unpublish — sets published=false")
    void unpublish_setsPublishedFalse() {
        calendar.setPublished(true);
        when(calendarRepository.findById(1L)).thenReturn(Optional.of(calendar));
        when(calendarRepository.save(any())).thenReturn(calendar);

        calendarService.unpublish(1L);

        assertThat(calendar.isPublished()).isFalse();
    }

    // ── update ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("update — published calendar throws BusinessException")
    void update_publishedCalendar_throws() {
        calendar.setPublished(true);
        when(calendarRepository.findById(1L)).thenReturn(Optional.of(calendar));

        assertThatThrownBy(() -> calendarService.update(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Cannot edit a published semester calendar");
    }

    // ── getAll ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAll — returns all calendars sorted by date desc")
    void getAll_returnsList() {
        when(calendarRepository.findAllByOrderByStartDateDesc())
                .thenReturn(List.of(calendar));

        List<AcademicCalendarResponse> result = calendarService.getAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSemesterName()).isEqualTo("Fall 2026");
    }
}