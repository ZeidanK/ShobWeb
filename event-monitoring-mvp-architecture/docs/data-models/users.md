# User Data Model

The user data model defines the structure and properties of user accounts within the Event Monitoring and Management Platform. Users can be web dashboard operators, mobile first responders, or citizen reporters, with role-based access control and multi-tenant isolation.

## User Model Structure

```json
{
  "_id": "ObjectId",             // MongoDB ObjectId
  "companyId": "ObjectId",       // Reference to Company collection (multi-tenant isolation)
  "email": "string",             // Email address for web users (optional for mobile-only users)
  "phone": "string",             // Phone number for first responders and citizens (optional)
  "username": "string",          // Unique username for login
  "password": "string",          // Hashed password (bcrypt)
  "role": "string",              // User role: citizen, first_responder, operator, admin, company_admin, super_admin
  "firstName": "string",         // User's first name
  "lastName": "string",          // User's last name
  "isActive": "boolean",         // Account status (default: true)
  "lastLogin": "Date",           // Last login timestamp
  "createdAt": "Date",           // Account creation timestamp
  "updatedAt": "Date",           // Last update timestamp
  "preferences": {
    "notifications": "boolean",  // Enable push notifications
    "language": "string",        // Preferred language (default: "en")
    "timezone": "string"         // Preferred timezone
  },
  "location": {
    "type": "Point",
    "coordinates": [number, number]  // [longitude, latitude] for first responders
  },
  "deviceTokens": ["string"],    // Array of device tokens for push notifications
  "apiKey": "string"             // API key for mobile app authentication (first_responders only)
}
```

## Properties Description

- **_id**: MongoDB ObjectId serving as the unique identifier for each user.
- **companyId**: Reference to the Company collection, ensuring multi-tenant data isolation. All users belong to a specific company.
- **email**: Email address used for web dashboard authentication and notifications. Optional for mobile-only users.
- **phone**: Phone number used for first responder and citizen mobile authentication. Optional for web-only users.
- **username**: Unique username for login across all authentication methods.
- **password**: Bcrypt-hashed password for secure authentication.
- **role**: User role determining permissions and access levels:
  - `"citizen"`: Mobile app users who can submit reports
  - `"first_responder"`: Emergency personnel with live tracking and event assignment
  - `"operator"`: Dashboard users who monitor and manage events
  - `"admin"`: Company administrators with user management capabilities
  - `"company_admin"`: Company-level administrators
  - `"super_admin"`: System-wide administrators
- **firstName** / **lastName**: User's full name for display and identification.
- **isActive**: Boolean flag indicating if the account is active and can authenticate.
- **lastLogin**: Timestamp of the user's most recent successful login.
- **createdAt** / **updatedAt**: Automatic timestamps for account lifecycle tracking.
- **preferences**: User-configurable settings for notifications, language, and timezone.
- **location**: GeoJSON Point for first responders' current location (updated via mobile app).
- **deviceTokens**: Array of FCM/APNs tokens for push notifications to mobile devices.
- **apiKey**: Unique API key for mobile app authentication (generated for first_responders).

## Authentication Methods

Users can authenticate through multiple methods based on their role:

- **Web Dashboard**: Email + password for operators, admins, company_admins, super_admins
- **Mobile App**: Phone + password for first_responders and citizens
- **API Access**: API key validation for mobile applications

## Role-Based Permissions

### Citizen
- Submit reports via mobile app
- View public event information
- Receive notifications about local events

### First Responder
- All citizen permissions
- Live location tracking
- Event assignment and response
- Access to detailed event information
- Update event status

### Operator
- Monitor dashboard and maps
- View all company events
- Acknowledge and assign events
- Generate reports and analytics

### Admin
- All operator permissions
- Manage users within their company
- Configure company settings
- Access audit logs

### Company Admin
- All admin permissions
- Manage company-wide settings
- Access billing and usage information
- Create and manage API keys

### Super Admin
- System-wide access
- Create and manage companies
- Access all data across tenants
- System configuration and maintenance

## Multi-Tenant Considerations

- All users are scoped to a specific company via `companyId`
- User management operations are restricted to the user's company
- API keys are company-specific and can be rotated
- Location data is only tracked for first responders within the company

## Security Considerations

- Passwords are hashed using bcrypt with appropriate salt rounds
- API keys are generated using cryptographically secure random generation
- Failed login attempts are tracked and rate-limited
- Session tokens have appropriate expiration times
- Device tokens are validated before sending notifications

## Future Considerations

As the platform evolves, additional properties may be added:

- **twoFactorEnabled**: Enable 2FA for enhanced security
- **loginHistory**: Track login attempts and devices
- **certifications**: Track first responder certifications and training
- **shiftSchedule**: Work schedule management for operators and responders
- **emergencyContacts**: Emergency contact information