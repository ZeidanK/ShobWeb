# Event Type Data Model

The event type data model defines the structure and properties of event types within the Event Monitoring and Management Platform. Event types replace fixed enums with a dynamic, hierarchical system that can be configured per company or shared globally, enabling flexible categorization of incidents.

## EventType Model Structure

```json
{
  "_id": "ObjectId",             // MongoDB ObjectId
  "companyId": "ObjectId",       // Reference to Company (null for global types)
  "name": "string",              // Human-readable type name
  "description": "string",       // Optional detailed description
  "category": "string",          // High-level category (e.g., "security", "safety", "maintenance")
  "parentId": "ObjectId",        // Reference to parent EventType (for hierarchical types)
  "icon": "string",              // Icon identifier for UI display
  "color": "string",             // Hex color code for UI theming
  "priority": "string",          // Default priority: "low", "medium", "high", "critical"
  "isPublic": "boolean",         // Whether citizens can select this type
  "isActive": "boolean",         // Whether this type is available for use
  "autoCreateEvent": "boolean",  // Whether reports of this type auto-create events
  "escalationRules": [{
    "condition": "string",       // Condition to trigger escalation
    "delayMinutes": "number",    // Delay before escalation
    "newPriority": "string",     // Priority to escalate to
    "notifyRoles": ["string"]    // Roles to notify
  }],
  "metadata": {
    "requiresLocation": "boolean", // Location required for this type
    "allowsAttachments": "boolean", // Attachments allowed
    "responseTimeSLA": "number",   // Expected response time in minutes
    "autoAssign": "boolean"        // Auto-assign to available responders
  },
  "createdBy": "ObjectId",       // Reference to User who created this type
  "createdAt": "Date",           // Creation timestamp
  "updatedAt": "Date"            // Last update timestamp
}
```

## Properties Description

- **_id**: MongoDB ObjectId serving as the unique identifier for each event type.
- **companyId**: Reference to Company collection. If null, this is a global type available to all companies.
- **name**: Human-readable name for the event type (e.g., "Suspicious Activity", "Medical Emergency").
- **description**: Optional detailed description of when and how to use this event type.
- **category**: High-level grouping for organization and filtering (security, safety, maintenance, etc.).
- **parentId**: Reference to parent EventType for hierarchical relationships (e.g., "Vehicle Accident" → "Traffic Incident").
- **icon**: Icon identifier or URL for visual representation in the UI.
- **color**: Hex color code for consistent theming across the application.
- **priority**: Default priority level assigned to events of this type.
- **isPublic**: Whether citizen users can select this type when submitting reports.
- **isActive**: Whether this type is currently available for selection and use.
- **autoCreateEvent**: Whether reports with this type should automatically create new events.
- **escalationRules**: Array of automatic escalation rules based on time and conditions.
- **metadata**: Additional configuration options for type-specific behavior.
- **createdBy**: Reference to the User who created this event type.
- **createdAt** / **updatedAt**: Automatic timestamps for lifecycle tracking.

## Hierarchical Structure

Event types support parent-child relationships:

- **Parent Types**: Broad categories (e.g., "Security Incident", "Medical Emergency")
- **Child Types**: Specific subtypes (e.g., "Burglary", "Heart Attack")
- **Multiple Levels**: Support for multi-level hierarchies
- **Inheritance**: Child types can inherit properties from parents

## Global vs Company Types

- **Global Types**: CompanyId is null, available to all companies, managed by super admins
- **Company Types**: Scoped to specific company, can extend or override global types
- **Type Resolution**: Company-specific types take precedence over global types with same name

## Auto-Creation and Escalation

- **Auto-Creation**: Certain types (high-priority) automatically create events when reports are submitted
- **Escalation Rules**: Time-based priority increases and notifications
- **SLA Tracking**: Response time expectations and monitoring
- **Auto-Assignment**: Automatic assignment to available first responders

## Usage in Reports and Events

- **Report Submission**: Types guide users in categorizing their reports
- **Event Classification**: Events inherit type information from contributing reports
- **Filtering and Search**: Types enable powerful filtering and analytics
- **Workflow Triggers**: Types determine which workflows and notifications are triggered

## Multi-Tenant Considerations

- Global types are shared across all companies
- Company-specific types are isolated to their company
- Type management permissions are role-based
- Migration between global and company types is supported

## Security and Access Control

- Type creation and modification is restricted by role
- Public types are visible to citizens, private types are internal-only
- Audit logging tracks all type changes
- Type deletion is soft-delete to preserve historical data

## Future Considerations

As the platform evolves, additional properties may be added:

- **customFields**: Type-specific additional data fields
- **workflows**: Custom workflow definitions per type
- **integrations**: Third-party system triggers per type
- **analytics**: Type-specific reporting and metrics
- **translations**: Multi-language support for international deployments