package com.samp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicCalendarResponse {

    private Long id;
    private String semesterName;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate enrollmentOpenDate;
    private LocalDate enrollmentCloseDate;
    private LocalDate dropDeadline;
    private boolean published;
    private LocalDateTime createdAt;
}