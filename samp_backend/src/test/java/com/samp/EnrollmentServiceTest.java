package com.samp;

import com.samp.dto.request.GradeRequest;
import com.samp.dto.response.EnrollmentResponse;
import com.samp.entity.*;
import com.samp.enums.EnrollmentStatus;
import com.samp.enums.LetterGrade;
import com.samp.enums.Role;
import com.samp.exception.BusinessException;
import com.samp.exception.DuplicateResourceException;
import com.samp.exception.ResourceNotFoundException;
import com.samp.repository.EnrollmentRepository;
import com.samp.repository.FacultyRepository;
import com.samp.repository.StudentRepository;
import com.samp.service.impl.CourseService;
import com.samp.service.impl.EnrollmentService;
import com.samp.service.impl.NotificationService;
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
@DisplayName("EnrollmentService Tests")
class EnrollmentServiceTest {

    @Mock EnrollmentRepository enrollmentRepository;
    @Mock StudentRepository    studentRepository;
    @Mock FacultyRepository    facultyRepository;
    @Mock CourseService        courseService;
    @Mock NotificationService  notificationService;

    @InjectMocks EnrollmentService enrollmentService;

    private User       studentUser;
    private Student    student;
    private User       facultyUser;
    private Faculty    faculty;
    private Course     course;
    private Enrollment enrollment;

    @BeforeEach
    void setUp() {
        studentUser = User.builder().id(1L).email("student@samp.edu")
                .firstName("John").lastName("Doe").role(Role.STUDENT).active(true).build();

        student = Student.builder().id(1L).user(studentUser).studentId("STU-001").build();

        facultyUser = User.builder().id(2L).email("faculty@samp.edu")
                .firstName("Dr").lastName("Smith").role(Role.FACULTY).active(true).build();

        faculty = Faculty.builder().id(1L).user(facultyUser)
                .department("CS").title("Professor").build();

        course = Course.builder().id(1L).courseCode("CS101")
                .courseName("Data Structures").credits(3)
                .maxCapacity(30).semester("Fall 2026")
                .active(true).faculty(faculty).build();

        enrollment = Enrollment.builder().id(1L).student(student)
                .course(course).status(EnrollmentStatus.ACTIVE).build();
    }

    // ── enroll ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("enroll — success creates enrollment with ACTIVE status")
    void enroll_success() {
        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(courseService.findById(1L)).thenReturn(course);
        when(enrollmentRepository.existsByStudentAndCourseAndStatus(
                student, course, EnrollmentStatus.ACTIVE)).thenReturn(false);
        when(enrollmentRepository.countActiveEnrollmentsByCourse(course)).thenReturn(5);
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(enrollment);

        EnrollmentResponse response = enrollmentService.enroll(1L, studentUser);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(EnrollmentStatus.ACTIVE);
        verify(enrollmentRepository).save(any(Enrollment.class));
        verify(notificationService).sendNotification(any(), any(), any());
    }

    @Test
    @DisplayName("enroll — course not active throws BusinessException")
    void enroll_courseNotActive_throws() {
        course.setActive(false);
        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(courseService.findById(1L)).thenReturn(course);

        assertThatThrownBy(() -> enrollmentService.enroll(1L, studentUser))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Course is not active");
    }

    @Test
    @DisplayName("enroll — already enrolled throws DuplicateResourceException")
    void enroll_alreadyEnrolled_throws() {
        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(courseService.findById(1L)).thenReturn(course);
        when(enrollmentRepository.existsByStudentAndCourseAndStatus(
                student, course, EnrollmentStatus.ACTIVE)).thenReturn(true);

        assertThatThrownBy(() -> enrollmentService.enroll(1L, studentUser))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already enrolled");

        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("enroll — course full throws BusinessException")
    void enroll_courseFull_throws() {
        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(courseService.findById(1L)).thenReturn(course);
        when(enrollmentRepository.existsByStudentAndCourseAndStatus(
                student, course, EnrollmentStatus.ACTIVE)).thenReturn(false);
        when(enrollmentRepository.countActiveEnrollmentsByCourse(course)).thenReturn(30);

        assertThatThrownBy(() -> enrollmentService.enroll(1L, studentUser))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Course is full");

        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("enroll — student profile not found throws ResourceNotFoundException")
    void enroll_studentNotFound_throws() {
        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> enrollmentService.enroll(1L, studentUser))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── drop ───────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("drop — success changes status to DROPPED")
    void drop_success() {
        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(courseService.findById(1L)).thenReturn(course);
        when(enrollmentRepository.findByStudentAndCourse(student, course))
                .thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any())).thenReturn(enrollment);

        EnrollmentResponse response = enrollmentService.drop(1L, studentUser);

        assertThat(enrollment.getStatus()).isEqualTo(EnrollmentStatus.DROPPED);
        verify(notificationService).sendNotification(any(), any(), any());
    }

    @Test
    @DisplayName("drop — already dropped throws BusinessException")
    void drop_alreadyDropped_throws() {
        enrollment.setStatus(EnrollmentStatus.DROPPED);
        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(courseService.findById(1L)).thenReturn(course);
        when(enrollmentRepository.findByStudentAndCourse(student, course))
                .thenReturn(Optional.of(enrollment));

        assertThatThrownBy(() -> enrollmentService.drop(1L, studentUser))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not actively enrolled");
    }

