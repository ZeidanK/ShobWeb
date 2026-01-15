// import React, { useState } from 'react';
// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   TextField,
//   Button,
//   MenuItem,
//   FormControl,
//   FormLabel,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   Switch,
//   Alert,
//   Stepper,
//   Step,
//   StepLabel,
//   Card,
//   CardContent,
//   Divider,
//   IconButton,
//   Tooltip,
// } from '@mui/material';
// import {
//   ArrowBack as ArrowBackIcon,
//   Videocam as VideocamIcon,
//   LocationOn as LocationOnIcon,
//   Settings as SettingsIcon,
//   Cable as TestIcon,
//   Save as SaveIcon,
//   Map as MapIcon,
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import { useFormik } from 'formik';
// import * as yup from 'yup';
// import { toast } from 'react-toastify';
// import { addCamera, CreateCameraData } from '../services/cameraService';
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
// } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Fix for default markers in react-leaflet
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// // Create custom camera preview icon
// const createCameraPreviewIcon = () => {
//   // Helper to safely format coordinates
//   const svgIcon = `
//     <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
//       <circle cx="20" cy="20" r="18" fill="#2196f3" stroke="white" stroke-width="3"/>
//       <path d="M12 14h8v6h-8z M20 17l4-2v6l-4-2z" fill="white"/>
//     </svg>
//   `;

//   return L.divIcon({
//     html: svgIcon,
//     className: 'custom-camera-preview-marker',
//     iconSize: [40, 40],
//     iconAnchor: [20, 20],
//   });
// };
  
// const formatCoord = (val: any) => {
//     const num = Number(val);
//      return isNaN(num) ? '0.000000' : num.toFixed(6);
//   };

// const steps = ['Basic Information', 'Connection Settings', 'Location & Configuration'];

// const validationSchema = yup.object({
//   name: yup
//     .string()
//     .required('Camera name is required')
//     .min(3, 'Name must be at least 3 characters')
//     .max(100, 'Name must be less than 100 characters'),
//   description: yup
//     .string()
//     .max(500, 'Description must be less than 500 characters'),
//   type: yup
//     .string()
//     .required('Camera type is required')
//     .oneOf(['ip', 'analog', 'usb'], 'Invalid camera type'),
//   streamUrl: yup
//     .string()
//     .required('Stream URL is required')
//     .matches(
//       /^(rtsp|rtmp|http|https):\/\/.+/,
//       'Stream URL must be a valid RTSP, RTMP, HTTP, or HTTPS URL'
//     ),
//   locationAddress: yup
//     .string()
//     .required('Location address is required'),
//   longitude: yup
//     .number()
//     .required('Longitude is required')
//     .min(-180, 'Longitude must be between -180 and 180')
//     .max(180, 'Longitude must be between -180 and 180'),
//   latitude: yup
//     .number()
//     .required('Latitude is required')
//     .min(-90, 'Latitude must be between -90 and 90')
//     .max(90, 'Latitude must be between -90 and 90'),
//   resolution: yup
//     .string()
//     .required('Resolution is required'),
//   fps: yup
//     .number()
//     .required('FPS is required')
//     .min(1, 'FPS must be at least 1')
//     .max(60, 'FPS must be at most 60'),
// });

// const AddCamera: React.FC = () => {
//   const navigate = useNavigate();
//   const [activeStep, setActiveStep] = useState(0);
//   const [testingConnection, setTestingConnection] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
//   const [showMapPreview, setShowMapPreview] = useState(false);

//   const formik = useFormik({
//     initialValues: {
//       name: '',
//       description: '',
//       type: 'ip',
//       streamUrl: '',
//       locationAddress: '',
//       longitude: 0,
//       latitude: 0,
//       resolution: '1920x1080',
//       fps: 30,
//       recordingEnabled: false,
//       motionDetection: true,
//       nightVision: false,
//       audioEnabled: false,
//     },
//     validationSchema,
//     // FILE: frontend/src/pages/AddCamera.tsx
//     onSubmit: async (values) => {
//       try {
//         console.log('Submitting camera data:', values);

//         /**
//          * 1. Transform form values into backend format
//          * Backend expects:
//          * location.coordinates = [longitude, latitude]
//          * FPS and coordinates must be numbers
//          */
//         const payload: CreateCameraData = {
//           name: values.name,
//           description: values.description,
//           type: values.type as 'ip' | 'analog' | 'usb',
//           streamUrl: values.streamUrl,
//           location: {
//             coordinates: [
//               Number(values.longitude),
//               Number(values.latitude),
//             ],
//             address: values.locationAddress,
//           },
//           settings: {
//             resolution: values.resolution,
//             fps: Number(values.fps),
//             recordingEnabled: values.recordingEnabled,
//           },
//         };

