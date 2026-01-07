import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  VolumeUp as VolumeIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

/**
 * Settings Component - System configuration and user preferences
 * Features:
 * - Notification preferences (email, push, SMS)
 * - Display settings (theme, language, timezone)
 * - Audio configuration (volume, sound alerts)
 * - Security settings (2FA, session timeout)
 * - System preferences (auto-refresh, caching)
 * - Password change functionality
 */
const Settings: React.FC = () => {
  // Settings state with all configuration categories
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      smsAlerts: false,
      eventNotifications: true,
      systemAlerts: true,
      maintenanceNotifications: false,
    },
    display: {
      darkMode: false,
      compactView: false,
      showGrid: true,
      animationsEnabled: true,
      language: 'en',
      timezone: 'America/New_York',
    },
    audio: {
      alertSounds: true,
      notificationVolume: 70,
      eventSounds: true,
      systemSounds: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      autoLogout: true,
      passwordExpiry: 90,
    },
    system: {
      autoRefresh: true,
      refreshInterval: 5,
      cacheEnabled: true,
      debugMode: false,
    },
  });

  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  /**
   * Handle changes to individual settings
   * @param category - Settings category (notifications, display, etc.)
   * @param setting - Specific setting name
   * @param value - New value for the setting
   */
  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
  };

  /**
   * Save all settings to backend
   * TODO: Implement API call to persist settings
   */
  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // API call would go here
  };

  /**
   * Reset all settings to default values
   * TODO: Implement reset functionality
   */
  const handleResetSettings = () => {
    console.log('Resetting settings to defaults');
    // Reset logic would go here
  };

  /**
   * Handle password change request
   * TODO: Implement password change API call
   */
  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Changing password');
    setChangePasswordDialog(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  /**
   * Reusable settings section component
   */
  const SettingsSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 112px)', overflow: 'auto' }}>
      {/* Page Header */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        System Settings
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Configure your preferences and system behavior.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <SettingsSection
            title="Notifications"
            icon={<NotificationsIcon color="primary" />}
          >
            <List>
              <ListItem>
                <ListItemText
                  primary="Email Alerts"
                  secondary="Receive alerts via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.emailAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'emailAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Push Notifications"
                  secondary="Browser push notifications"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="SMS Alerts"
                  secondary="Critical alerts via SMS"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.smsAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'smsAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Event Notifications"
                  secondary="Alerts for new security events"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.eventNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'eventNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </SettingsSection>
        </Grid>

        {/* Display Settings */}
        <Grid item xs={12} md={6}>
          <SettingsSection
            title="Display"
            icon={<PaletteIcon color="primary" />}
          >
            <List>
              <ListItem>
                <ListItemText
                  primary="Dark Mode"
                  secondary="Use dark theme"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.display.darkMode}
                    onChange={(e) => handleSettingChange('display', 'darkMode', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Compact View"
                  secondary="Reduce spacing and padding"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.display.compactView}
                    onChange={(e) => handleSettingChange('display', 'compactView', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Show Grid Lines"
                  secondary="Display grid lines in tables"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.display.showGrid}
                    onChange={(e) => handleSettingChange('display', 'showGrid', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2 }}>
              <TextField
                select
                fullWidth
                label="Language"
                value={settings.display.language}
                onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </TextField>
              
              <TextField
                select
                fullWidth
                label="Timezone"
                value={settings.display.timezone}
                onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
              >
                <MenuItem value="America/New_York">Eastern Time</MenuItem>
                <MenuItem value="America/Chicago">Central Time</MenuItem>
                <MenuItem value="America/Denver">Mountain Time</MenuItem>
                <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
              </TextField>
            </Box>
          </SettingsSection>
        </Grid>

        {/* Audio Settings */}
        <Grid item xs={12} md={6}>
          <SettingsSection
            title="Audio"
            icon={<VolumeIcon color="primary" />}
          >
            <List>
              <ListItem>
                <ListItemText
                  primary="Alert Sounds"
                  secondary="Play sounds for alerts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.audio.alertSounds}
                    onChange={(e) => handleSettingChange('audio', 'alertSounds', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Event Sounds"
                  secondary="Play sounds for new events"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.audio.eventSounds}
                    onChange={(e) => handleSettingChange('audio', 'eventSounds', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2, px: 2 }}>
              <Typography gutterBottom>
                Notification Volume: {settings.audio.notificationVolume}%
              </Typography>
              <Slider
                value={settings.audio.notificationVolume}
                onChange={(_, value) => handleSettingChange('audio', 'notificationVolume', value)}
                min={0}
                max={100}
                step={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </SettingsSection>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <SettingsSection
            title="Security"
            icon={<SecurityIcon color="primary" />}
          >
            <List>
              <ListItem>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary="Add an extra layer of security"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Auto Logout"
                  secondary="Automatically logout on inactivity"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.security.autoLogout}
                    onChange={(e) => handleSettingChange('security', 'autoLogout', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Session Timeout (minutes)"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setChangePasswordDialog(true)}
                fullWidth
              >
                Change Password
              </Button>
            </Box>
          </SettingsSection>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12}>
          <SettingsSection
            title="System"
            icon={<SecurityIcon color="primary" />}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Auto Refresh"
                      secondary="Automatically refresh data"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.system.autoRefresh}
                        onChange={(e) => handleSettingChange('system', 'autoRefresh', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Cache Enabled"
                      secondary="Cache data for better performance"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.system.cacheEnabled}
                        onChange={(e) => handleSettingChange('system', 'cacheEnabled', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Refresh Interval (seconds)"
                  value={settings.system.refreshInterval}
                  onChange={(e) => handleSettingChange('system', 'refreshInterval', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                  disabled={!settings.system.autoRefresh}
                />
              </Grid>
            </Grid>
          </SettingsSection>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleResetSettings}
          >
            Reset to Defaults
          </Button>
          
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Box>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordDialog}
        onClose={() => setChangePasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;