package com.samp.service.impl;

import com.samp.dto.request.AcademicCalendarRequest;
import com.samp.dto.response.AcademicCalendarResponse;
import com.samp.entity.AcademicCalendar;
import com.samp.exception.BusinessException;
import com.samp.exception.DuplicateResourceException;
import com.samp.exception.ResourceNotFoundException;
import com.samp.repository.AcademicCalendarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcademicCalendarService {

    private final AcademicCalendarRepository calendarRepository;

    // ── Get All ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AcademicCalendarResponse> getAll() {
        return calendarRepository.findAllByOrderByStartDateDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get Published ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AcademicCalendarResponse> getPublished() {
        return calendarRepository.findByPublished(true)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get By ID ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AcademicCalendarResponse getById(Long id) {
        return toResponse(findById(id));
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public AcademicCalendarResponse create(AcademicCalendarRequest request) {

        if (calendarRepository.existsBySemesterName(
                request.getSemesterName())) {
            throw new DuplicateResourceException(
                    "Semester already exists: " + request.getSemesterName()
            );
        }

        validateDates(request);

        AcademicCalendar calendar = AcademicCalendar.builder()
                .semesterName(request.getSemesterName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .enrollmentOpenDate(request.getEnrollmentOpenDate())
                .enrollmentCloseDate(request.getEnrollmentCloseDate())
                .dropDeadline(request.getDropDeadline())
                .published(false)
                .build();

        AcademicCalendar saved = calendarRepository.save(calendar);
        log.info("Academic calendar created: {}", saved.getSemesterName());

        return toResponse(saved);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public AcademicCalendarResponse update(Long id,
                                           AcademicCalendarRequest request) {
        AcademicCalendar calendar = findById(id);

        if (calendar.isPublished()) {
            throw new BusinessException(
                    "Cannot edit a published semester calendar"
            );
        }

        validateDates(request);

        calendar.setSemesterName(request.getSemesterName());
        calendar.setStartDate(request.getStartDate());
        calendar.setEndDate(request.getEndDate());
        calendar.setEnrollmentOpenDate(request.getEnrollmentOpenDate());
        calendar.setEnrollmentCloseDate(request.getEnrollmentCloseDate());
        calendar.setDropDeadline(request.getDropDeadline());

        return toResponse(calendarRepository.save(calendar));
    }

    // ── Publish ───────────────────────────────────────────────────────────────

    @Transactional
    public AcademicCalendarResponse publish(Long id) {
        AcademicCalendar calendar = findById(id);
        calendar.setPublished(true);
        log.info("Semester published: {}", calendar.getSemesterName());
        return toResponse(calendarRepository.save(calendar));
    }

    // ── Unpublish ─────────────────────────────────────────────────────────────

    @Transactional
    public AcademicCalendarResponse unpublish(Long id) {
        AcademicCalendar calendar = findById(id);
        calendar.setPublished(false);
        log.info("Semester unpublished: {}", calendar.getSemesterName());
        return toResponse(calendarRepository.save(calendar));
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private AcademicCalendarResponse toResponse(AcademicCalendar c) {
        return AcademicCalendarResponse.builder()
                .id(c.getId())
                .semesterName(c.getSemesterName())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .enrollmentOpenDate(c.getEnrollmentOpenDate())
                .enrollmentCloseDate(c.getEnrollmentCloseDate())
                .dropDeadline(c.getDropDeadline())
                .published(c.isPublished())
                .createdAt(c.getCreatedAt())
                .build();
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private AcademicCalendar findById(Long id) {
        return calendarRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("AcademicCalendar", id));
    }

    private void validateDates(AcademicCalendarRequest r) {
        if (r.getEndDate().isBefore(r.getStartDate())) {
            throw new BusinessException(
                    "End date cannot be before start date"
            );
        }
        if (r.getDropDeadline().isAfter(r.getEndDate())) {
            throw new BusinessException(
                    "Drop deadline cannot be after semester end date"
            );
        }
        if (r.getEnrollmentCloseDate().isBefore(r.getEnrollmentOpenDate())) {
            throw new BusinessException(
                    "Enrollment close date cannot be before open date"
            );
        }
    }
}