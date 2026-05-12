package com.syncup.analytics.consumer;

import com.syncup.analytics.service.SnapshotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StatusEventConsumer {

    private final SnapshotService snapshotService;

    @KafkaListener(topics = "status.updated", groupId = "analytics-service")
    public void consume(StatusUpdatedEvent event) {
        log.info("Received status event: user={} status={} date={}",
            event.getFullName(), event.getStatus(), event.getStatusDate());
        try {
            snapshotService.upsertSnapshot(event);
        } catch (Exception e) {
            log.error("Failed to process status event: {}", e.getMessage(), e);
        }
    }
}
