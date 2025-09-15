// Simple admin middleware - you can enhance this based on your needs
const adminMiddleware = (req, res, next) => {
  // For now, we'll check if the user has admin role
  // You can modify this based on your User model structure
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Simple check - you might want to add an 'isAdmin' field to your User model
  // For now, we'll allow any authenticated user to create movies
  // In production, you should have proper admin role checking
  next();
};

export default adminMiddleware;
