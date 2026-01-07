# Report Data Model

The report data model defines the structure and properties of citizen and first responder reports within the Event Monitoring and Management Platform. Reports are separate entities that can contribute to events, allowing multiple reports to build a comprehensive incident picture without requiring all event fields to be populated.

## Report Model Structure

```json
{
  "_id": "ObjectId",             // MongoDB ObjectId
  "companyId": "ObjectId",       // Reference to Company collection (multi-tenant isolation)
  "eventId": "ObjectId",         // Reference to Event collection (optional - may create new event)
  "reporterId": "ObjectId",      // Reference to User collection (citizen or first_responder)
  "reportType": "string",        // Type of report: "citizen", "camera", "first_responder", "manual"
  "title": "string",             // Brief title of the report
  "description": "string",       // Detailed description of the incident
  "location": {
    "type": "Point",
    "coordinates": [number, number]  // [longitude, latitude] GeoJSON format
  },
  "address": "string",           // Human-readable address
  "eventTypeId": "ObjectId",     // Reference to EventType collection
  "priority": "string",          // Reported priority: "low", "medium", "high", "critical"
  "status": "string",            // Report status: "submitted", "reviewed", "verified", "rejected"
  "attachments": [{
    "type": "string",            // "image", "video", "audio"
    "url": "string",             // File URL
    "filename": "string",        // Original filename
    "size": "number",            // File size in bytes
    "uploadedAt": "Date"         // Upload timestamp
  }],
  "metadata": {
    "deviceInfo": "object",      // Mobile device information
    "appVersion": "string",      // Mobile app version
    "confidence": "number",      // AI confidence score (for camera reports)
    "source": "string"           // Source system identifier
  },
  "createdAt": "Date",           // Report submission timestamp
  "updatedAt": "Date",           // Last update timestamp
  "reviewedAt": "Date",          // Review timestamp (optional)
  "reviewedBy": "ObjectId"       // Reference to User who reviewed (optional)
}
```

## Properties Description

- **_id**: MongoDB ObjectId serving as the unique identifier for each report.
- **companyId**: Reference to the Company collection, ensuring multi-tenant data isolation.
- **eventId**: Optional reference to an existing Event. If null, the report may trigger creation of a new event.
- **reporterId**: Reference to the User who submitted the report (citizen or first_responder).
- **reportType**: Classification of the report source:
  - `"citizen"`: Submitted via mobile app by public users
  - `"camera"`: Generated automatically by AI camera detection
  - `"first_responder"`: Submitted by emergency personnel
  - `"manual"`: Created manually by operators or admins
- **title**: Brief, descriptive title of the incident.
- **description**: Detailed narrative of what occurred, including relevant context.
- **location**: GeoJSON Point with longitude/latitude coordinates for mapping and proximity calculations.
- **address**: Human-readable location description derived from coordinates or user input.
- **eventTypeId**: Reference to EventType for categorization (may differ from final event type).
- **priority**: Urgency level as perceived by the reporter.
- **status**: Current processing status of the report:
  - `"submitted"`: Newly submitted, awaiting review
  - `"reviewed"`: Reviewed by operator, may be linked to event
  - `"verified"`: Confirmed as accurate and actionable
  - `"rejected"`: Determined to be invalid or duplicate
- **attachments**: Array of media files associated with the report (images, videos, audio).
- **metadata**: Additional technical information about the report submission.
- **createdAt**: ISO 8601 timestamp when the report was submitted.
- **updatedAt**: ISO 8601 timestamp of the last modification.
- **reviewedAt**: ISO 8601 timestamp when the report was reviewed (optional).
- **reviewedBy**: Reference to the User who performed the review (optional).

## Report-Event Relationship

Reports serve as the building blocks for events:

- **Independent Submission**: Reports can exist without being immediately linked to an event.
- **Event Creation**: High-priority or verified reports can automatically create new events.
- **Event Contribution**: Multiple reports can contribute information to a single event.
- **Flexible Linking**: Reports can be linked to existing events during review or automatically based on location/time proximity.
- **Data Enrichment**: Each report adds details that may not be available in other reports.

## Report Types and Sources

### Citizen Reports
- Submitted via mobile app
- May include photos, videos, or audio
- Location based on device GPS
- Anonymous or authenticated submission options

### Camera Reports
- Automatically generated by AI detection
- Include snapshot images and confidence scores
- Precise location from camera configuration
- May trigger immediate event creation

### First Responder Reports
- Submitted by emergency personnel
- Include real-time location tracking
- May update existing events with response information
- Higher priority and faster processing

### Manual Reports
- Created by operators or admins
- May consolidate information from multiple sources
- Used for incident documentation and follow-up

## Processing Workflow

1. **Submission**: Report created via API or automatic detection
2. **Validation**: Basic validation of required fields and data integrity
3. **Review**: Operator review for accuracy and relevance
4. **Linking**: Association with existing event or creation of new event
5. **Verification**: Confirmation of report details and attachments
6. **Archival**: Long-term storage with appropriate retention policies

## Multi-Tenant Considerations

- All reports are scoped to a specific company via `companyId`
- Report visibility is restricted to users within the same company
- Location-based filtering respects company geographic boundaries
- Attachment storage is segregated by company

## Security and Privacy

- Reports may contain sensitive incident information
- Attachment files are stored securely with access controls
- Location data is protected and only shared with authorized personnel
- Citizen reports can be submitted anonymously when permitted by company policy

## Future Considerations

As the platform evolves, additional properties may be added:

- **followUpReports**: Links to related reports in the same incident chain
- **responseActions**: Tracking of actions taken in response to the report
- **publicVisibility**: Options for public disclosure of resolved incidents
- **translation**: Multi-language support for international deployments
- **sentiment**: AI analysis of report text for priority assessment