import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

/**
 * Profile Component - User profile management page
 * Features:
 * - View and edit user account information
 * - Display performance statistics
 * - Show recent activity history
 * - Profile picture with initials
 */
const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    department: 'Security Operations',
  });

  // Mock recent activity data - replace with API call
  const recentActivity = [
    {
      id: 1,
      action: 'Acknowledged event #EV-2024-001',
      timestamp: '2 hours ago',
      type: 'event',
    },
    {
      id: 2,
      action: 'Updated camera settings - Front Gate',
      timestamp: '5 hours ago',
      type: 'camera',
    },
    {
      id: 3,
      action: 'Resolved security incident',
      timestamp: '1 day ago',
      type: 'incident',
    },
    {
      id: 4,
      action: 'Login from new device',
      timestamp: '2 days ago',
      type: 'security',
    },
  ];

  // Mock performance statistics - replace with API call
  const stats = [
    { label: 'Events Handled', value: '142', color: 'primary' },
    { label: 'Active Cameras', value: '8', color: 'success' },
    { label: 'Hours Online', value: '24.5', color: 'info' },
    { label: 'Incidents Resolved', value: '23', color: 'warning' },
  ];

  /**
   * Handle profile save action
   * TODO: Implement API call to update user profile
   */
  const handleSaveProfile = () => {
    // API call to save profile changes would go here
    console.log('Saving profile:', editData);
    setEditDialogOpen(false);
  };

  /**
   * Get appropriate icon for activity type
   * @param type - The type of activity
   * @returns JSX element with the corresponding icon
   */
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <NotificationsIcon fontSize="small" color="primary" />;
      case 'camera':
        return <SecurityIcon fontSize="small" color="info" />;
      case 'incident':
        return <SecurityIcon fontSize="small" color="error" />;
      case 'security':
        return <SecurityIcon fontSize="small" color="warning" />;
      default:
        return <HistoryIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 112px)', overflow: 'auto' }}>
      {/* Page Header */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        User Profile
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Manage your account settings and view your activity.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {user?.username || 'User Name'}
            </Typography>
            
            <Chip
              label={user?.role?.toUpperCase() || 'OPERATOR'}
              color="primary"
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Security Operations Team
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
              sx={{ mt: 2 }}
              fullWidth
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>

        {/* Account Information and Statistics */}
        <Grid item xs={12} md={8}>
          {/* Account Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {user?.username || 'Not set'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {user?.email || 'Not set'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  +1 (555) 123-4567
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Security Operations
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {user?.role || 'Operator'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Login
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Performance Statistics */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Statistics
            </Typography>
            
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography 
                        variant="h4" 
                        color={`${stat.color}.main`}
                        fontWeight="bold"
                      >
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            
            <List>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={activity.timestamp}
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department"
                value={editData.department}
                onChange={(e) => setEditData({ ...editData, department: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;