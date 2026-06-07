package com.samp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardResponse {

    private String studentName;
    private String studentNumber;
    private String major;
    private Integer year;
    private Double gpa;
    private int activeEnrollments;
    private int completedCourses;
    private int totalCreditsEarned;
    private long unreadNotifications;
    private List<NotificationResponse> recentNotifications;
    private List<EnrollmentResponse> currentEnrollments;
}