package com.samp.service.impl;

import com.samp.dto.request.CourseRequest;
import com.samp.dto.response.CourseResponse;
import com.samp.entity.Course;
import com.samp.entity.Faculty;
import com.samp.entity.User;
import com.samp.exception.BusinessException;
import com.samp.exception.DuplicateResourceException;
import com.samp.exception.ResourceNotFoundException;
import com.samp.repository.CourseRepository;
import com.samp.repository.EnrollmentRepository;
import com.samp.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

    private final CourseRepository courseRepository;
    private final FacultyRepository facultyRepository;
    private final EnrollmentRepository enrollmentRepository;

    // ── Get All Active (Student view) ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllActiveCourses() {
        return courseRepository.findAllActiveWithFaculty()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get All (Admin view) ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAllWithFaculty()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get By ID ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        return toResponse(findById(id));
    }

    // ── Get Faculty Courses ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CourseResponse> getFacultyCourses(User facultyUser) {
        Faculty faculty = findFacultyByUser(facultyUser);
        return courseRepository.findByFaculty(faculty)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Create Course ─────────────────────────────────────────────────────────

    @Transactional
    public CourseResponse createCourse(CourseRequest request, User creatorUser) {

        if (courseRepository.existsByCourseCode(
                request.getCourseCode().toUpperCase())) {
            throw new DuplicateResourceException(
                    "Course code already exists: " + request.getCourseCode()
            );
        }

        Faculty faculty = resolveFaculty(request, creatorUser);

        Course course = Course.builder()
                .courseCode(request.getCourseCode().toUpperCase())
                .courseName(request.getCourseName())
                .description(request.getDescription())
                .credits(request.getCredits())
                .maxCapacity(request.getMaxCapacity())
                .semester(request.getSemester())
                .active(true)
                .faculty(faculty)
                .build();

        Course saved = courseRepository.save(course);
        log.info("Course created: {} by {}", saved.getCourseCode(),
                creatorUser.getEmail());

        return toResponse(saved);
    }

    // ── Update Course ─────────────────────────────────────────────────────────

    @Transactional
    public CourseResponse updateCourse(Long id,
                                       CourseRequest request,
                                       User updaterUser) {

        Course course = findById(id);

        if (courseRepository.existsByCourseCodeAndIdNot(
                request.getCourseCode().toUpperCase(), id)) {
            throw new DuplicateResourceException(
                    "Course code already exists: " + request.getCourseCode()
            );
        }

        int activeEnrollments =
                enrollmentRepository.countActiveEnrollmentsByCourse(course);
        if (request.getMaxCapacity() < activeEnrollments) {
            throw new BusinessException(
                    "Cannot reduce capacity below current enrollment count ("
                            + activeEnrollments + ")"
            );
        }

        course.setCourseCode(request.getCourseCode().toUpperCase());
        course.setCourseName(request.getCourseName());
        course.setDescription(request.getDescription());
        course.setCredits(request.getCredits());
        course.setMaxCapacity(request.getMaxCapacity());
        course.setSemester(request.getSemester());
        course.setFaculty(resolveFaculty(request, updaterUser));

        log.info("Course updated: {} by {}",
                course.getCourseCode(), updaterUser.getEmail());

        return toResponse(courseRepository.save(course));
    }

    // ── Toggle Active ─────────────────────────────────────────────────────────

    @Transactional
    public CourseResponse toggleActive(Long id) {
        Course course = findById(id);
        course.setActive(!course.isActive());
        log.info("Course {} active status set to: {}",
                course.getCourseCode(), course.isActive());
        return toResponse(courseRepository.save(course));
    }

    // ── Delete Course ─────────────────────────────────────────────────────────

    @Transactional
    public void deleteCourse(Long id) {
        Course course = findById(id);
        int active = enrollmentRepository.countActiveEnrollmentsByCourse(course);
        if (active > 0) {
            throw new BusinessException(
                    "Cannot delete course with " + active
                            + " active enrollments. Deactivate it instead."
            );
        }
        courseRepository.delete(course);
        log.info("Course deleted: {}", course.getCourseCode());
    }

    // ── Public Finder (used by EnrollmentService) ─────────────────────────────

    public Course findById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Course", id));
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    public CourseResponse toResponse(Course course) {
        int enrolled = enrollmentRepository
                .countActiveEnrollmentsByCourse(course);
        return CourseResponse.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .description(course.getDescription())
                .credits(course.getCredits())
                .maxCapacity(course.getMaxCapacity())
                .enrolledCount(enrolled)
                .availableSeats(course.getMaxCapacity() - enrolled)
                .semester(course.getSemester())
                .active(course.isActive())
                .facultyId(course.getFaculty() != null
                        ? course.getFaculty().getId() : null)
                .facultyName(course.getFaculty() != null
                        ? course.getFaculty().getUser().getFullName() : "TBA")
                .createdAt(course.getCreatedAt())
                .build();
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private Faculty resolveFaculty(CourseRequest request, User user) {
        if (request.getFacultyId() != null) {
            return facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Faculty", request.getFacultyId()));
        }
        return facultyRepository.findByUser(user).orElse(null);
    }

    private Faculty findFacultyByUser(User user) {
        return facultyRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Faculty profile not found for user: "
                                        + user.getEmail()));
    }
}