//         /**
//          * 2. Save camera to MongoDB via backend
//          */
//         await addCamera(payload);

//         /**
//          * 3. User feedback
//          */
//         toast.success('Camera saved to database successfully!');

//         /**
//          * 4. Navigate back to cameras list
//          */
//         navigate('/cameras');
//       } catch (error: any) {
//         /**
//          * 5. Error handling
//          */
//         console.error('Submission failed', error);
//         toast.error(error.message || 'Failed to add camera');
//       }
//     }
//   });

//   const handleNext = () => {
//     setActiveStep((prev) => prev + 1);
//   };

//   const handleBack = () => {
//     setActiveStep((prev) => prev - 1);
//   };

//   const handleTestConnection = async () => {
//     if (!formik.values.streamUrl) {
//       toast.error('Please enter a stream URL first');
//       return;
//     }

//     setTestingConnection(true);
//     setConnectionStatus('idle');
    
//     try {
//       // TODO: Replace with actual connection test API call
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // Mock test result - 70% chance of success
//       const success = Math.random() > 0.3;
      
//       if (success) {
//         setConnectionStatus('success');
//         toast.success('Connection test successful!');
//       } else {
//         setConnectionStatus('error');
//         toast.error('Connection test failed. Please check your URL and network settings.');
//       }
//     } catch (error) {
//       setConnectionStatus('error');
//       toast.error('Connection test failed');
//     } finally {
//       setTestingConnection(false);
//     }
//   };

//   const getLocationFromAddress = async () => {
//     if (!formik.values.locationAddress) {
//       toast.error('Please enter an address first');
//       return;
//     }

//     try {
//       // Try to extract coordinates from URL if it looks like a Google Maps link
//       if (formik.values.locationAddress.includes('google.com/maps') || 
//           formik.values.locationAddress.includes('maps.app.goo.gl')) {
//         const coords = extractCoordinatesFromUrl(formik.values.locationAddress);
//         if (coords) {
//           formik.setFieldValue('latitude', parseFloat(coords.lat.toFixed(6)));
//           formik.setFieldValue('longitude', parseFloat(coords.lng.toFixed(6)));
//           setShowMapPreview(true);
//           toast.success('Coordinates extracted from Google Maps URL!');
//           return;
//         }
//       }

//       // TODO: Replace with actual geocoding API call (Google Maps, OpenStreetMap, etc.)
//       // For now, using mock geocoding
//       const mockCoordinates = {
//         lat: 40.7128 + (Math.random() - 0.5) * 0.1,
//         lng: -74.0060 + (Math.random() - 0.5) * 0.1,
//       };

//       formik.setFieldValue('latitude', parseFloat(mockCoordinates.lat.toFixed(6)));
//       formik.setFieldValue('longitude', parseFloat(mockCoordinates.lng.toFixed(6)));
      
//       // Automatically show map preview when coordinates are obtained
//       setShowMapPreview(true);
      
//       toast.success('Coordinates updated from address');
//     } catch (error) {
//       toast.error('Failed to get coordinates from address');
//     }
//   };

//   // Extract coordinates from Google Maps URLs
//   const extractCoordinatesFromUrl = (url: string): { lat: number; lng: number } | null => {
//     try {
//       // Handle different Google Maps URL formats
      
//       // Format 1: @lat,lng,zoom (most common)
//       let match = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),?\d*\.?\d*z?/);
//       if (match) {
//         return {
//           lat: parseFloat(match[1]),
//           lng: parseFloat(match[2])
//         };
//       }
      
//       // Format 2: ll=lat,lng
//       match = url.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
//       if (match) {
//         return {
//           lat: parseFloat(match[1]),
//           lng: parseFloat(match[2])
//         };
//       }
      
//       // Format 3: q=lat,lng
//       match = url.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
//       if (match) {
//         return {
//           lat: parseFloat(match[1]),
//           lng: parseFloat(match[2])
//         };
//       }
      
//       // Format 4: destination=lat,lng
//       match = url.match(/destination=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
//       if (match) {
//         return {
//           lat: parseFloat(match[1]),
//           lng: parseFloat(match[2])
//         };
//       }
      
//       // Format 5: center=lat,lng
//       match = url.match(/center=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
//       if (match) {
//         return {
//           lat: parseFloat(match[1]),
//           lng: parseFloat(match[2])
//         };
//       }
      
