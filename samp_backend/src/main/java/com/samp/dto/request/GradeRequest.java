package com.samp.dto.request;

import com.samp.enums.LetterGrade;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GradeRequest {

    @NotNull(message = "Enrollment ID is required")
    private Long enrollmentId;

    @NotNull(message = "Grade is required")
    private LetterGrade grade;
}