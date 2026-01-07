import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Autocomplete,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  PhotoCamera as PhotoIcon,
  Videocam as VideoIcon,
  Upload as UploadIcon,
  Map as MapIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Traffic as TrafficIcon,
  CrisisAlert as EmergencyIcon,
  Build as BuildIcon,
  Person as PersonIcon,
  Notifications as NotificationIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate, useLocation } from 'react-router-dom';

// Event types with icons and descriptions
const eventTypes = [
  { value: 'security_incident', label: 'Security Incident', icon: <SecurityIcon />, description: 'Unauthorized access, theft, vandalism' },
  { value: 'traffic_violation', label: 'Traffic Violation', icon: <TrafficIcon />, description: 'Speeding, illegal parking, running red lights' },
  { value: 'emergency', label: 'Emergency', icon: <EmergencyIcon />, description: 'Medical emergency, fire, natural disaster' },
  { value: 'maintenance_needed', label: 'Maintenance Needed', icon: <BuildIcon />, description: 'Equipment failure, infrastructure issues' },
  { value: 'user_report', label: 'User Report', icon: <PersonIcon />, description: 'General public reports and complaints' },
  { value: 'system_alert', label: 'System Alert', icon: <NotificationIcon />, description: 'Automated system notifications' },
  { value: 'suspicious_activity', label: 'Suspicious Activity', icon: <WarningIcon />, description: 'Unusual behavior or activity' },
  { value: 'other', label: 'Other', icon: <NotificationIcon />, description: 'Other types of incidents' }
];

const severityLevels = [
  { value: 'low', label: 'Low', color: '#4caf50', description: 'Minor issue, non-urgent' },
  { value: 'medium', label: 'Medium', color: '#ff9800', description: 'Moderate issue, should be addressed' },
  { value: 'high', label: 'High', color: '#f44336', description: 'Serious issue, requires prompt attention' },
  { value: 'critical', label: 'Critical', color: '#d32f2f', description: 'Very serious, immediate action required' },
  { value: 'emergency', label: 'Emergency', color: '#b71c1c', description: 'Life-threatening, emergency response needed' }
];

