package com.momentpages.ai;

import java.util.UUID;

public interface AIProvider {

    AITextResponse generateInvitationText(AITextRequest request);

    AIThemeResponse generateTheme(AIThemeRequest request);

    AIPageResponse generatePage(AIPageRequest request);

    AIEditResponse editCanvas(AIEditRequest request);

    AIImageResponse generateImage(AIImageRequest request);

    AIImageResponse moveTempImage(UUID tempMediaId, UUID projectId);
}
