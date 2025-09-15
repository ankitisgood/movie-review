import { Movie, Review, User } from '../models/index.js';

// GET /movies - Get all movies with pagination and filters
export const getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.genre) {
      filter.genre = { $in: req.query.genre.split(',') };
    }
    
    if (req.query.year) {
      filter.releaseYear = parseInt(req.query.year);
    }
    
    if (req.query.minRating) {
      filter.averageRating = { $gte: parseFloat(req.query.minRating) };
    }

    // Build sort object
    const sort = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    const movies = await Movie.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Movie.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      movies,
      pagination: {
        currentPage: page,
        totalPages,
        totalMovies: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ message: 'Server error while fetching movies' });
  }
};

// GET /movies/:id - Get movie details with reviews
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id).select('-__v');
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Get reviews for this movie with user details
    const reviews = await Review.find({ movieId: id })
      .populate('userId', 'username profilePicture')
      .sort({ timestamp: -1 })
      .select('-__v');

    res.json({
      movie,
      reviews
    });

  } catch (error) {
    console.error('Get movie by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }
    res.status(500).json({ message: 'Server error while fetching movie' });
  }
};

// POST /movies - Create movie (admin only)
export const createMovie = async (req, res) => {
  try {
    const {
      title,
      genre,
      releaseYear,
      director,
      cast,
      synopsis,
      posterUrl
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Check if movie already exists
    const existingMovie = await Movie.findOne({ title });
    if (existingMovie) {
      return res.status(400).json({ message: 'Movie with this title already exists' });
    }

    const movie = new Movie({
      title,
      genre: genre || [],
      releaseYear,
      director,
      cast: cast || [],
      synopsis,
      posterUrl
    });

    await movie.save();

    res.status(201).json({
      message: 'Movie created successfully',
      movie
    });

  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({ message: 'Server error while creating movie' });
  }
};

// GET /movies/:id/reviews - Get reviews for a specific movie
export const getMovieReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if movie exists
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const reviews = await Review.find({ movieId: id })
      .populate('userId', 'username profilePicture')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Review.countDocuments({ movieId: id });
    const totalPages = Math.ceil(total / limit);

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get movie reviews error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

// POST /movies/:id/reviews - Add review for a movie
export const addMovieReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.user.id;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if movie exists
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ userId, movieId: id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    // Create review
    const review = new Review({
      userId,
      movieId: id,
      rating,
      reviewText: reviewText || ''
    });

    await review.save();

    // Update movie's average rating
    const allReviews = await Review.find({ movieId: id });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Movie.findByIdAndUpdate(id, { averageRating: Math.round(averageRating * 10) / 10 });

    // Populate user details for response
    await review.populate('userId', 'username profilePicture');

    res.status(201).json({
      message: 'Review added successfully',
      review
    });

  } catch (error) {
    console.error('Add movie review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }
    res.status(500).json({ message: 'Server error while adding review' });
  }
};

// POST /movies/uploadPoster - Upload movie poster
export const uploadPoster = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the Cloudinary secure URL
    res.json({
      message: 'Poster uploaded successfully',
      posterUrl: req.file.path,
      publicId: req.file.filename
    });

  } catch (error) {
    console.error('Upload poster error:', error);
    res.status(500).json({ message: 'Server error while uploading poster' });
  }
};
