# Backend Controllers

This directory contains all the controller modules that handle HTTP request processing for the Event Monitoring System API. Controllers act as the interface between HTTP routes and business logic, handling request validation, calling appropriate services, and formatting responses.

## Architecture Overview

Controllers follow the **MVC (Model-View-Controller)** pattern where:
- **Models**: Handle data structure and database operations
- **Views**: JSON API responses (no traditional views in REST API)
- **Controllers**: Process requests, validate input, coordinate with models, return responses

## Controller Structure

Each controller module exports functions that:
1. **Receive** Express Request and Response objects
2. **Validate** incoming data and authentication
3. **Process** business logic using models and services
4. **Return** standardized JSON responses
5. **Handle** errors gracefully

## Available Controllers

### 📝 Authentication Controller (`authController.ts`)
Handles user authentication and authorization operations.

**Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

**Features:**
- JWT token generation and validation
- Password hashing with bcrypt
- User session management
- Role-based access control setup

### 📹 Camera Controller (`cameraController.ts`)
Manages camera devices and their configurations.

**Endpoints:**
- `GET /api/cameras` - List all cameras with filtering
- `POST /api/cameras` - Create new camera
- `GET /api/cameras/:id` - Get specific camera details
- `PUT /api/cameras/:id` - Update camera settings
- `DELETE /api/cameras/:id` - Delete camera
- `POST /api/cameras/:id/status` - Update camera status

**Features:**
- Camera CRUD operations
- Stream URL validation
- Location data handling
- Status monitoring integration

### 🚨 Event Controller (`eventController.ts`)
Handles security events and incident management.

**Endpoints:**
- `GET /api/events` - List events with advanced filtering
- `POST /api/events` - Create new event (typically from AI service)
- `GET /api/events/:id` - Get detailed event information
- `PUT /api/events/:id` - Update event status/details
- `POST /api/events/:id/acknowledge` - Acknowledge event
- `POST /api/events/:id/resolve` - Mark event as resolved
- `POST /api/events/:id/notes` - Add investigation notes

**Features:**
- Event lifecycle management
- Severity-based filtering
- Real-time event notifications
- Investigation workflow support

### 👥 User Controller (`userController.ts`)
Manages user accounts and administrative operations.

**Endpoints:**
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `GET /api/users/:id` - Get specific user details
- `PUT /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Deactivate user account
- `POST /api/users/:id/activate` - Activate user account

**Features:**
- User management CRUD operations
- Role-based authorization
- Account activation/deactivation
- User activity tracking

## Response Format Standards

All controllers return responses in a consistent JSON format:

```typescript
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "pagination": { /* pagination info for lists */ }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

## Error Handling

Controllers implement comprehensive error handling:

1. **Validation Errors**: Input validation and sanitization
2. **Authentication Errors**: JWT verification and user authorization
3. **Database Errors**: MongoDB operation failures
4. **Business Logic Errors**: Domain-specific validation failures
5. **Server Errors**: Unexpected application errors

All errors are caught and processed by the global error handler middleware.

## Authentication & Authorization

Controllers use middleware for:
- **Authentication**: Verify JWT tokens (`auth` middleware)
- **Authorization**: Check user roles and permissions
- **Rate Limiting**: Prevent abuse and DoS attacks
- **Input Validation**: Sanitize and validate request data

## Real-Time Features

Controllers integrate with Socket.IO for real-time updates:
- Event notifications broadcast to connected clients
- Camera status updates pushed to monitoring dashboards
- User activity logs for administrative oversight

## Database Integration

Controllers interact with MongoDB through Mongoose models:
- **User Model**: User account and profile data
- **Camera Model**: Camera device information and settings
- **Event Model**: Security events and incident data

## Security Considerations

- **Password Security**: bcrypt hashing with salt
- **JWT Security**: Signed tokens with expiration
- **Input Sanitization**: Prevent injection attacks
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Cross-origin request control
- **Helmet Integration**: Security header protection

## Development Guidelines

### Adding New Controllers

1. Create new controller file in this directory
2. Follow naming convention: `{resource}Controller.ts`
3. Implement standard CRUD operations
4. Add comprehensive error handling
5. Include TypeScript type definitions
6. Add JSDoc comments for all functions
7. Create corresponding route file
8. Update this README

### Best Practices

- **Single Responsibility**: Each controller handles one resource type
- **Error Handling**: Always use try-catch blocks
- **Response Consistency**: Follow standard response format
- **Input Validation**: Validate all incoming data
- **Security First**: Implement proper authentication/authorization
- **Documentation**: Add clear comments and JSDoc

### Testing

Controllers should be tested with:
- Unit tests for individual functions
- Integration tests for complete request flows
- Authentication and authorization tests
- Error handling validation
- Performance testing for high-load scenarios

## Dependencies

- **Express**: Web framework for HTTP handling
- **Mongoose**: MongoDB object modeling
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token handling
- **express-validator**: Input validation
- **helmet**: Security middleware

## Related Documentation

- [API Documentation](../../docs/api/)
- [Database Models](../models/README.md)
- [Route Definitions](../routes/README.md)
- [Middleware Documentation](../middleware/README.md)