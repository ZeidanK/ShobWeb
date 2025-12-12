import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getEventStats
} from '../controllers/eventController';
import { auth, adminOnly } from '../middleware/auth';
import { validateEvent } from '../middleware/validation';

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with pagination and filtering
// @access  Private
router.get('/', auth, getEvents);

// @route   GET /api/events/stats
// @desc    Get event statistics
// @access  Private
router.get('/stats', auth, getEventStats);

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Private
router.get('/:id', auth, getEvent);

// @route   POST /api/events
// @desc    Create new event (usually from AI service)
// @access  Private
router.post('/', auth, validateEvent, createEvent);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private
router.put('/:id', auth, validateEvent, updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', auth, adminOnly, deleteEvent);

// @route   PATCH /api/events/:id/status
// @desc    Update event status
// @access  Private
router.patch('/:id/status', auth, updateEventStatus);

export default router;