const priorityLevels = [
  { value: 1, label: 'Highest', color: '#d32f2f' },
  { value: 2, label: 'High', color: '#f44336' },
  { value: 3, label: 'Medium', color: '#ff9800' },
  { value: 4, label: 'Low', color: '#4caf50' },
  { value: 5, label: 'Lowest', color: '#9e9e9e' }
];

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        onLocationSelect(lat, lng);
      },
    });
    return null;
  };

  return (
    <Box sx={{ height: '300px', width: '100%', border: '1px solid #ccc', borderRadius: 1 }}>
      <MapContainer
        center={position || [40.7831, -73.9712]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        {position && (
          <Marker
            position={[position.lat, position.lng]}
            icon={L.divIcon({
              html: `<div style="background: #f44336; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
              className: 'custom-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          />
        )}
      </MapContainer>
    </Box>
  );
};

const EventSubmission: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    severity: 'medium',
    priority: 3,
    location: {
      coordinates: [0, 0],
      address: '',
      accuracy: 0
    },
    cameraId: '',
    detectionId: '',
    reporter: {
      name: '',
      email: '',
      phone: '',
      isAnonymous: false
    },
    tags: [] as string[],
    source: 'user_report',
    publiclyVisible: false,
    media: {
      images: [] as string[],
      videos: [] as string[],
      attachments: [] as any[]
    }
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');

  // Check if we're promoting a detection
  const detectionData = location.state?.detection;

  useEffect(() => {
    // Load cameras for selection
    loadCameras();

    // Pre-fill form if promoting from detection
    if (detectionData) {
      setFormData(prev => ({
        ...prev,
        title: `Detection: ${detectionData.type.replace('_', ' ')}`,
        description: detectionData.description || `AI detected ${detectionData.type.replace('_', ' ')} with ${Math.round(detectionData.confidence * 100)}% confidence`,
        type: mapDetectionTypeToEventType(detectionData.type),
        severity: detectionData.severity || 'medium',
        detectionId: detectionData._id,
        location: {
          coordinates: detectionData.location.coordinates,
          address: detectionData.location.address || '',
          accuracy: detectionData.location.accuracy || 0
        },
        cameraId: detectionData.cameraId,
        source: 'ai_detection'
      }));
    }
  }, [detectionData]);

  const loadCameras = async () => {
    try {
      // Mock camera data - replace with actual API call
      const mockCameras = [
        { _id: '1', name: 'Main Entrance', location: { address: 'Main St & 1st Ave' } },
        { _id: '2', name: 'Parking Lot A', location: { address: 'Parking Area North' } },
        { _id: '3', name: 'Emergency Exit', location: { address: 'Building Rear Exit' } }
      ];
      setCameras(mockCameras);
    } catch (error) {
      console.error('Failed to load cameras:', error);
    }
  };

  const mapDetectionTypeToEventType = (detectionType: string) => {
    const mapping: { [key: string]: string } = {
      'motion_detected': 'suspicious_activity',
      'person_detected': 'security_incident',
      'vehicle_detected': 'traffic_violation',
      'object_detected': 'suspicious_activity',
      'user_submitted': 'user_report',
      'ai_flagged': 'system_alert'
    };
    return mapping[detectionType] || 'other';
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [lng, lat] // Note: GeoJSON format is [longitude, latitude]
      }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};

    if (step === 0) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.type) newErrors.type = 'Event type is required';
      if (!formData.severity) newErrors.severity = 'Severity is required';
    }

    if (step === 1) {
      if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
        newErrors.location = 'Please select a location on the map';
      }
    }

    if (step === 3 && !formData.reporter.isAnonymous) {
      if (!formData.reporter.name.trim()) newErrors['reporter.name'] = 'Name is required for non-anonymous reports';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header here
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          navigate('/events', { 
            state: { 
              message: 'Event submitted successfully!',
              newEventId: data.data._id 
            }
          });
        }, 2000);
      } else {
        setErrors(data.errors || { general: data.message });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ general: 'Failed to submit event. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    'Event Details',
    'Location',
    'Media & Additional Info',
    'Reporter Information',
    'Review & Submit'
  ];

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="Brief description of the event"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Event Type"
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        <Box>
                          <Typography variant="body1">{type.label}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  label="Severity"
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                >
                  {severityLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: level.color
                          }}
                        />
                        <Box>
                          <Typography variant="body1">{level.label}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {level.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  {priorityLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: level.color
                          }}
                        />
                        <Typography>{level.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the event, what happened, when, and any other relevant information..."
                helperText="Provide as much detail as possible to help responders understand the situation"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Event Location
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Click on the map to select the exact location where the event occurred.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={
                  formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0
                    ? { lat: formData.location.coordinates[1], lng: formData.location.coordinates[0] }
                    : undefined
                }
              />
              {errors.location && (
                <Typography color="error" variant="caption">
                  {errors.location}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address (Optional)"
                value={formData.location.address}
                onChange={(e) => handleInputChange('location.address', e.target.value)}
                placeholder="Street address or landmark description"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  options={cameras}
                  getOptionLabel={(option) => `${option.name} - ${option.location?.address || 'No address'}`}
                  value={cameras.find(cam => cam._id === formData.cameraId) || null}
                  onChange={(event, newValue) => handleInputChange('cameraId', newValue?._id || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Associated Camera (Optional)"
                      placeholder="Select the camera that captured this event"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <VideoIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {option.location?.address || 'No address available'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Media & Additional Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2, border: '2px dashed #ccc' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    Upload Photos or Videos
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Drag and drop files here or click to select
                  </Typography>
                  <Button variant="outlined" component="label">
                    Select Files
                    <input type="file" hidden multiple accept="image/*,video/*" />
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag}>Add</Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.publiclyVisible}
                    onChange={(e) => handleInputChange('publiclyVisible', e.target.checked)}
                  />
                }
                label="Make this event publicly visible"
              />
              <Typography variant="caption" display="block" color="textSecondary">
                Public events may be visible to community members and in public feeds
              </Typography>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Reporter Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.reporter.isAnonymous}
                    onChange={(e) => handleInputChange('reporter.isAnonymous', e.target.checked)}
                  />
                }
                label="Submit anonymously"
              />
              <Typography variant="caption" display="block" color="textSecondary">
                Anonymous reports will not include your personal information
              </Typography>
            </Grid>

            {!formData.reporter.isAnonymous && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    value={formData.reporter.name}
                    onChange={(e) => handleInputChange('reporter.name', e.target.value)}
                    error={!!errors['reporter.name']}
                    helperText={errors['reporter.name']}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email (Optional)"
                    type="email"
                    value={formData.reporter.email}
                    onChange={(e) => handleInputChange('reporter.email', e.target.value)}
                    helperText="We'll use this to update you on the event status"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number (Optional)"
                    value={formData.reporter.phone}
                    onChange={(e) => handleInputChange('reporter.phone', e.target.value)}
                    helperText="For urgent follow-up if needed"
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review Your Submission
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6">{formData.title}</Typography>
                      <Typography color="textSecondary">{formData.description}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Type:</Typography>
                      <Typography>
                        {eventTypes.find(t => t.value === formData.type)?.label || formData.type}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Severity:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: severityLevels.find(s => s.value === formData.severity)?.color
                          }}
                        />
                        <Typography>{formData.severity.toUpperCase()}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Location:</Typography>
                      <Typography>
                        {formData.location.address || `${formData.location.coordinates[1].toFixed(6)}, ${formData.location.coordinates[0].toFixed(6)}`}
                      </Typography>
                    </Grid>
                    
                    {formData.tags.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Tags:</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {formData.tags.map(tag => (
                            <Chip key={tag} label={tag} size="small" />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {errors.general && (
              <Grid item xs={12}>
                <Alert severity="error">{errors.general}</Alert>
              </Grid>
            )}

            {success && (
              <Grid item xs={12}>
                <Alert severity="success" icon={<CheckIcon />}>
                  Event submitted successfully! Redirecting to events page...
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              {detectionData ? 'Promote Detection to Event' : 'Submit New Event'}
            </Typography>
            <IconButton onClick={() => navigate(-1)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {detectionData && (
            <Alert severity="info" sx={{ mb: 3 }}>
              You are promoting an AI detection to a confirmed event. Some fields have been pre-filled based on the detection data.
            </Alert>
          )}

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    {getStepContent(index)}
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    {index > 0 && (
                      <Button
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                    )}
                    {index < steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || success}
                      >
                        {loading ? 'Submitting...' : 'Submit Event'}
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventSubmission;
