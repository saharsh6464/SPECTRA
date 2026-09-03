package com.saharsh.Code.editor.Platform.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Anomaly {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int anomalyId;

    private String anomalyType; // Renamed slightly to avoid naming the field exactly like the class

    @CreationTimestamp
    private Timestamp timestamp;

    private int riskScore;

    @ManyToOne
    @JoinColumn(name = "testAttemptId")
    private TestAttempt testAttempt;
}