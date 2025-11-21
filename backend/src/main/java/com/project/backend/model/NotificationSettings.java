package com.project.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class NotificationSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean certificationExpireNotice;
    private int daysBeforeExpirarySendNotice; // Determine how many days before expirary should the notice be sent
    private boolean newProjectNotice; // Notify user when they are added into a project
    private boolean documentUpdateNotice; // Send notice when there are updates to the document in any project the user is part of
    
    private boolean missionAssignmentNotice;  // Notify user when new assignemt is assigned to him
    private boolean commentAndReplyNotice; // Notify user when there are new comments or reply posted to the project he participates


    /**
     * Creates a default settings in case there is no settings in the database
     */
    public NotificationSettings() {
        id = 1L;
        certificationExpireNotice = true;
        daysBeforeExpirarySendNotice = 90;
        newProjectNotice = true;
        documentUpdateNotice = true;
        missionAssignmentNotice = true;
        commentAndReplyNotice = true;
    }

}
