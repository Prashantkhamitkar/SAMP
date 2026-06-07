package com.samp.dto.request;

import com.samp.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    // Faculty-specific (required when role = FACULTY)
    private String department;
    private String title;

    // Student-specific (required when role = STUDENT)
    private String studentId;
    private String major;

    @Min(1) @Max(8)
    private Integer year;
}
