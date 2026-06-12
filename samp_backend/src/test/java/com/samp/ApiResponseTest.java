package com.samp;

import com.samp.dto.response.ApiResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("ApiResponse DTO Tests")
class ApiResponseTest {

    @Test
    @DisplayName("success(data) — sets success=true and data")
    void success_withData() {
        ApiResponse<String> response = ApiResponse.success("hello");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData()).isEqualTo("hello");
        assertThat(response.getMessage()).isNull();
    }

    @Test
    @DisplayName("success(message, data) — sets all fields")
    void success_withMessageAndData() {
        ApiResponse<Integer> response = ApiResponse.success("Created", 42);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Created");
        assertThat(response.getData()).isEqualTo(42);
    }

    @Test
    @DisplayName("success(message) — data is null")
    void success_messageOnly() {
        ApiResponse<Void> response = ApiResponse.success("Done");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Done");
        assertThat(response.getData()).isNull();
    }

    @Test
    @DisplayName("error(message) — sets success=false")
    void error_setsSuccessFalse() {
        ApiResponse<Void> response = ApiResponse.error("Something went wrong");

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Something went wrong");
        assertThat(response.getData()).isNull();
    }
}