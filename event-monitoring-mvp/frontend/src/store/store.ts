import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Auth slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';

/**
 * Authentication State Interface
 * Defines the structure of authentication-related state
 */
interface AuthState {
  user: User | null;           // Current authenticated user data
  token: string | null;        // JWT authentication token
  isAuthenticated: boolean;    // Authentication status flag
  loading: boolean;            // Loading state for auth operations
}

/**
 * Initial Authentication State
 * Default values when the app starts
 */
const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

/**
 * Authentication Redux Slice
 * Manages user authentication state and actions
 * 
 * Actions:
 * - loginStart: Sets loading state when login begins
 * - loginSuccess: Stores user data and token on successful login
 * - loginFailure: Clears auth data on login failure
 * - logout: Clears all authentication data
 * - updateUser: Updates current user information
 */
const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    // Set loading state when login process starts
    loginStart: (state) => {
      state.loading = true;
    },
    // Handle successful login - store user data and token
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    // Handle login failure - clear authentication data
    loginFailure: (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    // Handle logout - reset to initial state
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    // Update user profile information
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

/**
 * User Interface State Interface
 * Defines the structure of UI-related state
 */
interface UIState {
  sidebarOpen: boolean;        // Sidebar visibility state
  theme: 'light' | 'dark';    // Application theme preference
  notifications: Array<{      // In-app notification system
    id: string;               // Unique notification identifier
    type: 'success' | 'error' | 'warning' | 'info'; // Notification type
    message: string;          // Notification content
    timestamp: string;        // When notification was created
  }>;
}

/**
 * Initial UI State
 * Default values for user interface components
 */
const initialUIState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
};

/**
 * User Interface Redux Slice
 * Manages application UI state and user preferences
 * 
 * Actions:
 * - toggleSidebar: Toggle sidebar visibility
 * - setSidebarOpen: Explicitly set sidebar open/closed state
 * - setTheme: Switch between light/dark themes
 * - addNotification: Add new notification to the queue
 * - removeNotification: Remove notification by ID
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    // Toggle sidebar open/closed state
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    // Explicitly set sidebar visibility
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    // Set application theme (light/dark mode)
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    // Add new notification to the notification queue
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
      const notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9), // Generate unique ID
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    // Remove notification from queue by ID
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    // Clear all notifications from the queue
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

/**
 * Root Reducer Configuration
 * Combines all individual slice reducers into a single root reducer
 * This allows multiple slices to work together in the Redux store
 */
const rootReducer = combineReducers({
  auth: authSlice.reducer,  // Authentication state management
  ui: uiSlice.reducer,      // User interface state management
});

/**
 * Redux Persist Configuration
 * Configures which parts of the Redux state should be persisted
 * to localStorage between browser sessions
 */
const persistConfig = {
  key: 'root',                    // Storage key in localStorage
  storage,                        // Storage engine (localStorage)
  whitelist: ['auth'],           // Only persist auth state (UI state resets on refresh)
};

// Create persisted reducer with the configuration
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux Store Configuration
 * Creates the main Redux store with middleware and persistence
 * 
 * Features:
 * - Redux Toolkit for modern Redux patterns
 * - Redux Persist for state persistence
 * - Custom middleware configuration for serialization
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions that contain non-serializable values
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

/**
 * Redux Persistor
 * Creates the persistor instance for managing state persistence
 */
export const persistor = persistStore(store);

/**
 * TypeScript Types for Redux Store
 * These types enable proper type checking throughout the application
 */
export type RootState = ReturnType<typeof store.getState>;  // Type for the entire Redux state
export type AppDispatch = typeof store.dispatch;           // Type for the dispatch function

/**
 * Authentication Actions Export
 * These actions can be dispatched from components to manage auth state
 */
export const {
  loginStart,      // Start login process (set loading)
  loginSuccess,    // Complete successful login
  loginFailure,    // Handle login failure
  logout,          // Clear authentication data
  updateUser,      // Update user profile information
} = authSlice.actions;

/**
 * UI Actions Export
 * These actions can be dispatched from components to manage UI state
 */
export const {
  toggleSidebar,      // Toggle sidebar visibility
  setSidebarOpen,     // Set sidebar open/closed state
  setTheme,           // Switch application theme
  addNotification,    // Add notification to queue
  removeNotification, // Remove specific notification
  clearNotifications, // Clear all notifications
} = uiSlice.actions;