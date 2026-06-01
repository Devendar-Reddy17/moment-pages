package com.momentpages.media;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/media")
public class MediaProxyController {

    private final MediaService mediaService;
    private final MediaRepository mediaRepository;

    public MediaProxyController(MediaService mediaService, MediaRepository mediaRepository) {
        this.mediaService = mediaService;
        this.mediaRepository = mediaRepository;
    }

    @GetMapping("/{*fileKey}")
    public ResponseEntity<byte[]> serveMedia(@PathVariable String fileKey) {
        Optional<Media> mediaOpt = mediaRepository.findAll().stream()
                .filter(m -> m.getFileKey() != null && m.getFileKey().equals(fileKey))
                .findFirst();

        if (mediaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Media media = mediaOpt.get();
        byte[] bytes = mediaService.getFileBytes(fileKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(media.getMimeType()));
        headers.setContentLength(bytes.length);
        // Allow cross-origin access for audio/video playback on published pages
        headers.set("Access-Control-Allow-Origin", "*");

        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }
}
