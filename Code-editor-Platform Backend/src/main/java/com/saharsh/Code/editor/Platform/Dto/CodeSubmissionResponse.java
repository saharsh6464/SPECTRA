package com.saharsh.Code.editor.Platform.Dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class CodeSubmissionResponse {
    private List<Integer> passed = new ArrayList<>();
    private List<Integer> failed = new ArrayList<>();
    private String error;
    // Temporary credential for OpenAI Realtime connection
    private String realtimeClientSecret;

    // Optional: expiry timestamp
    private Long realtimeSecretExpiresAt;
}