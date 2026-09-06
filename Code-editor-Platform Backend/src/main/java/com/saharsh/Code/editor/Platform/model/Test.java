package com.saharsh.Code.editor.Platform.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Test {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer testId;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private String testName;
    private String description;
    private Integer durationMinutes;

    private Timestamp startTime;
    private Timestamp endTime;

    // Simple list of Question IDs (replaces TestProblem)
    @ElementCollection
    @CollectionTable(name = "test_question_ids", joinColumns = @JoinColumn(name = "test_id"))
    @Column(name = "question_id")
    private List<Integer> questionIds = new ArrayList<>();

    // Simple list of MCQ IDs (from your ER diagram)
    @ElementCollection
    @CollectionTable(name = "test_mcq_ids", joinColumns = @JoinColumn(name = "test_id"))
    @Column(name = "mcq_id")
    private List<Integer> mcqIds = new ArrayList<>();

    @CreationTimestamp
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;

    @Transient
    private String topic;

    @Transient
    private String difficulty;

    @Transient
    private Integer mcqCount;
}