package com.athletehub.api.repository;

import com.athletehub.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.role.name = :roleName")
    java.util.List<User> findByRoleName(@org.springframework.data.repository.query.Param("roleName") String roleName);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.role.name = 'ROLE_ORG_ADMIN' AND u.organization IS NULL")
    java.util.List<User> findUnassignedAdmins();
}
