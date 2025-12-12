# User Data Model for Event Monitoring and Management Platform

## User Model

The user model defines the structure of user data within the Event Monitoring and Management Platform. It includes essential properties that facilitate user authentication, authorization, and role management.

### Properties

- **user_id**: Unique identifier for the user (String, UUID)
- **username**: The username chosen by the user (String, required, unique)
- **hashed_password**: The hashed password for user authentication (String, required)
- **email**: The email address of the user (String, required, unique)
- **role**: The role assigned to the user within the system (String, required, enum: ['admin', 'operator'])
- **created_at**: Timestamp indicating when the user was created (Date, default: current date)
- **updated_at**: Timestamp indicating the last time the user data was updated (Date, default: current date)

### Example User Document

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "hashed_password": "$2b$10$EIXZ5Z1e5Z5Z5Z5Z5Z5Z5O",
  "email": "john.doe@example.com",
  "role": "operator",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Notes

- Ensure that passwords are stored securely using hashing algorithms.
- User roles are critical for managing access control within the platform.
- Timestamps should be automatically managed by the database or application logic to maintain data integrity.