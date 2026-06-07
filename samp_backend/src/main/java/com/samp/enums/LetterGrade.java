package com.samp.enums;

public enum LetterGrade {

    A(4.0),
    B(3.0),
    C(2.0),
    D(1.0),
    F(0.0),
    I(0.0),   // Incomplete
    W(0.0);   // Withdrawn

    private final double gradePoints;

    LetterGrade(double gradePoints) {
        this.gradePoints = gradePoints;
    }

    public double getGradePoints() {
        return gradePoints;
    }
}