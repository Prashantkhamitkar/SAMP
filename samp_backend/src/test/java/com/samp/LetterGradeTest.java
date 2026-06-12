package com.samp;

import com.samp.enums.LetterGrade;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.*;

@DisplayName("LetterGrade Enum Tests")
class LetterGradeTest {

    @ParameterizedTest(name = "{0} → {1} grade points")
    @CsvSource({
            "A, 4.0",
            "B, 3.0",
            "C, 2.0",
            "D, 1.0",
            "F, 0.0",
            "I, 0.0",
            "W, 0.0"
    })
    @DisplayName("getGradePoints — all grades return correct point values")
    void getGradePoints_allGrades(String grade, double expectedPoints) {
        LetterGrade letterGrade = LetterGrade.valueOf(grade);
        assertThat(letterGrade.getGradePoints()).isEqualTo(expectedPoints);
    }

    @Test
    @DisplayName("A grade — highest possible 4.0")
    void aGrade_highestPoints() {
        assertThat(LetterGrade.A.getGradePoints()).isEqualTo(4.0);
    }

    @Test
    @DisplayName("F grade — zero points")
    void fGrade_zeroPoints() {
        assertThat(LetterGrade.F.getGradePoints()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("I (Incomplete) — zero grade points")
    void iGrade_zeroPoints() {
        assertThat(LetterGrade.I.getGradePoints()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("W (Withdrawn) — zero grade points")
    void wGrade_zeroPoints() {
        assertThat(LetterGrade.W.getGradePoints()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("All 7 grades exist in enum")
    void allGradesExist() {
        assertThat(LetterGrade.values()).hasSize(7);
    }
}