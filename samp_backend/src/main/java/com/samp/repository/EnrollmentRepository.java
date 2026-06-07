package com.samp.repository;

import com.samp.entity.Course;
import com.samp.entity.Enrollment;
import com.samp.entity.Faculty;
import com.samp.entity.Student;
import com.samp.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByStudent(Student student);
    List<Enrollment> findByStudentAndStatus(Student student, EnrollmentStatus status);
    List<Enrollment> findByCourse(Course course);
    List<Enrollment> findByCourseAndStatus(Course course, EnrollmentStatus status);
    Optional<Enrollment> findByStudentAndCourse(Student student, Course course);
    boolean existsByStudentAndCourse(Student student, Course course);
    boolean existsByStudentAndCourseAndStatus(Student student, Course course, EnrollmentStatus status);

    @Query("SELECT COUNT(e) FROM Enrollment e " +
            "WHERE e.course = :course AND e.status = 'ACTIVE'")
    int countActiveEnrollmentsByCourse(@Param("course") Course course);

    @Query("SELECT e FROM Enrollment e " +
            "JOIN FETCH e.student s " +
            "JOIN FETCH s.user " +
            "JOIN FETCH e.course c " +
            "LEFT JOIN FETCH c.faculty f " +
            "LEFT JOIN FETCH f.user " +
            "WHERE e.course = :course AND e.status = 'ACTIVE'")
    List<Enrollment> findActiveEnrollmentsWithDetailsByCourse(@Param("course") Course course);

    @Query("SELECT e FROM Enrollment e " +
            "JOIN FETCH e.student s " +
            "JOIN FETCH s.user " +
            "JOIN FETCH e.course c " +
            "LEFT JOIN FETCH c.faculty f " +
            "LEFT JOIN FETCH f.user " +
            "WHERE s = :student")
    List<Enrollment> findAllEnrollmentsWithDetailsByStudent(@Param("student") Student student);

    @Query("SELECT e FROM Enrollment e " +
            "JOIN FETCH e.student s " +
            "JOIN FETCH s.user " +
            "JOIN FETCH e.course c " +
            "LEFT JOIN FETCH c.faculty f " +
            "LEFT JOIN FETCH f.user")
    List<Enrollment> findAllWithDetails();

    @Query("SELECT COUNT(e) FROM Enrollment e " +
            "JOIN e.course c " +
            "JOIN c.faculty f " +
            "WHERE f = :faculty AND e.grade IS NULL AND e.status = 'ACTIVE'")
    int countPendingGradesByFaculty(@Param("faculty") Faculty faculty);
}