//       return null;
//     } catch (error) {
//       console.error('Error extracting coordinates from URL:', error);
//       return null;
//     }
//   };

//   const renderStepContent = (step: number) => {
//     switch (step) {
//       case 0:
//         return (
//           <Grid container spacing={3}>
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Basic Camera Information
//               </Typography>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 id="name"
//                 name="name"
//                 label="Camera Name"
//                 value={formik.values.name}
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 error={formik.touched.name && Boolean(formik.errors.name)}
//                 helperText={formik.touched.name && formik.errors.name}
//                 placeholder="e.g., Front Gate Camera"
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <FormControl component="fieldset" fullWidth>
//                 <FormLabel component="legend">Camera Type</FormLabel>
//                 <RadioGroup
//                   name="type"
//                   value={formik.values.type}
//                   onChange={formik.handleChange}
//                   row
//                 >
//                   <FormControlLabel value="ip" control={<Radio />} label="IP Camera" />
//                   <FormControlLabel value="analog" control={<Radio />} label="Analog" />
//                   <FormControlLabel value="usb" control={<Radio />} label="USB" />
//                 </RadioGroup>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 id="description"
//                 name="description"
//                 label="Description (Optional)"
//                 multiline
//                 rows={3}
//                 value={formik.values.description}
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 error={formik.touched.description && Boolean(formik.errors.description)}
//                 helperText={formik.touched.description && formik.errors.description}
//                 placeholder="Describe the camera's purpose and coverage area..."
//               />
//             </Grid>
//           </Grid>
//         );

//       case 1:
//         return (
//           <Grid container spacing={3}>
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Connection Settings
//               </Typography>
//             </Grid>
//             <Grid item xs={12}>
//               <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
//                 <TextField
//                   fullWidth
//                   id="streamUrl"
//                   name="streamUrl"
//                   label="Stream URL"
//                   value={formik.values.streamUrl}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   error={formik.touched.streamUrl && Boolean(formik.errors.streamUrl)}
//                   helperText={formik.touched.streamUrl && formik.errors.streamUrl}
//                   placeholder="rtsp://username:password@camera-ip:554/stream"
//                 />
//                 <Button
//                   variant="outlined"
//                   onClick={handleTestConnection}
//                   disabled={testingConnection}
//                   startIcon={<TestIcon />}
//                   sx={{ minWidth: 140, height: 56 }}
//                 >
//                   {testingConnection ? 'Testing...' : 'Test'}
//                 </Button>
//               </Box>
//               {connectionStatus === 'success' && (
//                 <Alert severity="success" sx={{ mt: 1 }}>
//                   Connection test successful! Camera stream is accessible.
//                 </Alert>
//               )}
//               {connectionStatus === 'error' && (
//                 <Alert severity="error" sx={{ mt: 1 }}>
//                   Connection failed. Please check the URL, credentials, and network connectivity.
//                 </Alert>
//               )}
//             </Grid>
//             <Grid item xs={12}>
//               <Card variant="outlined">
//                 <CardContent>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Common Stream URL Formats:
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     • RTSP: rtsp://username:password@ip:port/path<br/>
//                     • HTTP: http://ip:port/stream<br/>
//                     • HTTPS: https://ip:port/stream<br/>
//                     • RTMP: rtmp://ip:port/stream
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>
//         );

//       case 2:
//         return (
//           <Grid container spacing={3}>
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Location & Configuration
//               </Typography>
//             </Grid>
//             <Grid item xs={12}>
//               <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
//                 <TextField
//                   fullWidth
//                   id="locationAddress"
//                   name="locationAddress"
//                   label="Location Address or Google Maps URL"
//                   value={formik.values.locationAddress}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   error={formik.touched.locationAddress && Boolean(formik.errors.locationAddress)}
//                   helperText={formik.touched.locationAddress && formik.errors.locationAddress || 
//                     "Enter an address or paste a Google Maps URL for automatic coordinate extraction"}
//                   placeholder="123 Main St, City, State OR https://maps.google.com/..."
//                   multiline
//                   rows={2}
//                 />
//                 <Button
//                   variant="outlined"
//                   onClick={getLocationFromAddress}
//                   startIcon={<LocationOnIcon />}
//                   sx={{ minWidth: 140, height: 56 }}
//                 >
//                   Get Coords
//                 </Button>
//               </Box>
//             </Grid>
            
