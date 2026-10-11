package com.handyconnect.config;

import com.handyconnect.user.User;
import com.handyconnect.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${handyconnect.admin.default-email:admin@handyconnect.local}")
    private String adminDefaultEmail;

    @Value("${handyconnect.admin.default-password:Password123!}")
    private String adminDefaultPassword;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Initializing HandyConnect bootstrap checks...");

        // Ensure Admin user exists and has a properly encoded password
        userRepository.findByEmail(adminDefaultEmail).ifPresentOrElse(
                admin -> {
                    // Update password to ensure it matches standard dev password
                    admin.setPasswordHash(passwordEncoder.encode(adminDefaultPassword));
                    userRepository.save(admin);
                    log.info("Administrator account '{}' verified with configured credentials.", adminDefaultEmail);
                },
                () -> {
                    User admin = new User(
                            adminDefaultEmail,
                            passwordEncoder.encode(adminDefaultPassword),
                            "System Administrator",
                            "+1-555-0100",
                            "ROLE_ADMIN"
                    );
                    userRepository.save(admin);
                    log.info("Created initial bootstrap administrator '{}'", adminDefaultEmail);
                }
        );

        // Ensure standard demo accounts have password 'Password123!'
        String defaultDemoPass = passwordEncoder.encode("Password123!");
        String[] demoEmails = {
                "customer@handyconnect.local",
                "handyman1@handyconnect.local",
                "handyman2@handyconnect.local",
                "handyman3@handyconnect.local",
                "handyman4@handyconnect.local",
                "inventory@handyconnect.local",
                "supplier@handyconnect.local"
        };

        for (String email : demoEmails) {
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setPasswordHash(defaultDemoPass);
                userRepository.save(user);
            });
        }
        log.info("HandyConnect bootstrap initialization complete.");
    }
}
