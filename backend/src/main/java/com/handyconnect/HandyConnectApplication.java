package com.handyconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HandyConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(HandyConnectApplication.class, args);
    }
}