//             {/* Coordinate Input with Map Preview */}
//             <Grid item xs={12}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//                 <Typography variant="subtitle2">
//                   Camera Coordinates
//                 </Typography>
//                 <Button
//                   variant="outlined"
//                   startIcon={<MapIcon />}
//                   onClick={() => setShowMapPreview(!showMapPreview)}
//                   size="small"
//                 >
//                   {showMapPreview ? 'Hide' : 'Show'} Map Preview
//                 </Button>
//               </Box>
//             </Grid>
            
//             <Grid item xs={6}>
//               <TextField
//                 fullWidth
//                 id="latitude"
//                 name="latitude"
//                 label="Latitude"
//                 type="number"
//                 value={formik.values.latitude}
//                 onChange={(e) => {
//                   formik.handleChange(e);
//                   if (formik.values.longitude !== 0) {
//                     setShowMapPreview(true);
//                   }
//                 }}
//                 onBlur={formik.handleBlur}
//                 error={formik.touched.latitude && Boolean(formik.errors.latitude)}
//                 helperText={formik.touched.latitude && formik.errors.latitude}
//                 inputProps={{ step: 0.000001, min: -90, max: 90 }}
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <TextField
//                 fullWidth
//                 id="longitude"
//                 name="longitude"
//                 label="Longitude"
//                 type="number"
//                 value={formik.values.longitude}
//                 onChange={(e) => {
//                   formik.handleChange(e);
//                   if (formik.values.latitude !== 0) {
//                     setShowMapPreview(true);
//                   }
//                 }}
//                 onBlur={formik.handleBlur}
//                 error={formik.touched.longitude && Boolean(formik.errors.longitude)}
//                 helperText={formik.touched.longitude && formik.errors.longitude}
//                 inputProps={{ step: 0.000001, min: -180, max: 180 }}
//               />
//             </Grid>

//             {/* Interactive Map Preview */}
//             {showMapPreview && formik.values.latitude !== 0 && formik.values.longitude !== 0 && (
//               <Grid item xs={12}>
//                 <Paper elevation={2} sx={{ p: 2 }}>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Camera Location Preview
//                   </Typography>
//                   <Box sx={{ height: 300, borderRadius: 1, overflow: 'hidden' }}>
//                     <MapContainer
//                       center={[formik.values.latitude, formik.values.longitude]}
//                       zoom={15}
//                       scrollWheelZoom={false}
//                       style={{ height: '100%', width: '100%' }}
//                       key={`${formik.values.latitude}-${formik.values.longitude}`}
//                     >
//                       <TileLayer
//                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                       />
//                       <Marker
//                         position={[formik.values.latitude, formik.values.longitude]}
//                         icon={createCameraPreviewIcon()}
//                       >
//                         <Popup>
//                           <Box sx={{ minWidth: 200 }}>
//                             <Typography variant="h6" gutterBottom>
//                               <VideocamIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
//                               {formik.values.name || 'New Camera'}
//                             </Typography>
//                             <Typography variant="body2" gutterBottom>
//                               {formik.values.description || 'Camera location preview'}
//                             </Typography>
//                             <Typography variant="caption" display="block" gutterBottom>
//                               📍 {formik.values.locationAddress || 'No address specified'}
//                             </Typography>
//                             <Typography variant="caption" display="block">
//                               📅 Lat: {formatCoord(formik.values.latitude)}, Lng: {formatCoord(formik.values.longitude)}
//                             </Typography>
//                           </Box>
//                         </Popup>
//                       </Marker>
//                     </MapContainer>
//                   </Box>
//                   <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
//                     💡 This preview shows where your camera will appear on the main map
//                   </Typography>
//                 </Paper>
//               </Grid>
//             )}

