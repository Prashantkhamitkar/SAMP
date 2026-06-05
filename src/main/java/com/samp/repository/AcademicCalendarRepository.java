package com.samp.repository;

import com.samp.entity.AcademicCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicCalendarRepository extends JpaRepository<AcademicCalendar, Long> {
    Optional<AcademicCalendar> findBySemesterName(String semesterName);
    boolean existsBySemesterName(String semesterName);
    List<AcademicCalendar> findByPublished(boolean published);
    List<AcademicCalendar> findAllByOrderByStartDateDesc();
}