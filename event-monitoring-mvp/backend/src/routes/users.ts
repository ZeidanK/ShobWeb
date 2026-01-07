import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole
} from '../controllers/userController';
import { auth, adminOnly } from '../middleware/auth';
import { validateUser } from '../middleware/validation';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', auth, adminOnly, getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin only)
router.get('/:id', auth, adminOnly, getUser);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', auth, adminOnly, validateUser, createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/:id', auth, adminOnly, validateUser, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', auth, adminOnly, deleteUser);

// @route   PATCH /api/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.patch('/:id/role', auth, adminOnly, updateUserRole);

export default router;