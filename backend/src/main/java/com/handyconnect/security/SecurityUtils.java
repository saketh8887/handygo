package com.handyconnect.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) auth.getPrincipal();
        }
        return null;
    }

    public static Long getCurrentUserId() {
        UserPrincipal user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    public static String getCurrentUserRole() {
        UserPrincipal user = getCurrentUser();
        return user != null ? user.getRole() : null;
    }

    public static boolean hasRole(String role) {
        UserPrincipal user = getCurrentUser();
        if (user == null) return false;
        String userRole = user.getRole();
        if (!userRole.startsWith("ROLE_")) {
            userRole = "ROLE_" + userRole;
        }
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }
        return userRole.equalsIgnoreCase(role);
    }
}
