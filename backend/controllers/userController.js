import { User, Review, Watchlist, Movie } from '../models/index.js';
import bcrypt from 'bcryptjs';

// GET /users/:id - Get user profile with reviews
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user profile
    const user = await User.findById(id).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's reviews with movie details
    const reviews = await Review.find({ userId: id })
      .populate('movieId', 'title posterUrl releaseYear')
      .sort({ timestamp: -1 })
      .select('-__v');

    res.json({
      user,
      reviews
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
};

// PUT /users/:id - Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, profilePicture } = req.body;
    const currentUserId = req.user.id;

    // Check if user is updating their own profile
    if (id !== currentUserId) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Update user
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// GET /users/:id/watchlist - Get user's watchlist
export const getUserWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user is accessing their own watchlist
    if (id !== currentUserId) {
      return res.status(403).json({ message: 'You can only view your own watchlist' });
    }

    // Get watchlist with movie details
    const watchlist = await Watchlist.find({ userId: id })
      .populate('movieId', 'title posterUrl releaseYear director genre averageRating')
      .sort({ dateAdded: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Watchlist.countDocuments({ userId: id });
    const totalPages = Math.ceil(total / limit);

    res.json({
      watchlist,
      pagination: {
        currentPage: page,
        totalPages,
        totalMovies: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get user watchlist error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error while fetching watchlist' });
  }
};

// POST /users/:id/watchlist - Add movie to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { movieId } = req.body;
    const currentUserId = req.user.id;

    // Check if user is adding to their own watchlist
    if (id !== currentUserId) {
      return res.status(403).json({ message: 'You can only add to your own watchlist' });
    }

    // Validation
    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID is required' });
    }

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if movie is already in watchlist
    const existingWatchlistItem = await Watchlist.findOne({ userId: id, movieId });
    if (existingWatchlistItem) {
      return res.status(400).json({ message: 'Movie is already in your watchlist' });
    }

    // Add to watchlist
    const watchlistItem = new Watchlist({
      userId: id,
      movieId
    });

    await watchlistItem.save();

    // Populate movie details for response
    await watchlistItem.populate('movieId', 'title posterUrl releaseYear director genre averageRating');

    res.status(201).json({
      message: 'Movie added to watchlist successfully',
      watchlistItem
    });

  } catch (error) {
    console.error('Add to watchlist error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID or movie ID' });
    }
    res.status(500).json({ message: 'Server error while adding to watchlist' });
  }
};

// DELETE /users/:id/watchlist/:movieId - Remove movie from watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const { id, movieId } = req.params;
    const currentUserId = req.user.id;

    // Check if user is removing from their own watchlist
    if (id !== currentUserId) {
      return res.status(403).json({ message: 'You can only remove from your own watchlist' });
    }

    // Find and remove watchlist item
    const watchlistItem = await Watchlist.findOneAndDelete({ 
      userId: id, 
      movieId 
    });

    if (!watchlistItem) {
      return res.status(404).json({ message: 'Movie not found in watchlist' });
    }

    res.json({
      message: 'Movie removed from watchlist successfully'
    });

  } catch (error) {
    console.error('Remove from watchlist error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID or movie ID' });
    }
    res.status(500).json({ message: 'Server error while removing from watchlist' });
  }
};
