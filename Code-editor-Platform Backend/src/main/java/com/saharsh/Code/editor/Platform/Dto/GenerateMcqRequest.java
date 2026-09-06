package com.saharsh.Code.editor.Platform.Dto;

import java.util.List;

// Wrapper for the response from our Controller
public record GenerateMcqRequest(String topic, String difficulty, int count) {}

// Individual MCQ structure matching your database entity

// Wrapper to help Jackson parse the JSON array from OpenAI
