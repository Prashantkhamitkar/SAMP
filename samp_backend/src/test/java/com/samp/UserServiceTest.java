package com.samp;

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
import com.samp.service.impl.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock UserRepository    userRepository;
    @Mock StudentRepository studentRepository;
    @Mock FacultyRepository facultyRepository;
    @Mock PasswordEncoder   passwordEncoder;

    @InjectMocks UserService userService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L).firstName("John").lastName("Doe")
                .email("john@test.com").password("hashed")
                .role(Role.STUDENT).active(true).build();
    }

    // ── getAllUsers ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllUsers — returns mapped list")
    void getAllUsers_returnsMappedList() {
        when(userRepository.findAll()).thenReturn(List.of(mockUser));
        when(studentRepository.findByUser(mockUser)).thenReturn(Optional.empty());

        List<UserResponse> result = userService.getAllUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("john@test.com");
    }

    // ── getUserById ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getUserById — found returns UserResponse")
    void getUserById_found() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(studentRepository.findByUser(mockUser)).thenReturn(Optional.empty());

        UserResponse result = userService.getUserById(1L);

        assertThat(result.getEmail()).isEqualTo("john@test.com");
        assertThat(result.getRole()).isEqualTo(Role.STUDENT);
    }

    @Test
    @DisplayName("getUserById — not found throws ResourceNotFoundException")
    void getUserById_notFound_throws() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── createUser ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createUser — FACULTY role creates Faculty profile")
    void createUser_faculty_createsFacultyProfile() {
        CreateUserRequest req = new CreateUserRequest();
        req.setFirstName("Dr"); req.setLastName("Smith");
        req.setEmail("drsmith@samp.edu"); req.setPassword("Faculty@1234");
        req.setRole(Role.FACULTY);
        req.setDepartment("CS"); req.setTitle("Professor");

        User savedUser = User.builder().id(2L).email("drsmith@samp.edu")
                .role(Role.FACULTY).active(true).build();

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(any())).thenReturn(savedUser);
        when(facultyRepository.save(any())).thenReturn(new Faculty());
        when(facultyRepository.findByUser(savedUser)).thenReturn(Optional.empty());

        userService.createUser(req);

        verify(facultyRepository).save(any(Faculty.class));
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("createUser — STUDENT role requires studentId")
    void createUser_studentMissingId_throws() {
        CreateUserRequest req = new CreateUserRequest();
        req.setFirstName("Jane"); req.setLastName("Doe");
        req.setEmail("jane@samp.edu"); req.setPassword("Student@1234");
        req.setRole(Role.STUDENT);
        // studentId intentionally null

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(any())).thenReturn(mockUser);

        assertThatThrownBy(() -> userService.createUser(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Student ID is required");
    }

    @Test
    @DisplayName("createUser — duplicate email throws DuplicateResourceException")
    void createUser_duplicateEmail_throws() {
        CreateUserRequest req = new CreateUserRequest();
        req.setEmail("john@test.com");
        req.setRole(Role.STUDENT);

        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(req))
                .isInstanceOf(DuplicateResourceException.class);
    }

    // ── deactivateUser ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("deactivateUser — sets active=false")
    void deactivateUser_setsActiveFalse() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any())).thenReturn(mockUser);
        when(studentRepository.findByUser(mockUser)).thenReturn(Optional.empty());

        UserResponse response = userService.deactivateUser(1L);

        assertThat(mockUser.isActive()).isFalse();
        verify(userRepository).save(mockUser);
    }

    // ── activateUser ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("activateUser — sets active=true")
    void activateUser_setsActiveTrue() {
        mockUser.setActive(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any())).thenReturn(mockUser);
        when(studentRepository.findByUser(mockUser)).thenReturn(Optional.empty());

        userService.activateUser(1L);

        assertThat(mockUser.isActive()).isTrue();
    }

    // ── updateProfile ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateProfile — updates name and email")
    void updateProfile_updatesFields() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFirstName("Jane");
        req.setLastName("Smith");
        req.setEmail("jane@test.com");

        when(userRepository.existsByEmail("jane@test.com")).thenReturn(false);
        when(userRepository.save(any())).thenReturn(mockUser);
        when(studentRepository.findByUser(mockUser)).thenReturn(Optional.empty());

        userService.updateProfile(mockUser, req);

        assertThat(mockUser.getFirstName()).isEqualTo("Jane");
        assertThat(mockUser.getLastName()).isEqualTo("Smith");
        assertThat(mockUser.getEmail()).isEqualTo("jane@test.com");
    }

    @Test
    @DisplayName("updateProfile — wrong current password throws BusinessException")
    void updateProfile_wrongCurrentPassword_throws() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setCurrentPassword("wrong");
        req.setNewPassword("NewPass@1234");

        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> userService.updateProfile(mockUser, req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Current password is incorrect");
    }

    @Test
    @DisplayName("updateProfile — duplicate email throws DuplicateResourceException")
    void updateProfile_duplicateEmail_throws() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setEmail("taken@test.com");

        when(userRepository.existsByEmail("taken@test.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateProfile(mockUser, req))
                .isInstanceOf(DuplicateResourceException.class);
    }
}