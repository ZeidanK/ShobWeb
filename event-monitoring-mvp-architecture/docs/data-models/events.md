# Event Data Model

The event data model defines the structure and properties of event data within the Event Monitoring and Management Platform. Each event represents a significant occurrence that may be detected by cameras, reported by citizens, or created by first responders. Events can have multiple reports contributing to them, allowing for comprehensive incident tracking.

## Event Model Structure

```json
{
  "_id": "ObjectId",             // MongoDB ObjectId
  "companyId": "ObjectId",       // Reference to Company collection (multi-tenant isolation)
  "eventTypeId": "ObjectId",     // Reference to EventType collection (dynamic types)
  "title": "string",             // Human-readable event title
  "description": "string",       // Optional detailed description
  "status": "string",            // Current status: "active", "resolved", "closed"
  "priority": "string",          // Priority level: "low", "medium", "high", "critical"
  "location": {
    "type": "Point",
    "coordinates": [number, number]  // [longitude, latitude] GeoJSON format
  },
  "address": "string",           // Human-readable address
  "reports": ["ObjectId"],       // Array of Report IDs contributing to this event
  "assignedTo": "ObjectId",      // Reference to User (first_responder or operator)
  "createdAt": "Date",           // Creation timestamp
  "updatedAt": "Date",           // Last update timestamp
  "resolvedAt": "Date",          // Resolution timestamp (optional)
  "tags": ["string"]             // Array of tags for categorization
}
```

## Properties Description

- **_id**: MongoDB ObjectId serving as the unique identifier for each event.
- **companyId**: Reference to the Company collection, ensuring multi-tenant data isolation.
- **eventTypeId**: Reference to the EventType collection, enabling dynamic event categorization.
- **title**: Human-readable title for the event (e.g., "Suspicious Activity Reported").
- **description**: Optional detailed description of the event circumstances.
- **status**: Current lifecycle status of the event:
  - `"active"`: Event is ongoing and requires attention
  - `"resolved"`: Event has been addressed but may need follow-up
  - `"closed"`: Event is fully resolved and archived
- **priority**: Urgency level affecting response time and resource allocation.
- **location**: GeoJSON Point with longitude/latitude coordinates for mapping and proximity calculations.
- **address**: Human-readable location description for display purposes.
- **reports**: Array of Report ObjectIds that contribute information to this event. Allows multiple reports (citizen, camera, first responder) to build a complete incident picture.
- **assignedTo**: Reference to User collection for assignment to first responders or operators.
- **createdAt**: ISO 8601 timestamp when the event was first created.
- **updatedAt**: ISO 8601 timestamp of the last modification.
- **resolvedAt**: ISO 8601 timestamp when the event was resolved (optional).
- **tags**: Array of strings for flexible categorization and filtering.

## Event-Report Relationship

Events are designed to aggregate multiple reports, allowing for comprehensive incident tracking:

- **Multiple Reports per Event**: A single event can have multiple reports from different sources (citizens, cameras, first responders).
- **Flexible Data Entry**: Not all event fields need to be populated initially - reports can contribute different pieces of information.
- **Progressive Enrichment**: Events become more complete as additional reports are added.
- **Source Attribution**: Each report maintains its own metadata (source, timestamp, confidence) while contributing to the overall event.

## Status Workflow

Events follow a defined lifecycle:

1. **Creation**: Event created from first report (citizen, camera, or manual)
2. **Active**: Event is being monitored and responded to
3. **Resolved**: Immediate threat addressed, but follow-up may be needed
4. **Closed**: Event fully resolved and archived

## Multi-Tenant Considerations

- All events are scoped to a specific company via `companyId`
- Event types can be company-specific or shared
- Location data enables company-specific geographic filtering
- Assignment is limited to users within the same company

## Future Considerations

As the platform evolves, additional properties may be added:

- **escalationLevel**: Automatic escalation based on priority and time thresholds
- **responseTime**: SLA tracking for first responder response
- **relatedEvents**: Links to similar or connected events
- **attachments**: Additional media files beyond report-specific attachments
- **customFields**: Company-specific additional data fields