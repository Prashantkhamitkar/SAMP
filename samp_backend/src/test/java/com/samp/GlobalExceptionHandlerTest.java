package com.samp;

import com.samp.dto.response.ApiResponse;
import com.samp.exception.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;

import static org.assertj.core.api.Assertions.*;

@DisplayName("GlobalExceptionHandler Tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("ResourceNotFoundException → 404 NOT FOUND")
    void handleNotFound_returns404() {
        ResourceNotFoundException ex =
                new ResourceNotFoundException("Course not found with id: 99");

        ResponseEntity<ApiResponse<Void>> response = handler.handleNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).contains("Course not found");
    }

    @Test
    @DisplayName("DuplicateResourceException → 409 CONFLICT")
    void handleDuplicate_returns409() {
        DuplicateResourceException ex =
                new DuplicateResourceException("Email already registered");

        ResponseEntity<ApiResponse<Void>> response = handler.handleDuplicate(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).contains("Email already registered");
    }

    @Test
    @DisplayName("BusinessException → 400 BAD REQUEST")
    void handleBusiness_returns400() {
        BusinessException ex = new BusinessException("Course is full");

        ResponseEntity<ApiResponse<Void>> response = handler.handleBusiness(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getMessage()).contains("Course is full");
    }

    @Test
    @DisplayName("BadCredentialsException → 401 with generic message")
    void handleBadCredentials_returns401() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");

        ResponseEntity<ApiResponse<Void>> response = handler.handleBadCredentials(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody().getMessage())
                .isEqualTo("Invalid email or password");
    }

    @Test
    @DisplayName("DisabledException → 401 with deactivated message")
    void handleDisabled_returns401() {
        DisabledException ex = new DisabledException("Account disabled");

        ResponseEntity<ApiResponse<Void>> response = handler.handleDisabled(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody().getMessage())
                .contains("Account is deactivated");
    }

    @Test
    @DisplayName("AccessDeniedException → 403 FORBIDDEN")
    void handleAccessDenied_returns403() {
        AccessDeniedException ex = new AccessDeniedException("Forbidden");

        ResponseEntity<ApiResponse<Void>> response = handler.handleAccessDenied(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().getMessage())
                .contains("Access denied");
    }

    @Test
    @DisplayName("Generic Exception → 500 INTERNAL SERVER ERROR")
    void handleGeneral_returns500() {
        Exception ex = new RuntimeException("Unexpected error");

        ResponseEntity<ApiResponse<Void>> response = handler.handleGeneral(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().getMessage())
                .contains("unexpected error");
    }
}