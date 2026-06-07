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
public class FacultyDashboardResponse {

    private String facultyName;
    private String department;
    private String title;
    private int totalCourses;
    private int totalStudentsEnrolled;
    private int pendingGradeEntries;
    private List<CourseResponse> myCourses;
}