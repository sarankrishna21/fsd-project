package com.library.store;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class LibraryStoreApplication {
    public static void main(String[] args) {
        SpringApplication.run(LibraryStoreApplication.class, args);
    }
}
