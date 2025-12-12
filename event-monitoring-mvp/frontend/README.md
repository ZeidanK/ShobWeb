# Frontend - Event Monitoring MVP

Modern React.js frontend application for the Event Monitoring system with real-time dashboards, interactive maps, and comprehensive camera management.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Modern browser** with ES2020 support

### Development Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Create environment file
   cp .env.example .env
   
   # Edit with your settings
   nano .env
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Access Application**
   - Open http://localhost:3000
   - Login with default credentials: `admin@example.com` / `password123`
cd frontend
npm install
```

### 2. Environment Setup
```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 3. Start Development Server
```bash
npm start
```

The frontend will be available at: http://localhost:3000

## Environment Configuration

Edit the `.env` file with these settings:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Map Configuration (Get your token from https://mapbox.com)
REACT_APP_MAPBOX_TOKEN=your-mapbox-access-token-here
REACT_APP_DEFAULT_MAP_CENTER_LAT=40.7128
REACT_APP_DEFAULT_MAP_CENTER_LNG=-74.0060
REACT_APP_DEFAULT_MAP_ZOOM=10

# Video Configuration
REACT_APP_VIDEO_REFRESH_INTERVAL=30000
REACT_APP_MAX_VIDEO_STREAMS=4

# UI Configuration
REACT_APP_EVENTS_REFRESH_INTERVAL=5000
REACT_APP_PAGINATION_SIZE=20

# Debug
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=debug
```

## Available Scripts

### Development
```bash
npm start          # Start development server (hot reload)
npm test           # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format code with Prettier
```

### Production
```bash
npm run build      # Create production build
npm run preview    # Preview production build locally
```

## Getting a Mapbox Token

1. Go to https://mapbox.com
2. Sign up for a free account
3. Go to Account → Access Tokens
4. Create a new token or copy the default public token
5. Add it to your `.env` file as `REACT_APP_MAPBOX_TOKEN`

## Troubleshooting

### Common Issues

**1. Dependencies not installing:**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**2. Port 3000 already in use:**
```bash
# Kill process on port 3000
sudo lsof -t -i:3000 | xargs kill -9
# Or use a different port
PORT=3001 npm start
```

**3. Environment variables not loading:**
- Make sure `.env` file is in the frontend root directory
- Restart the development server after changing `.env`
- Environment variables must start with `REACT_APP_`

**4. API connection issues:**
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in `.env`
- Check browser console for CORS errors

### Development Tips

1. **Hot Reload**: The dev server automatically reloads when you save files
2. **Browser Extensions**: Install React Developer Tools for debugging
3. **Network Tab**: Use browser dev tools to monitor API calls
4. **Console Logs**: Check browser console for errors and warnings

## Project Structure

```
frontend/
├── public/          # Static files
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Page components
│   ├── store/       # Redux store and slices
│   ├── services/    # API services
│   ├── hooks/       # Custom React hooks
│   ├── utils/       # Utility functions
│   ├── types/       # TypeScript type definitions
│   ├── App.tsx      # Main App component
│   └── index.tsx    # App entry point
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── .env.example     # Environment template
```

## Next Steps

After the frontend is running:

1. **Backend Setup**: Follow `../backend/README.md` to start the API server
2. **Database**: Set up MongoDB (see main project README)
3. **AI Service**: Configure the Python AI service (see `../ai-service/README.md`)
4. **Full Stack**: Use Docker Compose for complete setup (see main README)