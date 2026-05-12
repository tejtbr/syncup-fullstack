package com.syncup.presence.websocket;

import com.syncup.presence.dto.StatusDtos;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StatusWebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcasts a status update to the general org-wide topic.
     * Frontend subscribes to /topic/status to receive live updates.
     */
    public void broadcastStatusUpdate(StatusDtos.StatusResponse statusResponse) {
        try {
            messagingTemplate.convertAndSend("/topic/status", statusResponse);
            log.debug("Broadcast status update for user: {}", statusResponse.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to broadcast status update: {}", e.getMessage());
        }
    }

    /**
     * Sends a team-specific update to subscribers of /topic/team/{teamId}
     */
    public void broadcastTeamUpdate(String teamId, Object payload) {
        try {
            messagingTemplate.convertAndSend("/topic/team/" + teamId, payload);
        } catch (Exception e) {
            log.error("Failed to broadcast team update: {}", e.getMessage());
        }
    }
}
