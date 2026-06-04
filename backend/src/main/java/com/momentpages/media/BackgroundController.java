package com.momentpages.media;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/backgrounds")
public class BackgroundController {

    private final MediaService mediaService;

    public BackgroundController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    public ResponseEntity<?> listBackgrounds() {
        List<Media> backgrounds = mediaService.listSharedBackgrounds();
        var response = backgrounds.stream()
                .filter(m -> m.getMimeType() != null && m.getMimeType().startsWith("image/"))
                .map(m -> Map.of(
                        "id", m.getId().toString(),
                        "fileName", m.getFileName(),
                        "publicUrl", mediaService.buildPublicUrl(m.getFileKey())
                ))
                .toList();

        return ResponseEntity.ok(response);
    }
}
