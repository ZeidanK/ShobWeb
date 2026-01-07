# Event Monitoring and Management Platform

## Overview

The Event Monitoring and Management Platform is designed to provide real-time monitoring and management of environmental, safety, and security events. This platform integrates live video streams, AI-based video analytics, a GIS map for visualization, and an event management system to log and track incidents.

## Project Structure

The project is organized into several key directories and files:

- **docs/**: Contains documentation related to prompts, architecture, API specifications, data models, non-functional requirements, and the project roadmap.
- **src/**: Contains the source code for the application, including the entry point and type definitions.
- **package.json**: Configuration file for npm, listing dependencies and scripts.
- **tsconfig.json**: Configuration file for TypeScript, specifying compiler options.

## Getting Started

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd event-monitoring-mvp-architecture
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

## Features

- **Live Video Streaming**: Connect to IP cameras and view live feeds.
- **AI Detection**: Utilize AI models for detecting people, vehicles, and suspicious behavior.
- **Event Management**: Log, classify, and track incidents in real-time.
- **GIS Mapping**: Visualize camera locations and events on an interactive map.
- **User Authentication**: Secure access with role-based authentication.

## Future Enhancements

The project roadmap includes plans for additional features and improvements in future phases, such as:

- Integration of multiple AI models for enhanced detection capabilities.
- Advanced event lifecycle management and reporting features.
- Scalability improvements to support a larger number of cameras and users.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.