//             <Grid item xs={6}>
//               <TextField
//                 fullWidth
//                 id="resolution"
//                 name="resolution"
//                 label="Resolution"
//                 select
//                 value={formik.values.resolution}
//                 onChange={formik.handleChange}
//               >
//                 <MenuItem value="3840x2160">4K (3840x2160)</MenuItem>
//                 <MenuItem value="1920x1080">Full HD (1920x1080)</MenuItem>
//                 <MenuItem value="1280x720">HD (1280x720)</MenuItem>
//                 <MenuItem value="640x480">SD (640x480)</MenuItem>
//               </TextField>
//             </Grid>
//             <Grid item xs={6}>
//               <TextField
//                 fullWidth
//                 id="fps"
//                 name="fps"
//                 label="Frame Rate (FPS)"
//                 type="number"
//                 value={formik.values.fps}
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 error={formik.touched.fps && Boolean(formik.errors.fps)}
//                 helperText={formik.touched.fps && formik.errors.fps}
//                 inputProps={{ min: 1, max: 60 }}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Additional Features
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={6} sm={3}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                     <Typography variant="body2">Recording</Typography>
//                     <Switch
//                       checked={formik.values.recordingEnabled}
//                       onChange={(e) => formik.setFieldValue('recordingEnabled', e.target.checked)}
//                       name="recordingEnabled"
//                     />
//                   </Box>
//                 </Grid>
//                 <Grid item xs={6} sm={3}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                     <Typography variant="body2">Motion Detection</Typography>
//                     <Switch
//                       checked={formik.values.motionDetection}
//                       onChange={(e) => formik.setFieldValue('motionDetection', e.target.checked)}
//                       name="motionDetection"
//                     />
//                   </Box>
//                 </Grid>
//                 <Grid item xs={6} sm={3}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                     <Typography variant="body2">Night Vision</Typography>
//                     <Switch
//                       checked={formik.values.nightVision}
//                       onChange={(e) => formik.setFieldValue('nightVision', e.target.checked)}
//                       name="nightVision"
//                     />
//                   </Box>
//                 </Grid>
//                 <Grid item xs={6} sm={3}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                     <Typography variant="body2">Audio</Typography>
//                     <Switch
//                       checked={formik.values.audioEnabled}
//                       onChange={(e) => formik.setFieldValue('audioEnabled', e.target.checked)}
//                       name="audioEnabled"
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Grid>
//           </Grid>
//         );

//       default:
//         return 'Unknown step';
//     }
//   };

//   return (
//     <Box sx={{ height: 'calc(100vh - 112px)', overflow: 'auto', p: 3 }}>
//       <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
//         <Tooltip title="Back to Cameras">
//           <IconButton onClick={() => navigate('/cameras')} color="primary">
//             <ArrowBackIcon />
//           </IconButton>
//         </Tooltip>
//         <VideocamIcon sx={{ fontSize: 32, color: 'primary.main' }} />
//         <Typography variant="h4" component="h1">
//           Add New Camera
//         </Typography>
//       </Box>

//       <Paper sx={{ p: 3 }}>
//         <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
//           {steps.map((label) => (
//             <Step key={label}>
//               <StepLabel>{label}</StepLabel>
//             </Step>
//           ))}
//         </Stepper>

//         <Box component="form" onSubmit={formik.handleSubmit}>
//           {renderStepContent(activeStep)}

//           <Divider sx={{ my: 4 }} />

//           <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//             <Button
//               disabled={activeStep === 0}
//               onClick={handleBack}
//               variant="outlined"
//             >
//               Back
//             </Button>
//             <Box sx={{ display: 'flex', gap: 2 }}>
//               <Button
//                 variant="outlined"
//                 onClick={() => navigate('/cameras')}
//               >
//                 Cancel
//               </Button>
//               {activeStep === steps.length - 1 ? (
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   disabled={formik.isSubmitting}
//                   startIcon={<SaveIcon />}
//                 >
//                   {formik.isSubmitting ? 'Adding Camera...' : 'Add Camera'}
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={handleNext}
//                   variant="contained"
//                 >
//                   Next
//                 </Button>
//               )}
//             </Box>
//           </Box>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Videocam as VideocamIcon,
  LocationOn as LocationOnIcon,
  Settings as SettingsIcon,
  Cable as TestIcon,
  Save as SaveIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { addCamera, CreateCameraData, getVmsServers, testCameraConnection, VmsServer } from '../services/cameraService';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom camera preview icon
