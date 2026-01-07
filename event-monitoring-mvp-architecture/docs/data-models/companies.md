# Company Data Model

The company data model defines the structure and properties of companies within the Event Monitoring and Management Platform. Companies represent separate tenants with isolated data, users, and configurations, enabling multi-tenant operation with API key-based access control.

## Company Model Structure

```json
{
  "_id": "ObjectId",             // MongoDB ObjectId
  "name": "string",              // Company name
  "description": "string",       // Optional company description
  "apiKey": "string",            // Unique API key for mobile app access
  "subscription": {
    "plan": "string",            // Subscription plan: "basic", "professional", "enterprise"
    "status": "string",          // Status: "active", "suspended", "cancelled"
    "startDate": "Date",         // Subscription start date
    "endDate": "Date",           // Subscription end date (optional)
    "maxUsers": "number",        // Maximum number of users allowed
    "maxCameras": "number",      // Maximum number of cameras allowed
    "features": ["string"]       // Array of enabled features
  },
  "settings": {
    "timezone": "string",        // Default timezone (e.g., "America/New_York")
    "currency": "string",        // Currency for billing (e.g., "USD")
    "language": "string",        // Default language (e.g., "en")
    "allowAnonymousReports": "boolean", // Allow anonymous citizen reports
    "autoCreateEvents": "boolean", // Auto-create events from high-priority reports
    "notificationSettings": {
      "emailEnabled": "boolean", // Enable email notifications
      "smsEnabled": "boolean",   // Enable SMS notifications
      "pushEnabled": "boolean"   // Enable push notifications
    }
  },
  "contact": {
    "email": "string",           // Primary contact email
    "phone": "string",           // Primary contact phone
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "country": "string"
    }
  },
  "usage": {
    "eventsThisMonth": "number", // Event count for current month
    "reportsThisMonth": "number", // Report count for current month
    "storageUsed": "number",     // Storage used in bytes
    "apiCallsThisMonth": "number" // API calls for current month
  },
  "createdAt": "Date",           // Company creation timestamp
  "updatedAt": "Date",           // Last update timestamp
  "isActive": "boolean"          // Company account status
}
```

## Properties Description

- **_id**: MongoDB ObjectId serving as the unique identifier for each company.
- **name**: Human-readable company name for display and identification.
- **description**: Optional detailed description of the company's purpose or operations.
- **apiKey**: Unique API key used for mobile app authentication and API access validation.
- **subscription**: Subscription and billing information including plan details and limits.
- **settings**: Company-wide configuration settings that affect all users and operations.
- **contact**: Primary contact information for billing, support, and administrative purposes.
- **usage**: Current usage statistics for billing and limit enforcement.
- **createdAt** / **updatedAt**: Automatic timestamps for lifecycle tracking.
- **isActive**: Boolean flag indicating if the company account is active and can access the system.

## Subscription Plans

### Basic Plan
- Max 10 users
- Max 5 cameras
- Core features only
- Community support

### Professional Plan
- Max 50 users
- Max 25 cameras
- Advanced analytics
- Priority support
- Custom integrations

### Enterprise Plan
- Unlimited users
- Unlimited cameras
- All features
- Dedicated support
- SLA guarantees
- Custom development

## API Key Management

- **Generation**: API keys are generated using cryptographically secure random generation
- **Rotation**: Keys can be rotated for security without service interruption
- **Validation**: All mobile app requests include API key validation
- **Scope**: Keys are company-specific and cannot access other companies' data

## Multi-Tenant Isolation

Companies provide complete data isolation:

- **Data Separation**: All collections (users, events, cameras, reports) are filtered by companyId
- **Access Control**: Users can only access data within their company
- **Resource Limits**: Usage is tracked and enforced per company
- **Configuration**: Settings are company-specific and inherited by all users

## Usage Tracking and Limits

The platform tracks and enforces usage limits:

- **Monthly Reset**: Usage counters reset monthly for billing cycles
- **Real-time Monitoring**: API calls check limits before processing
- **Graceful Degradation**: Soft limits with warnings, hard limits with rejection
- **Analytics**: Usage data powers billing and feature optimization

## Security Considerations

- API keys are hashed in logs and never stored in plain text
- Company data is physically segregated in multi-tenant databases
- Access logs track all API key usage for audit purposes
- Failed authentication attempts are rate-limited per API key

## Future Considerations

As the platform evolves, additional properties may be added:

- **billingHistory**: Detailed billing and payment history
- **integrations**: Third-party service integrations (Slack, PagerDuty, etc.)
- **customFields**: Company-specific additional data fields
- **branding**: Custom branding options for white-label deployments
- **auditLogs**: Comprehensive audit trails for compliance
- **dataRetention**: Configurable data retention policies