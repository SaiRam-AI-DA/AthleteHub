package com.athletehub.api.config;

import com.athletehub.api.entity.Role;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.RoleRepository;
import com.athletehub.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Repair old SUPER_ADMIN role if it exists without ROLE_ prefix
            roleRepository.findByName("SUPER_ADMIN").ifPresent(role -> {
                role.setName("ROLE_SUPER_ADMIN");
                roleRepository.save(role);
            });

            // Ensure all standard roles exist
            String[] standardRoles = {"ROLE_SUPER_ADMIN", "ROLE_ORG_ADMIN", "ROLE_COACH", "ROLE_ATHLETE", "ROLE_RECRUITER"};
            for (String roleName : standardRoles) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepository.save(role);
                }
            }

            Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN").get();

            boolean superAdminExists = userRepository.findByEmail("admin@athletehub.local").isPresent();

            if (!superAdminExists) {
                User superAdmin = new User();
                superAdmin.setFullName("Default Admin");
                superAdmin.setEmail("admin@athletehub.local");
                superAdmin.setPasswordHash(passwordEncoder.encode("Admin@123!"));
                superAdmin.setRole(superAdminRole);
                superAdmin.setIsVerified(true);
                superAdmin.setStatus("Active");

                userRepository.save(superAdmin);

                logger.info("========================================================");
                logger.info("Default SUPER_ADMIN created successfully.");
                logger.info("Email: admin@athletehub.local");
                logger.info("Password: Admin@123!");
                logger.info("WARNING: Please change these credentials or disable this initializer in production!");
                logger.info("========================================================");
            }
        };
    }
}
