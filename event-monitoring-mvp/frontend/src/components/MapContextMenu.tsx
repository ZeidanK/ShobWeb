import React, { useState, useEffect } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Typography,
  Box
} from '@mui/material';
import {
  VideocamOutlined as CameraIcon,
  EventNote as EventIcon,
  MyLocation as LocationIcon,
  Visibility as ViewIcon,
  Analytics as AnalyticsIcon,
  LocationOn as PinIcon,
  Map as MapIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface ContextMenuProps {
  position: ContextMenuPosition | null;
  latLng: { lat: number; lng: number } | null;
  onClose: () => void;
  onAddCamera: (position: { lat: number; lng: number }) => void;
  onCreateEvent: (position: { lat: number; lng: number }) => void;
  onViewCoverage: (position: { lat: number; lng: number }) => void;
  onAnalyzeArea: (position: { lat: number; lng: number }) => void;
  onSetWaypoint: (position: { lat: number; lng: number }) => void;
  onMeasureDistance: (position: { lat: number; lng: number }) => void;
  onViewTimeline: (position: { lat: number; lng: number }) => void;
  userRole?: 'admin' | 'operator' | 'viewer';
  nearbyData?: {
    cameras: number;
    events: number;
    detections: number;
  };
}

const MapContextMenu: React.FC<ContextMenuProps> = ({
  position,
  latLng,
  onClose,
  onAddCamera,
  onCreateEvent,
  onViewCoverage,
  onAnalyzeArea,
  onSetWaypoint,
  onMeasureDistance,
  onViewTimeline,
  userRole = 'operator',
  nearbyData
}) => {
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    if (!latLng) return;

    const items = [
      // Location info header
      {
        type: 'header',
        content: (
          <Box sx={{ p: 1, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="subtitle2">
              📍 {latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}
            </Typography>
            {nearbyData && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                📹 {nearbyData.cameras} cameras • 🚨 {nearbyData.events} events • 🤖 {nearbyData.detections} detections
              </Typography>
            )}
          </Box>
        )
      },
      
      // Camera management
      {
        type: 'divider'
      },
      {
        id: 'add-camera',
        label: 'Add Camera Here',
        icon: <CameraIcon />,
        action: () => onAddCamera(latLng),
        requiresRole: ['admin', 'operator'],
        disabled: false
      },
      {
        id: 'view-coverage',
        label: 'Show Camera Coverage',
        icon: <ViewIcon />,
        action: () => onViewCoverage(latLng),
        disabled: false
      },
      
      // Event management
      {
        type: 'divider'
      },
      {
        id: 'create-event',
        label: 'Create Event Here',
        icon: <EventIcon />,
        action: () => onCreateEvent(latLng),
        requiresRole: ['admin', 'operator'],
        disabled: false
      },
      {
        id: 'view-timeline',
        label: 'View Location Timeline',
        icon: <TimelineIcon />,
        action: () => onViewTimeline(latLng),
        disabled: false
      },
      
      // Analysis tools
      {
        type: 'divider'
      },
      {
        id: 'analyze-area',
        label: 'Analyze Area',
        icon: <AnalyticsIcon />,
        action: () => onAnalyzeArea(latLng),
        disabled: false
      },
      {
        id: 'set-waypoint',
        label: 'Set Waypoint',
        icon: <PinIcon />,
        action: () => onSetWaypoint(latLng),
        disabled: false
      },
      {
        id: 'measure-distance',
        label: 'Measure Distance',
        icon: <MapIcon />,
        action: () => onMeasureDistance(latLng),
        disabled: false
      }
    ];

    // Filter items based on user role
    const filteredItems = items.filter(item => {
      if (item.type) return true; // Headers and dividers always shown
      if (!item.requiresRole) return true; // No role requirement
      return item.requiresRole.includes(userRole);
    });

    setMenuItems(filteredItems);
  }, [latLng, userRole, nearbyData]);

  const handleItemClick = (item: any) => {
    if (item.action && !item.disabled) {
      item.action();
    }
    onClose();
  };

  if (!position || !latLng) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 10000,
        minWidth: 250,
        maxWidth: 300,
        boxShadow: 3,
        overflow: 'hidden',
        transform: `translate(${position.x > window.innerWidth - 300 ? '-100%' : '0'}, ${
          position.y > window.innerHeight - 400 ? '-100%' : '0'
        })`
      }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'header') {
          return (
            <Box key={`header-${index}`}>
              {item.content}
            </Box>
          );
        }
        
        if (item.type === 'divider') {
          return <Divider key={`divider-${index}`} />;
        }

        return (
          <MenuItem
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            sx={{
              py: 1,
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white'
                }
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{ color: 'inherit' }}
            />
          </MenuItem>
        );
      })}
    </Paper>
  );
};

export default MapContextMenu;