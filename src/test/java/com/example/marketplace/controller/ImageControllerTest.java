package com.example.marketplace.controller;

import com.example.marketplace.entity.Image;
import com.example.marketplace.repository.ImageRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ImageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ImageRepository imageRepository;

    @Test
    @DisplayName("GET /api/images/{id} — успешный возврат файла")
    void getImageById_Success() throws Exception {
        byte[] mockBytes = "fake-image-bytes".getBytes();

        Image image = new Image();
        image.setId(1L);
        image.setOriginalFileName("test.jpg");
        image.setContentType("image/jpeg");
        image.setSize((long) mockBytes.length);
        image.setBytes(mockBytes);

        when(imageRepository.findById(1L)).thenReturn(Optional.of(image));

        mockMvc.perform(get("/api/images/1"))
                .andExpect(status().isOk())
                .andExpect(header().string("fileName", "test.jpg"))
                .andExpect(header().longValue("Content-Length", mockBytes.length))
                .andExpect(content().contentType(MediaType.IMAGE_JPEG))
                .andExpect(content().bytes(mockBytes));
    }

    @Test
    @DisplayName("GET /api/images/{id} — если сущность не найдена, отдается 404")
    void getImageById_NotFound() throws Exception {
        when(imageRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/images/99"))
                .andExpect(status().isNotFound());
    }
}