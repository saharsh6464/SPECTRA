package com.saharsh.Code.editor.Platform.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class MCQ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mcqId;

    private String question;

    private String options; // You might want to store this as JSON or comma-separated

    private String correctAnswer;
}