package com.handyconnect.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("status", "UP");
        info.put("name", "HandyConnect Backend API");
        info.put("description", "Handyman Service, Logistics and Inventory Management System");
        info.put("version", "1.0.0");
        info.put("apiPrefix", "/api/v1");
        info.put("documentation", "/swagger-ui.html");
        info.put("health", "/actuator/health");
        return ResponseEntity.ok(info);
    }
}
