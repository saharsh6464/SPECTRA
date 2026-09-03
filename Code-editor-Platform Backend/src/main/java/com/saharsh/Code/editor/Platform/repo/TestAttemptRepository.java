package com.saharsh.Code.editor.Platform.repo;

import com.saharsh.Code.editor.Platform.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Integer> {
    // You can add custom query methods here if needed
}
