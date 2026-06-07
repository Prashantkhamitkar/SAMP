package com.samp.repository;

import com.samp.entity.Course;
import com.samp.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    boolean existsByCourseCode(String courseCode);
    List<Course> findByActive(boolean active);
    List<Course> findByFaculty(Faculty faculty);
    List<Course> findByFacultyAndActive(Faculty faculty, boolean active);
    List<Course> findBySemester(String semester);
    boolean existsByCourseCodeAndIdNot(String courseCode, Long id);

    @Query("SELECT c FROM Course c " +
            "LEFT JOIN FETCH c.faculty f " +
            "LEFT JOIN FETCH f.user " +
            "WHERE c.active = true")
    List<Course> findAllActiveWithFaculty();

    @Query("SELECT c FROM Course c " +
            "LEFT JOIN FETCH c.faculty f " +
            "LEFT JOIN FETCH f.user")
    List<Course> findAllWithFaculty();
}