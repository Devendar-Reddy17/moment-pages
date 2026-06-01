package com.momentpages.project.dto;

import java.time.Instant;

public record UpdateSettingsRequest(
        String title,
        Instant eventDate,
        String password,
        Boolean removePassword
) {}
