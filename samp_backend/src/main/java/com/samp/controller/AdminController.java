package com.samp.controller;

import com.samp.dto.request.AcademicCalendarRequest;
import com.samp.dto.request.CourseRequest;
import com.samp.dto.request.CreateUserRequest;
import com.samp.dto.response.*;
import com.samp.enums.Role;
import com.samp.service.impl.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrator endpoints")
public class AdminController {

    private final UserService userService;
    private final CourseService courseService;
    private final EnrollmentService enrollmentService;
    private final AcademicCalendarService calendarService;

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard stats")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {

        long totalStudents = userService
                .getUsersByRole(Role.STUDENT).size();
        long totalFaculty = userService
                .getUsersByRole(Role.FACULTY).size();
        long totalCourses = courseService
                .getAllCourses().size();
        long totalActive = courseService
                .getAllActiveCourses().size();
        long totalEnrollments = enrollmentService
                .getAllEnrollments().stream()
                .filter(e -> e.getStatus().name().equals("ACTIVE"))
                .count();

        AdminDashboardResponse response = AdminDashboardResponse.builder()
                .totalStudents(totalStudents)
                .totalFaculty(totalFaculty)
                .totalCourses(totalCourses)
                .totalActiveCourses(totalActive)
                .totalActiveEnrollments(totalEnrollments)
                .totalUsers(userService.getAllUsers().size())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "Get all users, optionally filtered by role")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers(
            @RequestParam(required = false) Role role) {

        List<UserResponse> users = role != null
                ? userService.getUsersByRole(role)
                : userService.getAllUsers();

        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(userService.getUserById(id))
        );
    }

    @PostMapping("/users")
    @Operation(summary = "Create a new user account")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        UserResponse response = userService.createUser(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "User created successfully", response
                ));
    }

    @PatchMapping("/users/{id}/deactivate")
    @Operation(summary = "Deactivate a user account")
    public ResponseEntity<ApiResponse<UserResponse>> deactivate(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User deactivated successfully",
                        userService.deactivateUser(id)
                )
        );
    }

    @PatchMapping("/users/{id}/activate")
    @Operation(summary = "Activate a user account")
    public ResponseEntity<ApiResponse<UserResponse>> activate(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User activated successfully",
                        userService.activateUser(id)
                )
        );
    }

    // ── Courses ───────────────────────────────────────────────────────────────

    @GetMapping("/courses")
    @Operation(summary = "Get all courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getCourses() {
        return ResponseEntity.ok(
                ApiResponse.success(courseService.getAllCourses())
        );
    }

    @PostMapping("/courses")
    @Operation(summary = "Create a new course")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CourseRequest request) {

        CourseResponse response =
                courseService.createCourse(request, null);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Course created successfully", response
                ));
    }

    @PutMapping("/courses/{id}")
    @Operation(summary = "Update a course")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Course updated successfully",
                        courseService.updateCourse(id, request, null)
                )
        );
    }

    @PatchMapping("/courses/{id}/toggle")
    @Operation(summary = "Toggle course active status")
    public ResponseEntity<ApiResponse<CourseResponse>> toggleCourse(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Course status updated",
                        courseService.toggleActive(id)
                )
        );
    }

    @DeleteMapping("/courses/{id}")
    @Operation(summary = "Delete a course with no active enrollments")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(
            @PathVariable Long id) {

        courseService.deleteCourse(id);
        return ResponseEntity.ok(
                ApiResponse.success("Course deleted successfully")
        );
    }

    // ── Enrollments ───────────────────────────────────────────────────────────

    @GetMapping("/enrollments")
    @Operation(summary = "Get all enrollments, optionally by course")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getEnrollments(
            @RequestParam(required = false) Long courseId) {

        List<EnrollmentResponse> enrollments = courseId != null
                ? enrollmentService.getEnrollmentsByCourse(courseId)
                : enrollmentService.getAllEnrollments();

        return ResponseEntity.ok(ApiResponse.success(enrollments));
    }

    // ── Academic Calendar ─────────────────────────────────────────────────────

    @GetMapping("/calendar")
    @Operation(summary = "Get all academic calendars")
    public ResponseEntity<ApiResponse<List<AcademicCalendarResponse>>> getCalendars() {
        return ResponseEntity.ok(
                ApiResponse.success(calendarService.getAll())
        );
    }

    @PostMapping("/calendar")
    @Operation(summary = "Create a new semester calendar")
    public ResponseEntity<ApiResponse<AcademicCalendarResponse>> createCalendar(
            @Valid @RequestBody AcademicCalendarRequest request) {

        AcademicCalendarResponse response =
                calendarService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Calendar created successfully", response
                ));
    }

    @PutMapping("/calendar/{id}")
    @Operation(summary = "Update a semester calendar")
    public ResponseEntity<ApiResponse<AcademicCalendarResponse>> updateCalendar(
            @PathVariable Long id,
            @Valid @RequestBody AcademicCalendarRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Calendar updated successfully",
                        calendarService.update(id, request)
                )
        );
    }

    @PatchMapping("/calendar/{id}/publish")
    @Operation(summary = "Publish a semester calendar")
    public ResponseEntity<ApiResponse<AcademicCalendarResponse>> publish(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Semester published successfully",
                        calendarService.publish(id)
                )
        );
    }

    @PatchMapping("/calendar/{id}/unpublish")
    @Operation(summary = "Unpublish a semester calendar")
    public ResponseEntity<ApiResponse<AcademicCalendarResponse>> unpublish(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Semester unpublished",
                        calendarService.unpublish(id)
                )
        );
    }
}