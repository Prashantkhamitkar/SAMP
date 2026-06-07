package com.samp.service.impl;

import com.samp.dto.request.CreateUserRequest;
import com.samp.dto.request.UpdateProfileRequest;
import com.samp.dto.response.UserResponse;
import com.samp.entity.Faculty;
import com.samp.entity.Student;
import com.samp.entity.User;
import com.samp.enums.Role;
import com.samp.exception.BusinessException;
import com.samp.exception.DuplicateResourceException;
import com.samp.exception.ResourceNotFoundException;
import com.samp.repository.FacultyRepository;
import com.samp.repository.StudentRepository;
import com.samp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Get All Users ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get By Role ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get By ID ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toResponse(findById(id));
    }

    // ── Create User (Admin) ───────────────────────────────────────────────────

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already registered: " + request.getEmail()
            );
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        user = userRepository.save(user);

        if (request.getRole() == Role.STUDENT) {

            if (request.getStudentId() == null) {
                throw new BusinessException("Student ID is required");
            }
            if (studentRepository.existsByStudentId(request.getStudentId())) {
                throw new DuplicateResourceException(
                        "Student ID already exists: " + request.getStudentId()
                );
            }

            Student student = Student.builder()
                    .user(user)
                    .studentId(request.getStudentId())
                    .major(request.getMajor())
                    .year(request.getYear())
                    .build();

            studentRepository.save(student);

        } else if (request.getRole() == Role.FACULTY) {

            Faculty faculty = Faculty.builder()
                    .user(user)
                    .department(request.getDepartment())
                    .title(request.getTitle())
                    .build();

            facultyRepository.save(faculty);
        }

        log.info("User created: {} | Role: {}",
                user.getEmail(), user.getRole());

        return toResponse(user);
    }

    // ── Update Profile ────────────────────────────────────────────────────────

    @Transactional
    public UserResponse updateProfile(User currentUser,
                                      UpdateProfileRequest request) {

        if (request.getEmail() != null
                && !request.getEmail().equals(currentUser.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already in use: " + request.getEmail()
            );
        }

        if (request.getFirstName() != null) {
            currentUser.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            currentUser.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            currentUser.setEmail(request.getEmail());
        }

        if (request.getNewPassword() != null
                && !request.getNewPassword().isBlank()) {

            if (request.getCurrentPassword() == null
                    || !passwordEncoder.matches(
                    request.getCurrentPassword(),
                    currentUser.getPassword())) {
                throw new BusinessException("Current password is incorrect");
            }

            currentUser.setPassword(
                    passwordEncoder.encode(request.getNewPassword())
            );
        }

        // Update role-specific fields
        if (currentUser.getRole() == Role.STUDENT) {
            studentRepository.findByUser(currentUser).ifPresent(student -> {
                if (request.getMajor() != null) {
                    student.setMajor(request.getMajor());
                }
                if (request.getYear() != null) {
                    student.setYear(request.getYear());
                }
                studentRepository.save(student);
            });
        }

        if (currentUser.getRole() == Role.FACULTY) {
            facultyRepository.findByUser(currentUser).ifPresent(faculty -> {
                if (request.getDepartment() != null) {
                    faculty.setDepartment(request.getDepartment());
                }
                if (request.getTitle() != null) {
                    faculty.setTitle(request.getTitle());
                }
                facultyRepository.save(faculty);
            });
        }

        User saved = userRepository.save(currentUser);
        log.info("Profile updated for: {}", saved.getEmail());

        return toResponse(saved);
    }

    // ── Deactivate User ───────────────────────────────────────────────────────

    @Transactional
    public UserResponse deactivateUser(Long id) {
        User user = findById(id);
        user.setActive(false);
        log.info("User deactivated: {}", user.getEmail());
        return toResponse(userRepository.save(user));
    }

    // ── Activate User ─────────────────────────────────────────────────────────

    @Transactional
    public UserResponse activateUser(Long id) {
        User user = findById(id);
        user.setActive(true);
        log.info("User activated: {}", user.getEmail());
        return toResponse(userRepository.save(user));
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    public UserResponse toResponse(User user) {
        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt());

        if (user.getRole() == Role.STUDENT) {
            studentRepository.findByUser(user).ifPresent(s -> {
                builder.studentId(s.getStudentId());
                builder.major(s.getMajor());
                builder.year(s.getYear());
            });
        }

        if (user.getRole() == Role.FACULTY) {
            facultyRepository.findByUser(user).ifPresent(f -> {
                builder.facultyProfileId(f.getId());
                builder.department(f.getDepartment());
                builder.title(f.getTitle());
            });
        }

        return builder.build();
    }

    // ── Private Helper ────────────────────────────────────────────────────────

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User", id));
    }
}