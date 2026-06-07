package com.samp.config;

import com.samp.entity.Faculty;
import com.samp.entity.Student;
import com.samp.entity.User;
import com.samp.enums.Role;
import com.samp.repository.FacultyRepository;
import com.samp.repository.StudentRepository;
import com.samp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedFaculty();
        seedStudent();
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@samp.edu")) return;

        User admin = User.builder()
                .firstName("System")
                .lastName("Administrator")
                .email("admin@samp.edu")
                .password(passwordEncoder.encode("Admin@1234"))
                .role(Role.ADMIN)
                .active(true)
                .build();

        userRepository.save(admin);
        log.info("── Seeded ADMIN  → admin@samp.edu / Admin@1234");
    }

    // ── Faculty ───────────────────────────────────────────────────────────────

    private void seedFaculty() {
        if (userRepository.existsByEmail("faculty@samp.edu")) return;

        User user = User.builder()
                .firstName("Mark")
                .lastName("Reha")
                .email("faculty@samp.edu")
                .password(passwordEncoder.encode("Faculty@1234"))
                .role(Role.FACULTY)
                .active(true)
                .build();

        user = userRepository.save(user);

        Faculty faculty = Faculty.builder()
                .user(user)
                .department("Computer Science")
                .title("Professor")
                .build();

        facultyRepository.save(faculty);
        log.info("── Seeded FACULTY → faculty@samp.edu / Faculty@1234");
    }

    // ── Student ───────────────────────────────────────────────────────────────

    private void seedStudent() {
        if (userRepository.existsByEmail("student@samp.edu")) return;

        User user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("student@samp.edu")
                .password(passwordEncoder.encode("Student@1234"))
                .role(Role.STUDENT)
                .active(true)
                .build();

        user = userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .studentId("STU-2024-001")
                .major("Computer Science")
                .year(2)
                .build();

        studentRepository.save(student);
        log.info("── Seeded STUDENT → student@samp.edu / Student@1234");
    }
}