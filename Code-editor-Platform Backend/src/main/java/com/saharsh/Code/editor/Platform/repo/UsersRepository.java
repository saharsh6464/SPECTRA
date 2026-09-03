package com.saharsh.Code.editor.Platform.repo;


import com.saharsh.Code.editor.Platform.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
    // You can add custom query methods here if needed, e.g., findByUsername
    Users findByUsername(String username);
}
