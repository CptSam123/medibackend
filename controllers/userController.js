import User from '../models/User.js';

/**
 * GET /api/users/me
 * Return the currently logged-in user (minus their password).
 * Requires the `protect` middleware to have set req.user.
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User
      .findById(req.user._id)
      .select('-password');           // don’t send the hashed password

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('getCurrentUser error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