    @Test
    @DisplayName("drop — enrollment not found throws ResourceNotFoundException")
    void drop_notFound_throws() {
        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(courseService.findById(1L)).thenReturn(course);
        when(enrollmentRepository.findByStudentAndCourse(student, course))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> enrollmentService.drop(1L, studentUser))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── calculateGpa ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("calculateGpa — correct weighted average A+B+C = 3.00")
    void calculateGpa_weightedAverage() {
        Course c1 = Course.builder().id(2L).credits(3).build();
        Course c2 = Course.builder().id(3L).credits(3).build();
        Course c3 = Course.builder().id(4L).credits(3).build();

        Enrollment e1 = Enrollment.builder().course(c1).grade(LetterGrade.A)
                .status(EnrollmentStatus.ACTIVE).build();
        Enrollment e2 = Enrollment.builder().course(c2).grade(LetterGrade.B)
                .status(EnrollmentStatus.ACTIVE).build();
        Enrollment e3 = Enrollment.builder().course(c3).grade(LetterGrade.C)
                .status(EnrollmentStatus.ACTIVE).build();

        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByStudent(student)).thenReturn(List.of(e1, e2, e3));

        double gpa = enrollmentService.calculateGpa(studentUser);

        assertThat(gpa).isEqualTo(3.00);
    }

    @Test
    @DisplayName("calculateGpa — no grades returns 0.00")
    void calculateGpa_noGrades_returnsZero() {
        Enrollment e1 = Enrollment.builder().course(course).grade(null)
                .status(EnrollmentStatus.ACTIVE).build();

        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByStudent(student)).thenReturn(List.of(e1));

        double gpa = enrollmentService.calculateGpa(studentUser);

        assertThat(gpa).isEqualTo(0.0);
    }

    @Test
    @DisplayName("calculateGpa — empty enrollments returns 0.00 (no division by zero)")
    void calculateGpa_emptyEnrollments_returnsZero() {
        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByStudent(student)).thenReturn(List.of());

        double gpa = enrollmentService.calculateGpa(studentUser);

        assertThat(gpa).isEqualTo(0.0);
    }

    @Test
    @DisplayName("calculateGpa — all A grades returns 4.00")
    void calculateGpa_allAs_returnsFour() {
        Course c1 = Course.builder().id(2L).credits(3).build();
        Course c2 = Course.builder().id(3L).credits(3).build();

        Enrollment e1 = Enrollment.builder().course(c1).grade(LetterGrade.A)
                .status(EnrollmentStatus.ACTIVE).build();
        Enrollment e2 = Enrollment.builder().course(c2).grade(LetterGrade.A)
                .status(EnrollmentStatus.ACTIVE).build();

        when(studentRepository.findByUser(studentUser)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByStudent(student)).thenReturn(List.of(e1, e2));

        double gpa = enrollmentService.calculateGpa(studentUser);

        assertThat(gpa).isEqualTo(4.0);
    }

    // ── enterGrade ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("enterGrade — success posts grade and sends GRADE_POSTED notification")
    void enterGrade_success_postsGrade() {
        GradeRequest gradeRequest = new GradeRequest();
        gradeRequest.setEnrollmentId(1L);
        gradeRequest.setGrade(LetterGrade.A);

        when(facultyRepository.findByUser(facultyUser)).thenReturn(Optional.of(faculty));
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any())).thenReturn(enrollment);

        EnrollmentResponse response = enrollmentService.enterGrade(gradeRequest, facultyUser);

        assertThat(enrollment.getGrade()).isEqualTo(LetterGrade.A);
        verify(notificationService).sendNotification(any(), any(), any());
    }

    @Test
    @DisplayName("enterGrade — unauthorized faculty throws BusinessException")
    void enterGrade_unauthorizedFaculty_throws() {
        User otherFacultyUser = User.builder().id(99L).email("other@samp.edu")
                .role(Role.FACULTY).active(true).build();
        Faculty otherFaculty = Faculty.builder().id(99L).user(otherFacultyUser).build();

        GradeRequest gradeRequest = new GradeRequest();
        gradeRequest.setEnrollmentId(1L);
        gradeRequest.setGrade(LetterGrade.B);

        when(facultyRepository.findByUser(otherFacultyUser)).thenReturn(Optional.of(otherFaculty));
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));

        assertThatThrownBy(() -> enrollmentService.enterGrade(gradeRequest, otherFacultyUser))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not authorized to grade");
    }

    @Test
    @DisplayName("enterGrade — enrollment not found throws ResourceNotFoundException")
    void enterGrade_enrollmentNotFound_throws() {
        GradeRequest gradeRequest = new GradeRequest();
        gradeRequest.setEnrollmentId(99L);
        gradeRequest.setGrade(LetterGrade.A);

        when(facultyRepository.findByUser(facultyUser)).thenReturn(Optional.of(faculty));
        when(enrollmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> enrollmentService.enterGrade(gradeRequest, facultyUser))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── getCourseRoster ────────────────────────────────────────────────────────

    @Test
    @DisplayName("getCourseRoster — unauthorized faculty throws BusinessException")
    void getCourseRoster_wrongFaculty_throws() {
        User otherUser = User.builder().id(99L).email("other@samp.edu")
                .role(Role.FACULTY).active(true).build();
        Faculty otherFaculty = Faculty.builder().id(99L).user(otherUser).build();

        when(facultyRepository.findByUser(otherUser)).thenReturn(Optional.of(otherFaculty));
        when(courseService.findById(1L)).thenReturn(course);

        assertThatThrownBy(() -> enrollmentService.getCourseRoster(1L, otherUser))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not the instructor");
    }
}