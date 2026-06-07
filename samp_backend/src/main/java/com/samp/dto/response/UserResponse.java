package com.samp.dto.response;

import com.samp.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;

    // Student-specific (null for other roles)
    private String studentId;
    private String major;
    private Integer year;

    // Faculty-specific (null for other roles)
    private Long facultyProfileId;
    private String department;
    private String title;
}