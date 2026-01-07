import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  Grid,
  MenuItem,
  Pagination,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Events: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    severity: '',
  });
  const [page, setPage] = useState(1);

  // Mock data - replace with real API calls
  const mockEvents = [
    {
      id: '1',
      title: 'Person Detected',
      type: 'person_detected',
      severity: 'medium',
      status: 'open',
      camera: 'Front Gate Camera',
      timestamp: '2025-12-12T10:30:00Z',
      confidence: 0.85,
    },
    {
      id: '2',
      title: 'Vehicle Detected',
      type: 'vehicle_detected',
      severity: 'low',
      status: 'acknowledged',
      camera: 'Parking Lot Camera',
      timestamp: '2025-12-12T10:25:00Z',
      confidence: 0.92,
    },
    {
      id: '3',
      title: 'Unauthorized Access',
      type: 'unauthorized_access',
      severity: 'high',
      status: 'investigating',
      camera: 'Side Entrance Camera',
      timestamp: '2025-12-12T10:18:00Z',
      confidence: 0.78,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'acknowledged': return 'warning';
      case 'investigating': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box sx={{ height: 'calc(100vh - 112px)', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Event Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Monitor and manage security events from your camera network.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/events/submit')}
          sx={{ height: 'fit-content' }}
        >
          Submit Event
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="acknowledged">Acknowledged</MenuItem>
              <MenuItem value="investigating">Investigating</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="person_detected">Person Detected</MenuItem>
              <MenuItem value="vehicle_detected">Vehicle Detected</MenuItem>
              <MenuItem value="motion_detected">Motion Detected</MenuItem>
              <MenuItem value="unauthorized_access">Unauthorized Access</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Severity"
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            >
              <MenuItem value="">All Severities</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setFilters({ status: '', type: '', severity: '' })}
              sx={{ height: '56px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Events Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Camera</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockEvents.map((event) => (
              <TableRow key={event.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">{event.title}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={event.type.replace('_', ' ')}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={event.severity}
                    size="small"
                    color={getSeverityColor(event.severity) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={event.status}
                    size="small"
                    color={getStatusColor(event.status) as any}
                    variant="filled"
                  />
                </TableCell>
                <TableCell>{event.camera}</TableCell>
                <TableCell>{formatTimestamp(event.timestamp)}</TableCell>
                <TableCell>{(event.confidence * 100).toFixed(1)}%</TableCell>
                <TableCell align="center">
                  <IconButton size="small" title="View Details">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" title="Acknowledge">
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton size="small" title="Assign">
                    <AssignmentIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={10}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default Events;