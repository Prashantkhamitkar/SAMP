package com.samp;

import com.samp.dto.request.CourseRequest;
import com.samp.dto.response.CourseResponse;
import com.samp.entity.Course;
import com.samp.entity.Faculty;
import com.samp.entity.User;
import com.samp.enums.Role;
import com.samp.exception.BusinessException;
import com.samp.exception.DuplicateResourceException;
import com.samp.exception.ResourceNotFoundException;
import com.samp.repository.CourseRepository;
import com.samp.repository.EnrollmentRepository;
import com.samp.repository.FacultyRepository;
import com.samp.service.impl.CourseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CourseService Tests")
class CourseServiceTest {

    @Mock CourseRepository     courseRepository;
    @Mock FacultyRepository    facultyRepository;
    @Mock EnrollmentRepository enrollmentRepository;

    @InjectMocks CourseService courseService;

    private User    facultyUser;
    private Faculty faculty;
    private Course  course;

    @BeforeEach
    void setUp() {
        facultyUser = User.builder()
                .id(1L).email("faculty@samp.edu")
                .role(Role.FACULTY).active(true).build();

        faculty = Faculty.builder()
                .id(1L).user(facultyUser)
                .department("CS").title("Professor").build();

        course = Course.builder()
                .id(1L).courseCode("CS101")
                .courseName("Data Structures")
                .credits(3).maxCapacity(30)
                .semester("Fall 2026")
                .active(true).faculty(faculty).build();
    }

    // ── getAllActiveCourses ─────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllActiveCourses — returns list of active course responses")
    void getAllActiveCourses_returnsList() {
        when(courseRepository.findAllActiveWithFaculty()).thenReturn(List.of(course));
        when(enrollmentRepository.countActiveEnrollmentsByCourse(course)).thenReturn(5);

        List<CourseResponse> result = courseService.getAllActiveCourses();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCourseCode()).isEqualTo("CS101");
        assertThat(result.get(0).getEnrolledCount()).isEqualTo(5);
        assertThat(result.get(0).getAvailableSeats()).isEqualTo(25);
    }

    @Test
    @DisplayName("getAllActiveCourses — empty list when no active courses")
    void getAllActiveCourses_emptyList() {
        when(courseRepository.findAllActiveWithFaculty()).thenReturn(List.of());

        List<CourseResponse> result = courseService.getAllActiveCourses();

        assertThat(result).isEmpty();
    }

    // ── createCourse ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("createCourse — success with valid data")
    void createCourse_success() {
        CourseRequest req = new CourseRequest();
        req.setCourseCode("cs202");
        req.setCourseName("Algorithms");
        req.setCredits(3);
        req.setMaxCapacity(25);
        req.setSemester("Fall 2026");

        when(courseRepository.existsByCourseCode("CS202")).thenReturn(false);
        when(facultyRepository.findByUser(facultyUser)).thenReturn(Optional.of(faculty));
        when(courseRepository.save(any(Course.class))).thenReturn(course);
        when(enrollmentRepository.countActiveEnrollmentsByCourse(any())).thenReturn(0);

        CourseResponse response = courseService.createCourse(req, facultyUser);

        assertThat(response).isNotNull();
        verify(courseRepository).save(any(Course.class));
    }

    @Test
    @DisplayName("createCourse — duplicate course code throws DuplicateResourceException")
    void createCourse_duplicateCode_throws() {
        CourseRequest req = new CourseRequest();
        req.setCourseCode("CS101");
        req.setCourseName("Duplicate");
        req.setCredits(3);
        req.setMaxCapacity(30);
        req.setSemester("Fall 2026");

        when(courseRepository.existsByCourseCode("CS101")).thenReturn(true);

        assertThatThrownBy(() -> courseService.createCourse(req, facultyUser))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Course code already exists");

        verify(courseRepository, never()).save(any());
    }

    @Test
    @DisplayName("createCourse — course code auto-uppercased")
    void createCourse_codeUppercased() {
        CourseRequest req = new CourseRequest();
        req.setCourseCode("cs303");
        req.setCourseName("Test Course");
        req.setCredits(3);
        req.setMaxCapacity(30);
        req.setSemester("Fall 2026");

        when(courseRepository.existsByCourseCode("CS303")).thenReturn(false);
        when(facultyRepository.findByUser(facultyUser)).thenReturn(Optional.of(faculty));
        when(courseRepository.save(any())).thenReturn(course);
        when(enrollmentRepository.countActiveEnrollmentsByCourse(any())).thenReturn(0);

        courseService.createCourse(req, facultyUser);

        verify(courseRepository).existsByCourseCode("CS303");
    }

    // ── updateCourse ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateCourse — capacity below enrollment count throws BusinessException")
    void updateCourse_capacityBelowEnrollment_throws() {
        CourseRequest req = new CourseRequest();
        req.setCourseCode("CS101");
        req.setCourseName("Data Structures");
        req.setCredits(3);
        req.setMaxCapacity(2);   // lower than current enrollment
        req.setSemester("Fall 2026");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(courseRepository.existsByCourseCodeAndIdNot("CS101", 1L)).thenReturn(false);
        when(enrollmentRepository.countActiveEnrollmentsByCourse(course)).thenReturn(10);

        assertThatThrownBy(() -> courseService.updateCourse(1L, req, facultyUser))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Cannot reduce capacity below current enrollment count");
    }

    // ── deleteCourse ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteCourse — success when no active enrollments")
    void deleteCourse_noEnrollments_success() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.countActiveEnrollmentsByCourse(course)).thenReturn(0);

        courseService.deleteCourse(1L);

        verify(courseRepository).delete(course);
    }

    @Test
    @DisplayName("deleteCourse — has active enrollments throws BusinessException")
    void deleteCourse_withEnrollments_throws() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.countActiveEnrollmentsByCourse(course)).thenReturn(5);

        assertThatThrownBy(() -> courseService.deleteCourse(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Cannot delete course with");

        verify(courseRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteCourse — course not found throws ResourceNotFoundException")
    void deleteCourse_notFound_throws() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.deleteCourse(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── toggleActive ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("toggleActive — active course becomes inactive")
    void toggleActive_activeToInactive() {
        course.setActive(true);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(courseRepository.save(any())).thenReturn(course);
        when(enrollmentRepository.countActiveEnrollmentsByCourse(any())).thenReturn(0);

        courseService.toggleActive(1L);

        assertThat(course.isActive()).isFalse();
        verify(courseRepository).save(course);
    }

    @Test
    @DisplayName("toggleActive — inactive course becomes active")
    void toggleActive_inactiveToActive() {
        course.setActive(false);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(courseRepository.save(any())).thenReturn(course);
        when(enrollmentRepository.countActiveEnrollmentsByCourse(any())).thenReturn(0);

        courseService.toggleActive(1L);

        assertThat(course.isActive()).isTrue();
    }
}