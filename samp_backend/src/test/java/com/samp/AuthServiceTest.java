package com.samp;

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
import com.samp.service.impl.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock UserRepository        userRepository;
    @Mock StudentRepository     studentRepository;
    @Mock PasswordEncoder       passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtUtils              jwtUtils;

    @InjectMocks AuthService authService;

    private StudentRegisterRequest registerRequest;
    private User                   mockUser;

    @BeforeEach
    void setUp() {
        registerRequest = new StudentRegisterRequest();
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setEmail("john@test.com");
        registerRequest.setPassword("Test@1234");
        registerRequest.setStudentId("STU-001");
        registerRequest.setMajor("CS");
        registerRequest.setYear(2);

        mockUser = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@test.com")
                .password("hashedPassword")
                .role(Role.STUDENT)
                .active(true)
                .build();
    }

    // ── registerStudent ────────────────────────────────────────────────────────

    @Test
    @DisplayName("registerStudent — success returns AuthResponse with STUDENT role")
    void registerStudent_success() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(studentRepository.existsByStudentId(registerRequest.getStudentId())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(studentRepository.save(any(Student.class))).thenReturn(new Student());
        when(jwtUtils.generateToken(any())).thenReturn("mock.jwt.token");

        AuthResponse response = authService.registerStudent(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getRole()).isEqualTo(Role.STUDENT);
        assertThat(response.getEmail()).isEqualTo("john@test.com");
        verify(userRepository).save(any(User.class));
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("registerStudent — duplicate email throws DuplicateResourceException")
    void registerStudent_duplicateEmail_throws() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.registerStudent(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("registerStudent — duplicate studentId throws DuplicateResourceException")
    void registerStudent_duplicateStudentId_throws() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(studentRepository.existsByStudentId(registerRequest.getStudentId())).thenReturn(true);

        assertThatThrownBy(() -> authService.registerStudent(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Student ID already registered");
    }

    @Test
    @DisplayName("registerStudent — password is encoded before saving")
    void registerStudent_passwordEncoded() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(studentRepository.existsByStudentId(any())).thenReturn(false);
        when(passwordEncoder.encode("Test@1234")).thenReturn("bcrypt_hash");
        when(userRepository.save(any())).thenReturn(mockUser);
        when(studentRepository.save(any())).thenReturn(new Student());
        when(jwtUtils.generateToken(any())).thenReturn("token");

        authService.registerStudent(registerRequest);

        verify(passwordEncoder).encode("Test@1234");
    }

    // ── login ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("login — valid credentials returns AuthResponse")
    void login_validCredentials_returnsToken() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("john@test.com");
        loginRequest.setPassword("Test@1234");

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(authToken);
        when(jwtUtils.generateToken(mockUser)).thenReturn("mock.jwt.token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getRole()).isEqualTo(Role.STUDENT);
        assertThat(response.getFullName()).isEqualTo("John Doe");
    }

    @Test
    @DisplayName("login — invalid credentials throws BadCredentialsException")
    void login_invalidCredentials_throws() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("john@test.com");
        loginRequest.setPassword("WrongPass");

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
    }
}