package com.saharsh.Code.editor.Platform.Dto;

import lombok.Data;

@Data
public class CodeSubmissionRequest {
    private Integer testId;
    private Integer userId;
    private Integer problemId;
    private String submittedCode;
    private String language;
}