const createCameraPreviewIcon = () => {
  const svgIcon = `
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#2196f3" stroke="white" stroke-width="3"/>
      <path d="M12 14h8v6h-8z M20 17l4-2v6l-4-2z" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-camera-preview-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Helper to safely format coordinates
const formatCoord = (val: any) => {
  const num = Number(val);
  return isNaN(num) ? '0.000000' : num.toFixed(6);
};

const steps = ['Basic Information', 'Connection Settings', 'Location & Configuration'];

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Camera name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters'),
  type: yup
    .string()
    .required('Camera type is required')
    .oneOf(['ip', 'analog', 'usb'], 'Invalid camera type'),
  streamUrl: yup
    .string()
    .required('Stream URL is required')
    .matches(
      /^(rtsp|rtmp|http|https):\/\/.+/,
      'Stream URL must be a valid RTSP, RTMP, HTTP, or HTTPS URL'
    ),
  locationAddress: yup
    .string()
    .optional(),
  longitude: yup
    .number()
    .required('Longitude is required')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  latitude: yup
    .number()
    .required('Latitude is required')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  resolution: yup
    .string()
    .required('Resolution is required'),
  fps: yup
    .number()
    .required('FPS is required')
    .min(1, 'FPS must be at least 1')
    .max(60, 'FPS must be at most 60'),
});

const AddCamera: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [vmsServers, setVmsServers] = useState<VmsServer[]>([]);
  const [vmsLoading, setVmsLoading] = useState(false);
  const [testViaVms, setTestViaVms] = useState(false);
  const [testVmsServerId, setTestVmsServerId] = useState('');
  const [testMonitorId, setTestMonitorId] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      type: 'ip',
      streamUrl: '',
      locationAddress: '',
      longitude: 0,
      latitude: 0,
      resolution: '1920x1080',
      fps: 30,
      recordingEnabled: false,
      motionDetection: true,
      nightVision: false,
      audioEnabled: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      // Guard: only allow submission on the final step to prevent auto-add.
      if (activeStep !== steps.length - 1) {
        toast.warning('Complete all steps before adding the camera.');
        return;
      }

      try {
        console.log('Submitting camera data:', values);

        /**
         * 1. Transform form values into backend format
         * Backend expects:
         * location.coordinates = [longitude, latitude]
         * FPS and coordinates must be numbers
         */
        const payload: CreateCameraData = {
          name: values.name,
          description: values.description,
          type: values.type as 'ip' | 'analog' | 'usb',
          streamUrl: values.streamUrl,
          location: {
            coordinates: [
              Number(values.longitude),
              Number(values.latitude),
            ],
            address: values.locationAddress || 'Manual Coordinates',
          },
          settings: {
            resolution: values.resolution,
            fps: Number(values.fps),
            recordingEnabled: values.recordingEnabled,
          },
        };

        /**
         * 2. Save camera to MongoDB via backend
         */
        await addCamera(payload);

        /**
         * 3. User feedback
         */
        toast.success('Camera saved to database successfully!');

        /**
         * 4. Navigate back to cameras list
         */
        navigate('/cameras');
      } catch (error: any) {
        /**
         * 5. Error handling
         */
        console.error('Submission failed', error);
        toast.error(error.message || 'Failed to add camera');
      }
    }
  });

  const handleNext = async () => {
    // Validate Step 0: Basic Information
    if (activeStep === 0) {
      // Force "touched" state so errors appear visually
      formik.setTouched({ name: true, type: true, description: true });
      
      const errors = await formik.validateForm();
      if (errors.name || errors.type) {
        toast.error("Please fill in all required fields.");
        return;
      }
      setActiveStep((prev) => prev + 1);
    } 
    // Validate Step 1: Connection Settings
    else if (activeStep === 1) {
      formik.setTouched({ streamUrl: true });
      const errors = await formik.validateForm();
      
      if (errors.streamUrl) {
        toast.error("Please enter a valid Stream URL.");
        return;
      }
      
      if (connectionStatus !== 'success') {
        toast.warning("You must successfully test the connection first.");
        return;
      }
      setActiveStep((prev) => prev + 1);
    } 
    // Step 2: Location (No extra validation needed beyond Yup)
    else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Fetch VMS servers for the VMS-based test flow.
  const loadVmsServers = async () => {
    try {
      setVmsLoading(true);
      const list = await getVmsServers();
      setVmsServers(list);
      if (!testVmsServerId && list.length > 0) {
        setTestVmsServerId(list[0]._id);
      }
    } catch (error) {
      console.error('Error fetching VMS servers:', error);
    } finally {
      setVmsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch available VMS servers once for the test flow.
    loadVmsServers();
  }, []);

  const handleTestConnection = async () => {
    if (!formik.values.streamUrl) {
      toast.error('Please enter a stream URL first');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');
    
    if (testViaVms) {
      if (!testVmsServerId || !testMonitorId) {
        toast.error('Select a VMS server and enter a Monitor ID');
        setTestingConnection(false);
        return;
      }
    }

    try {
      // Server-side reachability check so tests reflect real connectivity.
      const result = await testCameraConnection({
        streamUrl: formik.values.streamUrl,
        mode: testViaVms ? 'vms' : 'rtsp',
        vmsServerId: testViaVms ? testVmsServerId : undefined,
        monitorId: testViaVms ? testMonitorId : undefined,
      });

      if (result.ok) {
        setConnectionStatus('success');
        toast.success(result.message || 'Connection test successful!');
      } else {
        setConnectionStatus('error');
        toast.error(result.message || 'Connection test failed');
      }
    } catch (error: any) {
      setConnectionStatus('error');
      toast.error(error.message || 'Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const getLocationFromAddress = async () => {
    if (!formik.values.locationAddress) {
      toast.error('Please enter an address first');
      return;
    }

    try {
      // TODO: Replace with actual geocoding API call (Google Maps, OpenStreetMap, etc.)
      // TEST-ONLY: Use mock coordinates to keep the flow working without a geocoder.
      const mockCoordinates = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      };

      formik.setFieldValue('latitude', parseFloat(mockCoordinates.lat.toFixed(6)));
      formik.setFieldValue('longitude', parseFloat(mockCoordinates.lng.toFixed(6)));
      
      // Automatically show map preview when coordinates are obtained
      setShowMapPreview(true);
      
      toast.success('Coordinates updated from address');
    } catch (error) {
      toast.error('Failed to get coordinates from address');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Camera Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Camera Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                placeholder="e.g., Front Gate Camera"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Camera Type</FormLabel>
                <RadioGroup
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  row
                >
                  <FormControlLabel value="ip" control={<Radio />} label="IP Camera" />
                  <FormControlLabel value="analog" control={<Radio />} label="Analog" />
                  <FormControlLabel value="usb" control={<Radio />} label="USB" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description (Optional)"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                placeholder="Describe the camera's purpose and coverage area..."
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Connection Settings
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  id="streamUrl"
                  name="streamUrl"
                  label="Stream URL"
                  value={formik.values.streamUrl}
                  onChange={(e) => {
                    formik.handleChange(e);
                    // Reset connection status when user edits the URL
                    if (connectionStatus !== 'idle') {
                      setConnectionStatus('idle');
                    }
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.streamUrl && Boolean(formik.errors.streamUrl)}
                  helperText={formik.touched.streamUrl && formik.errors.streamUrl}
                  placeholder="rtsp://username:password@camera-ip:554/stream"
                />
                <Button
                  variant="outlined"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  startIcon={<TestIcon />}
                  type="button" // Prevent form submit while testing
                  sx={{ minWidth: 140, height: 56 }}
                >
                  {testingConnection ? <CircularProgress size={24} /> : 'Test'}
                </Button>
              </Box>
              {connectionStatus === 'success' && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Connection test successful! Camera stream is accessible.
                </Alert>
              )}
              {connectionStatus === 'error' && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Connection failed. Please check the URL, credentials, and network connectivity.
                </Alert>
              )}
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Common Stream URL Formats:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • RTSP: rtsp://username:password@ip:port/path<br/>
                    • HTTP: http://ip:port/stream<br/>
                    • HTTPS: https://ip:port/stream<br/>
                    • RTMP: rtmp://ip:port/stream
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              {/* TEST-ONLY: Toggle between direct RTSP test and VMS (Shinobi) reachability. */}
              <FormControlLabel
                control={
                  <Switch
                    checked={testViaVms}
                    onChange={(e) => setTestViaVms(e.target.checked)}
                  />
                }
                label="Test via VMS (Shinobi)"
              />
            </Grid>
            {testViaVms && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="VMS Server"
                    value={testVmsServerId}
                    onChange={(e) => setTestVmsServerId(e.target.value)}
                    helperText={
                      vmsLoading
                        ? 'Loading VMS servers...'
                        : vmsServers.length
                          ? 'Choose the Shinobi server'
                          : 'No VMS servers found'
                    }
                  >
                    {vmsServers.map((server) => (
                      <MenuItem key={server._id} value={server._id}>
                        {server.name} ({server.provider})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monitor ID"
                    value={testMonitorId}
                    onChange={(e) => setTestMonitorId(e.target.value)}
                    placeholder="e.g. demo-monitor-1"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" onClick={loadVmsServers} type="button">
                    Refresh VMS Servers
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location & Configuration
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  id="locationAddress"
                  name="locationAddress"
                  label="Location Address or Google Maps URL"
                  value={formik.values.locationAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.locationAddress && Boolean(formik.errors.locationAddress)}
                  helperText={formik.touched.locationAddress && formik.errors.locationAddress || 
                    "Enter an address or paste a Google Maps URL for automatic coordinate extraction"}
                  placeholder="123 Main St, City, State OR https://maps.google.com/..."
                  multiline
                  rows={2}
                />
                <Button
                  variant="outlined"
                  onClick={getLocationFromAddress}
                  startIcon={<LocationOnIcon />}
                  sx={{ minWidth: 140, height: 56 }}
                >
                  Get Coords
                </Button>
              </Box>
            </Grid>
            
            {/* Coordinate Input with Map Preview */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">
                  Camera Coordinates
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => setShowMapPreview(!showMapPreview)}
                  size="small"
                >
                  {showMapPreview ? 'Hide' : 'Show'} Map Preview
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="latitude"
                name="latitude"
                label="Latitude"
                type="number"
                value={formik.values.latitude}
                onChange={(e) => {
                  formik.handleChange(e);
                  if (formik.values.longitude !== 0) {
                    setShowMapPreview(true);
                  }
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.latitude && Boolean(formik.errors.latitude)}
                helperText={formik.touched.latitude && formik.errors.latitude}
                inputProps={{ step: 0.000001, min: -90, max: 90 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="longitude"
                name="longitude"
                label="Longitude"
                type="number"
                value={formik.values.longitude}
                onChange={(e) => {
                  formik.handleChange(e);
                  if (formik.values.latitude !== 0) {
                    setShowMapPreview(true);
                  }
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.longitude && Boolean(formik.errors.longitude)}
                helperText={formik.touched.longitude && formik.errors.longitude}
                inputProps={{ step: 0.000001, min: -180, max: 180 }}
              />
            </Grid>

            {/* Interactive Map Preview */}
            {showMapPreview && formik.values.latitude !== 0 && formik.values.longitude !== 0 && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Camera Location Preview
                  </Typography>
                  <Box sx={{ height: 300, borderRadius: 1, overflow: 'hidden' }}>
                    <MapContainer
                      center={[formik.values.latitude, formik.values.longitude]}
                      zoom={15}
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%' }}
                      key={`${formik.values.latitude}-${formik.values.longitude}`}
                    >
                      <TileLayer
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[formik.values.latitude, formik.values.longitude]}
                        icon={createCameraPreviewIcon()}
                      >
                        <Popup>
                          <Box sx={{ minWidth: 200 }}>
                            <Typography variant="h6" gutterBottom>
                              <VideocamIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                              {formik.values.name || 'New Camera'}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              {formik.values.description || 'Camera location preview'}
                            </Typography>
                            <Typography variant="caption" display="block" gutterBottom>
                              📍 {formik.values.locationAddress || 'No address specified'}
                            </Typography>
                            <Typography variant="caption" display="block">
                              📅 Lat: {formatCoord(formik.values.latitude)}, Lng: {formatCoord(formik.values.longitude)}
                            </Typography>
                          </Box>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    💡 This preview shows where your camera will appear on the main map
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={6}>
              <TextField
                fullWidth
                id="resolution"
                name="resolution"
                label="Resolution"
                select
                value={formik.values.resolution}
                onChange={formik.handleChange}
              >
                <MenuItem value="3840x2160">4K (3840x2160)</MenuItem>
                <MenuItem value="1920x1080">Full HD (1920x1080)</MenuItem>
                <MenuItem value="1280x720">HD (1280x720)</MenuItem>
                <MenuItem value="640x480">SD (640x480)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="fps"
                name="fps"
                label="Frame Rate (FPS)"
                type="number"
                value={formik.values.fps}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fps && Boolean(formik.errors.fps)}
                helperText={formik.touched.fps && formik.errors.fps}
                inputProps={{ min: 1, max: 60 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Additional Features
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Recording</Typography>
                    <Switch
                      checked={formik.values.recordingEnabled}
                      onChange={(e) => formik.setFieldValue('recordingEnabled', e.target.checked)}
                      name="recordingEnabled"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Motion Detection</Typography>
                    <Switch
                      checked={formik.values.motionDetection}
                      onChange={(e) => formik.setFieldValue('motionDetection', e.target.checked)}
                      name="motionDetection"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Night Vision</Typography>
                    <Switch
                      checked={formik.values.nightVision}
                      onChange={(e) => formik.setFieldValue('nightVision', e.target.checked)}
                      name="nightVision"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Audio</Typography>
                    <Switch
                      checked={formik.values.audioEnabled}
                      onChange={(e) => formik.setFieldValue('audioEnabled', e.target.checked)}
                      name="audioEnabled"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 112px)', overflow: 'auto', p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title="Back to Cameras">
          <IconButton onClick={() => navigate('/cameras')} color="primary">
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <VideocamIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Add New Camera
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={formik.handleSubmit}>
          {renderStepContent(activeStep)}

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              type="button" // Prevent form submit on navigation
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/cameras')}
                type="button" // Prevent form submit on cancel
              >
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}
                  startIcon={<SaveIcon />}
                >
                  {formik.isSubmitting ? 'Adding Camera...' : 'Add Camera'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={activeStep === 1 && connectionStatus !== 'success'}
                  type="button" // Prevent form submit on step advance
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddCamera;
