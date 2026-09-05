package com.saharsh.Code.editor.Platform.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int submissionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "attempt_id")
    @JsonIgnore
    private TestAttempt testAttempt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnore
    @JoinColumn(name = "qId")
    private Question question;

    private String submittedCode; // Standardized to camelCase

    private String language; // Standardized to camelCase

    private Timestamp totalTime; // Standardized to camelCase

    private int score;
}