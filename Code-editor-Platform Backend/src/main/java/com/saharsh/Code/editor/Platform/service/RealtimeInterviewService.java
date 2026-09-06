package com.saharsh.Code.editor.Platform.service;

import com.saharsh.Code.editor.Platform.model.Question;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class RealtimeInterviewService {

    @Value("${openai.api.key}")
    private String openAiApiKey;


    public Map<String, Object> createRealtimeInterviewSession(
            Question question,
            String submittedCode,
            String language
    ) {

        /*
         * 1. Build the complete interview context.
         * This will be stored in the Realtime session instructions.
         */
        String instructions = buildInterviewInstructions(
                question,
                submittedCode,
                language
        );


        /*
         * 2. Create the request body required by OpenAI.
         *
         * Structure:
         *
         * {
         *   "session": {
         *      "type": "realtime",
         *      "model": "...",
         *      "instructions": "...",
         *      "audio": {
         *          "output": {
         *              "voice": "marin"
         *          }
         *      }
         *   }
         * }
         */
        Map<String, Object> session = new HashMap<>();

        session.put("type", "realtime");

        // Current Realtime model
        session.put("model", "gpt-realtime-2.1-mini");
        session.put("instructions", instructions);


        /*
         * Configure AI voice.
         */
        Map<String, Object> outputAudio = new HashMap<>();

        outputAudio.put("voice", "marin");

        Map<String, Object> audio = new HashMap<>();

        audio.put("output", outputAudio);

        session.put("audio", audio);


        /*
         * Final request body.
         */
        Map<String, Object> requestBody = new HashMap<>();

        requestBody.put("session", session);


        /*
         * 3. Create request headers.
         */
        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        headers.setBearerAuth(openAiApiKey);


        /*
         * 4. Combine headers and body.
         */
        HttpEntity<Map<String, Object>> requestEntity =
                new HttpEntity<>(requestBody, headers);


        /*
         * 5. Make the API request.
         */
        RestTemplate restTemplate = new RestTemplate();

        String url =
                "https://api.openai.com/v1/realtime/client_secrets";


        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        requestEntity,
                        Map.class
                );


        /*
         * 6. Return OpenAI's response.
         *
         * Important values:
         *
         * response.getBody().get("value")
         * response.getBody().get("expires_at")
         */
        return response.getBody();
    }

    //function which builds the context;)
    private String buildInterviewInstructions(
            Question question,
            String submittedCode,
            String language
    ) {

        return """
                You are an experienced technical interviewer.

                Conduct a realistic technical interview based specifically
                on the coding problem and the candidate's submitted solution.

                Your goal is to understand whether the candidate genuinely
                understands their own solution.

                Ask questions about:

                - Why the candidate chose their approach
                - Time complexity
                - Space complexity
                - Edge cases
                - Alternative approaches
                - Potential improvements
                - Details of the submitted implementation

                Rules:

                - Ask only one question at a time.
                - Listen carefully to the candidate's response.
                - Ask relevant follow-up questions based on their answer.
                - Do not follow a fixed list of questions.
                - Do not immediately give the candidate the answer.
                - Keep the conversation natural and conversational.
                - Focus specifically on the candidate's submitted code.
                - Keep questions concise because this is a voice interview.

                CODING PROBLEM:

                Title:
                %s

                Description:
                %s

                Difficulty:
                %s

                Expected Time Complexity:
                %s

                Expected Space Complexity:
                %s


                PROGRAMMING LANGUAGE:

                %s


                CANDIDATE'S SUBMITTED CODE:

                %s


                Start the interview now.

                Ask the first interview question based on the submitted code.
                """
                .formatted(
                        question.getTitle(),
                        question.getDescription(),
                        question.getDifficulty(),
                        question.getTimeComplexity(),
                        question.getSpaceComplexity(),
                        language,
                        submittedCode
                );
    }
}