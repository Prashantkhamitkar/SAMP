package com.samp.dto.response;

import com.samp.enums.EnrollmentStatus;
import com.samp.enums.LetterGrade;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {

    private Long id;

    // Student info
    private Long studentId;
    private String studentName;
    private String studentNumber;

    // Course info
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private String semester;
    private String facultyName;

    // Enrollment state
    private EnrollmentStatus status;
    private LetterGrade grade;
    private Double gradePoints;

    private LocalDateTime enrolledAt;
    private LocalDateTime updatedAt;
}