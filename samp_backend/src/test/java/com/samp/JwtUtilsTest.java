package com.samp;

import com.samp.entity.User;
import com.samp.enums.Role;
import com.samp.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JwtUtils Tests")
class JwtUtilsTest {

    private JwtUtils jwtUtils;
    private User     mockUser;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret",
                "4b3c2a1d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 86400000L);

        mockUser = User.builder()
                .id(1L).email("student@samp.edu")
                .password("hashed").role(Role.STUDENT).active(true).build();
    }

    // ── generateToken ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("generateToken — returns non-null JWT string")
    void generateToken_returnsToken() {
        String token = jwtUtils.generateToken(mockUser);

        assertThat(token).isNotNull().isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // header.payload.signature
    }

    // ── extractUsername ────────────────────────────────────────────────────────

    @Test
    @DisplayName("extractUsername — returns correct email from token")
    void extractUsername_returnsEmail() {
        String token = jwtUtils.generateToken(mockUser);

        String email = jwtUtils.extractUsername(token);

        assertThat(email).isEqualTo("student@samp.edu");
    }

    // ── isTokenValid ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("isTokenValid — valid token for correct user returns true")
    void isTokenValid_validToken_returnsTrue() {
        String token = jwtUtils.generateToken(mockUser);

        boolean valid = jwtUtils.isTokenValid(token, mockUser);

        assertThat(valid).isTrue();
    }

    @Test
    @DisplayName("isTokenValid — token for different user returns false")
    void isTokenValid_wrongUser_returnsFalse() {
        User otherUser = User.builder()
                .id(2L).email("other@samp.edu")
                .password("hashed").role(Role.FACULTY).active(true).build();

        String token = jwtUtils.generateToken(mockUser);

        boolean valid = jwtUtils.isTokenValid(token, otherUser);

        assertThat(valid).isFalse();
    }

    // ── validateToken ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("validateToken — valid token returns true")
    void validateToken_validToken_returnsTrue() {
        String token = jwtUtils.generateToken(mockUser);

        assertThat(jwtUtils.validateToken(token)).isTrue();
    }

    @Test
    @DisplayName("validateToken — malformed token returns false")
    void validateToken_malformedToken_returnsFalse() {
        assertThat(jwtUtils.validateToken("not.a.valid.token")).isFalse();
    }

    @Test
    @DisplayName("validateToken — empty string returns false")
    void validateToken_emptyToken_returnsFalse() {
        assertThat(jwtUtils.validateToken("")).isFalse();
    }

    @Test
    @DisplayName("validateToken — tampered token returns false")
    void validateToken_tamperedToken_returnsFalse() {
        String token = jwtUtils.generateToken(mockUser);
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";

        assertThat(jwtUtils.validateToken(tampered)).isFalse();
    }
}