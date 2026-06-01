package com.momentpages.ai;

public interface AIProvider {

    AITextResponse generateInvitationText(AITextRequest request);

    AIThemeResponse generateTheme(AIThemeRequest request);

    AIPageResponse generatePage(AIPageRequest request);
}
