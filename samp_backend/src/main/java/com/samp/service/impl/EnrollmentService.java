package com.samp.service.impl;

import com.samp.dto.request.GradeRequest;
import com.samp.dto.response.EnrollmentResponse;
import com.samp.entity.*;
import com.samp.enums.EnrollmentStatus;
import com.samp.enums.NotificationType;
import com.samp.exception.BusinessException;
import com.samp.exception.DuplicateResourceException;
import com.samp.exception.ResourceNotFoundException;
import com.samp.repository.EnrollmentRepository;
import com.samp.repository.FacultyRepository;
import com.samp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final CourseService courseService;
    private final NotificationService notificationService;

    // ── Student: Enroll ───────────────────────────────────────────────────────

    @Transactional
    public EnrollmentResponse enroll(Long courseId, User studentUser) {

        Student student = findStudentByUser(studentUser);
        Course course   = courseService.findById(courseId);

        if (!course.isActive()) {
            throw new BusinessException(
                    "Course is not active for enrollment"
            );
        }

        if (enrollmentRepository.existsByStudentAndCourseAndStatus(
                student, course, EnrollmentStatus.ACTIVE)) {
            throw new DuplicateResourceException(
                    "You are already enrolled in: " + course.getCourseName()
            );
        }

        int activeCount =
                enrollmentRepository.countActiveEnrollmentsByCourse(course);
        if (activeCount >= course.getMaxCapacity()) {
            throw new BusinessException(
                    "Course is full. No available seats."
            );
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .status(EnrollmentStatus.ACTIVE)
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        log.info("Student {} enrolled in {}",
                studentUser.getEmail(), course.getCourseCode());

        notificationService.sendNotification(
                studentUser,
                "Successfully enrolled in: " + course.getCourseName()
                        + " (" + course.getCourseCode() + ")",
                NotificationType.ENROLLMENT_CONFIRMED
        );

        return toResponse(enrollment);
    }

    // ── Student: Drop ─────────────────────────────────────────────────────────

    @Transactional
    public EnrollmentResponse drop(Long courseId, User studentUser) {

        Student student = findStudentByUser(studentUser);
        Course course   = courseService.findById(courseId);

        Enrollment enrollment = enrollmentRepository
                .findByStudentAndCourse(student, course)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Enrollment not found for this course"
                ));

        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
            throw new BusinessException(
                    "You are not actively enrolled in this course"
            );
        }

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollment = enrollmentRepository.save(enrollment);
        log.info("Student {} dropped {}",
                studentUser.getEmail(), course.getCourseCode());

        notificationService.sendNotification(
                studentUser,
                "Successfully dropped: " + course.getCourseName()
                        + " (" + course.getCourseCode() + ")",
                NotificationType.COURSE_DROPPED
        );

        return toResponse(enrollment);
    }

    // ── Student: My Enrollments ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments(User studentUser) {
        Student student = findStudentByUser(studentUser);
        return enrollmentRepository
                .findAllEnrollmentsWithDetailsByStudent(student)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Student: Active Enrollments Only ──────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyActiveEnrollments(User studentUser) {
        Student student = findStudentByUser(studentUser);
        return enrollmentRepository
                .findByStudentAndStatus(student, EnrollmentStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Student: GPA Calculation ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public double calculateGpa(User studentUser) {

        Student student = findStudentByUser(studentUser);

        List<Enrollment> graded = enrollmentRepository
                .findByStudent(student)
                .stream()
                .filter(e -> e.getGrade() != null)
                .collect(Collectors.toList());

        if (graded.isEmpty()) return 0.0;

        double totalPoints = 0.0;
        int totalCredits   = 0;

        for (Enrollment e : graded) {
            int credits = e.getCourse().getCredits();
            totalPoints  += e.getGrade().getGradePoints() * credits;
            totalCredits += credits;
        }

        if (totalCredits == 0) return 0.0;

        return Math.round((totalPoints / totalCredits) * 100.0) / 100.0;
    }

    // ── Student: Credits Earned ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public int calculateCreditsEarned(User studentUser) {
        Student student = findStudentByUser(studentUser);
        return enrollmentRepository
                .findByStudentAndStatus(student, EnrollmentStatus.COMPLETED)
                .stream()
                .filter(e -> e.getGrade() != null
                        && e.getGrade().getGradePoints() > 0)
                .mapToInt(e -> e.getCourse().getCredits())
                .sum();
    }

    // ── Faculty: Course Roster ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getCourseRoster(Long courseId,
                                                    User facultyUser) {
        Faculty faculty = findFacultyByUser(facultyUser);
        Course course   = courseService.findById(courseId);

        if (course.getFaculty() == null
                || !course.getFaculty().getId().equals(faculty.getId())) {
            throw new BusinessException(
                    "You are not the instructor of this course"
            );
        }

        return enrollmentRepository
                .findActiveEnrollmentsWithDetailsByCourse(course)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Faculty: Enter Grade ──────────────────────────────────────────────────

    @Transactional
    public EnrollmentResponse enterGrade(GradeRequest request,
                                         User facultyUser) {

        Faculty faculty = findFacultyByUser(facultyUser);

        Enrollment enrollment = enrollmentRepository
                .findById(request.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Enrollment", request.getEnrollmentId()
                ));

        Course course = enrollment.getCourse();

        if (course.getFaculty() == null
                || !course.getFaculty().getId().equals(faculty.getId())) {
            throw new BusinessException(
                    "You are not authorized to grade students in this course"
            );
        }

        boolean isUpdate = enrollment.getGrade() != null;
        enrollment.setGrade(request.getGrade());
        enrollment = enrollmentRepository.save(enrollment);

        log.info("Grade {} entered for enrollment {} by {}",
                request.getGrade(),
                request.getEnrollmentId(),
                facultyUser.getEmail());

        NotificationType type = isUpdate
                ? NotificationType.GRADE_UPDATED
                : NotificationType.GRADE_POSTED;

        String msg = (isUpdate ? "Grade updated to " : "Grade posted: ")
                + request.getGrade().name()
                + " for " + course.getCourseName()
                + " (" + course.getCourseCode() + ")";

        notificationService.sendNotification(
                enrollment.getStudent().getUser(), msg, type
        );

        return toResponse(enrollment);
    }

    // ── Admin: All Enrollments ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentRepository.findAllWithDetails()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Admin: Enrollments By Course ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByCourse(Long courseId) {
        Course course = courseService.findById(courseId);
        return enrollmentRepository.findByCourse(course)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    public EnrollmentResponse toResponse(Enrollment e) {
        return EnrollmentResponse.builder()
                .id(e.getId())
                .studentId(e.getStudent().getId())
                .studentName(e.getStudent().getUser().getFullName())
                .studentNumber(e.getStudent().getStudentId())
                .courseId(e.getCourse().getId())
                .courseCode(e.getCourse().getCourseCode())
                .courseName(e.getCourse().getCourseName())
                .credits(e.getCourse().getCredits())
                .semester(e.getCourse().getSemester())
                .facultyName(e.getCourse().getFaculty() != null
                        ? e.getCourse().getFaculty().getUser().getFullName()
                        : "TBA")
                .status(e.getStatus())
                .grade(e.getGrade())
                .gradePoints(e.getGrade() != null
                        ? e.getGrade().getGradePoints() : null)
                .enrolledAt(e.getEnrolledAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private Student findStudentByUser(User user) {
        return studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student profile not found for: " + user.getEmail()
                ));
    }

    private Faculty findFacultyByUser(User user) {
        return facultyRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Faculty profile not found for: " + user.getEmail()
                ));
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getCourseRosterAllCourses(
            com.samp.entity.Faculty faculty) {

        return faculty.getCourses().stream()
                .flatMap(course -> enrollmentRepository
                        .findActiveEnrollmentsWithDetailsByCourse(course)
                        .stream())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

}