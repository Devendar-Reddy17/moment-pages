package com.momentpages.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import static org.mockito.Mockito.mock;

@TestConfiguration
public class TestConfig {

    @Bean
    @Primary
    public S3Client mockS3Client() {
        return mock(S3Client.class);
    }

    @Bean
    @Primary
    public S3Presigner mockS3Presigner() {
        return mock(S3Presigner.class);
    }
}
