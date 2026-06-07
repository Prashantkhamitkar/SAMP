package com.samp.controller;

import com.samp.dto.request.CourseRequest;
import com.samp.dto.request.GradeRequest;
import com.samp.dto.request.UpdateProfileRequest;
import com.samp.dto.response.*;
import com.samp.entity.User;
import com.samp.repository.FacultyRepository;
import com.samp.service.impl.CourseService;
import com.samp.service.impl.EnrollmentService;
import com.samp.service.impl.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/faculty")
@RequiredArgsConstructor
@Tag(name = "Faculty", description = "Faculty endpoints")
public class FacultyController {

    private final CourseService courseService;
    private final EnrollmentService enrollmentService;
    private final UserService userService;
    private final FacultyRepository facultyRepository;

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    @Operation(summary = "Get faculty dashboard data")
    public ResponseEntity<ApiResponse<FacultyDashboardResponse>> dashboard(
            @AuthenticationPrincipal User user) {

        List<CourseResponse> courses =
                courseService.getFacultyCourses(user);

        int totalStudents = courses.stream()
                .mapToInt(CourseResponse::getEnrolledCount)
                .sum();

        int pendingGrades = facultyRepository.findByUser(user)
                .map(f -> enrollmentService
                        .getCourseRosterAllCourses(f).stream()
                        .filter(e -> e.getGrade() == null)
                        .toList().size())
                .orElse(0);

        FacultyDashboardResponse dashboard =
                FacultyDashboardResponse.builder()
                        .facultyName(user.getFullName())
                        .totalCourses(courses.size())
                        .totalStudentsEnrolled(totalStudents)
                        .pendingGradeEntries(pendingGrades)
                        .myCourses(courses)
                        .build();

        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    // ── My Courses ────────────────────────────────────────────────────────────

    @GetMapping("/courses")
    @Operation(summary = "Get my assigned courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getMyCourses(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(courseService.getFacultyCourses(user))
        );
    }

    // ── Create Course ─────────────────────────────────────────────────────────

    @PostMapping("/courses")
    @Operation(summary = "Create a new course")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal User user) {

        CourseResponse response =
                courseService.createCourse(request, user);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Course created successfully", response
                ));
    }

    // ── Update Course ─────────────────────────────────────────────────────────

    @PutMapping("/courses/{id}")
    @Operation(summary = "Update course details")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal User user) {

        CourseResponse response =
                courseService.updateCourse(id, request, user);
        return ResponseEntity.ok(
                ApiResponse.success("Course updated successfully", response)
        );
    }

    // ── Course Roster ─────────────────────────────────────────────────────────

    @GetMapping("/courses/{courseId}/roster")
    @Operation(summary = "Get active student roster for a course")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getRoster(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        enrollmentService.getCourseRoster(courseId, user)
                )
        );
    }

    // ── Enter Grade ───────────────────────────────────────────────────────────

    @PatchMapping("/grades")
    @Operation(summary = "Enter or update a student grade")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enterGrade(
            @Valid @RequestBody GradeRequest request,
            @AuthenticationPrincipal User user) {

        EnrollmentResponse response =
                enrollmentService.enterGrade(request, user);
        return ResponseEntity.ok(
                ApiResponse.success("Grade saved successfully", response)
        );
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    @GetMapping("/profile")
    @Operation(summary = "Get my profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(userService.toResponse(user))
        );
    }

    @PutMapping("/profile")
    @Operation(summary = "Update my profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile updated successfully",
                        userService.updateProfile(user, request)
                )
        );
    }
}