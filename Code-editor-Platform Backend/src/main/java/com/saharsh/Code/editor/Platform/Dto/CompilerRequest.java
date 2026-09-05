package com.saharsh.Code.editor.Platform.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CompilerRequest {
    private String language;
    private String stdin;
    private String code;
}