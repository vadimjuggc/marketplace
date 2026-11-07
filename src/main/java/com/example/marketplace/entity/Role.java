package com.example.marketplace.entity;

import org.jspecify.annotations.NonNull;
import org.springframework.security.core.GrantedAuthority;

public enum Role implements GrantedAuthority {
    ROLE_USER,
    ROLE_ADMIN;

    @Override
    public @NonNull String getAuthority() {
        return "";
    }
}
