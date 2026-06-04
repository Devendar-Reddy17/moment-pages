package com.momentpages.media;

import com.momentpages.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");
    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm");
    private static final Set<String> ALLOWED_AUDIO_TYPES = Set.of(
            "audio/mpeg", "audio/wav", "audio/ogg", "audio/webm");

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
    private static final long MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20 MB

    private final MediaRepository mediaRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${r2.bucket-name}")
    private String bucketName;

    @Value("${r2.public-url}")
    private String publicUrl;

    @Value("${r2.upload-expiry-minutes}")
    private int uploadExpiryMinutes;

    @Value("${app.backend-url:http://localhost:8089}")
    private String backendUrl;

    public MediaService(MediaRepository mediaRepository, S3Client s3Client, S3Presigner s3Presigner) {
        this.mediaRepository = mediaRepository;
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    public record UploadUrlResult(String uploadUrl, String mediaId, String fileKey) {}

    public UploadUrlResult generateUploadUrl(UUID projectId, String fileName, String mimeType, long fileSize) {
        validateFile(mimeType, fileSize);

        UUID mediaId = UUID.randomUUID();
        String fileKey = "projects/" + projectId + "/" + mediaId + "-" + sanitizeFileName(fileName);

        // Generate pre-signed PUT URL
        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileKey)
                .contentType(mimeType)
                .contentLength(fileSize)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .putObjectRequest(putRequest)
                .signatureDuration(Duration.ofMinutes(uploadExpiryMinutes))
                .build();

        String uploadUrl = s3Presigner.presignPutObject(presignRequest).url().toString();

        // Save media record (pending confirmation)
        Media media = new Media();
        media.setId(mediaId);
        media.setProjectId(projectId);
        media.setFileKey(fileKey);
        media.setFileName(fileName);
        media.setMimeType(mimeType);
        media.setFileSize(fileSize);
        mediaRepository.save(media);

        return new UploadUrlResult(uploadUrl, mediaId.toString(), fileKey);
    }

    public String uploadDirect(UUID projectId, String fileName, String mimeType, byte[] fileBytes) {
        validateFile(mimeType, fileBytes.length);

        UUID mediaId = UUID.randomUUID();
        String fileKey = "projects/" + projectId + "/" + mediaId + "-" + sanitizeFileName(fileName);

        // Upload directly to R2
        s3Client.putObject(PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileKey)
                .contentType(mimeType)
                .build(),
                RequestBody.fromBytes(fileBytes));

        // Save media record
        Media media = new Media();
        media.setId(mediaId);
        media.setProjectId(projectId);
        media.setFileKey(fileKey);
        media.setFileName(fileName);
        media.setMimeType(mimeType);
        media.setFileSize(fileBytes.length);
        mediaRepository.save(media);

        return backendUrl + "/api/v1/media/" + fileKey;
    }

    public String confirmUpload(UUID projectId, UUID mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new BadRequestException("Media not found"));

        if (!media.getProjectId().equals(projectId)) {
            throw new BadRequestException("Media does not belong to this project");
        }

        // Verify file exists in R2
        try {
            s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(media.getFileKey())
                    .build());
        } catch (Exception e) {
            throw new BadRequestException("File not found in storage. Upload may have failed.");
        }

        return backendUrl + "/api/v1/media/" + media.getFileKey();
    }

    public List<Media> listMedia(UUID projectId) {
        return mediaRepository.findByProjectIdOrderByUploadedAtDesc(projectId);
    }

    public List<Media> listSharedBackgrounds(String search) {
        List<Media> backgrounds = mediaRepository.findByFileKeyStartingWithOrderByUploadedAtDesc("ai-generated/shared/");
        
        if (search != null && !search.isBlank()) {
            String searchLower = search.toLowerCase();
            return backgrounds.stream()
                    .filter(m -> m.getTags() != null && m.getTags().toLowerCase().contains(searchLower))
                    .toList();
        }
        
        return backgrounds;
    }

    public void deleteMedia(UUID projectId, UUID mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new BadRequestException("Media not found"));

        if (!media.getProjectId().equals(projectId)) {
            throw new BadRequestException("Media does not belong to this project");
        }

        // Delete from R2
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(media.getFileKey())
                    .build());
        } catch (Exception e) {
            // Log but don't fail - orphaned files can be cleaned up later
        }

        mediaRepository.delete(media);
    }

    public String buildPublicUrl(String fileKey) {
        return backendUrl + "/api/v1/media/" + fileKey;
    }

    public byte[] getFileBytes(String fileKey) {
        return s3Client.getObjectAsBytes(
                software.amazon.awssdk.services.s3.model.GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileKey)
                        .build())
                .asByteArray();
    }

    private void validateFile(String mimeType, long fileSize) {
        if (ALLOWED_IMAGE_TYPES.contains(mimeType)) {
            if (fileSize > MAX_IMAGE_SIZE) {
                throw new BadRequestException("Image must be under 10 MB");
            }
        } else if (ALLOWED_VIDEO_TYPES.contains(mimeType)) {
            if (fileSize > MAX_VIDEO_SIZE) {
                throw new BadRequestException("Video must be under 100 MB");
            }
        } else if (ALLOWED_AUDIO_TYPES.contains(mimeType)) {
            if (fileSize > MAX_AUDIO_SIZE) {
                throw new BadRequestException("Audio must be under 20 MB");
            }
        } else {
            throw new BadRequestException("Unsupported file type: " + mimeType);
        }
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
