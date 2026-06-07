package com.samp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AcademicCalendarRequest {

    @NotBlank(message = "Semester name is required")
    private String semesterName;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Enrollment open date is required")
    private LocalDate enrollmentOpenDate;

    @NotNull(message = "Enrollment close date is required")
    private LocalDate enrollmentCloseDate;

    @NotNull(message = "Drop deadline is required")
    private LocalDate dropDeadline;
}