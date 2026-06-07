package com.samp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {

    private Long id;
    private String courseCode;
    private String courseName;
    private String description;
    private Integer credits;
    private Integer maxCapacity;
    private Integer enrolledCount;
    private Integer availableSeats;
    private String semester;
    private boolean active;
    private Long facultyId;
    private String facultyName;
    private LocalDateTime createdAt;
}