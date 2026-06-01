package com.momentpages;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MomentPagesApplication {

    public static void main(String[] args) {
        SpringApplication.run(MomentPagesApplication.class, args);
    }
}
