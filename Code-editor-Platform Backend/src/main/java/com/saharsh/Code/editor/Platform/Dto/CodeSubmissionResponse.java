package com.saharsh.Code.editor.Platform.Dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class CodeSubmissionResponse {
    private List<Integer> passed = new ArrayList<>();
    private List<Integer> failed = new ArrayList<>();
    private String error;
}