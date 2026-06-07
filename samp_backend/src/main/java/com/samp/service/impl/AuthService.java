package com.samp.service.impl;

import com.samp.dto.request.LoginRequest;
import com.samp.dto.request.StudentRegisterRequest;
import com.samp.dto.response.AuthResponse;
import com.samp.entity.Student;
import com.samp.entity.User;
import com.samp.enums.Role;
import com.samp.exception.DuplicateResourceException;
import com.samp.repository.StudentRepository;
import com.samp.repository.UserRepository;
import com.samp.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    // ── Register Student ──────────────────────────────────────────────────────

    @Transactional
    public AuthResponse registerStudent(StudentRegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already registered: " + request.getEmail()
            );
        }

        if (studentRepository.existsByStudentId(request.getStudentId())) {
            throw new DuplicateResourceException(
                    "Student ID already registered: " + request.getStudentId()
            );
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .active(true)
                .build();

        user = userRepository.save(user);
        log.info("New student registered: {}", user.getEmail());

        Student student = Student.builder()
                .user(user)
                .studentId(request.getStudentId())
                .major(request.getMajor())
                .year(request.getYear())
                .build();

        studentRepository.save(student);

        String token = jwtUtils.generateToken(user);

        return buildAuthResponse(user, token);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtUtils.generateToken(user);

        log.info("User logged in: {} | Role: {}", user.getEmail(), user.getRole());

        return buildAuthResponse(user, token);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}