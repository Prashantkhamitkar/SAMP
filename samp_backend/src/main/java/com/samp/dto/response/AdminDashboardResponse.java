package com.samp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalStudents;
    private long totalFaculty;
    private long totalCourses;
    private long totalActiveCourses;
    private long totalActiveEnrollments;
    private long totalUsers;
}