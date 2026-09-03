package com.saharsh.Code.editor.Platform.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int testCaseId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "problemId", nullable = false)
    private Question question;

    private String inputFormat;

    private String outputFormat;

    private String testCaseFile; // Standardized to camelCase

    private String outputFile; // Standardized to camelCase

    private String sampleOutputFile; // Standardized to camelCase

    private boolean isSample; // Fixed type to boolean
}