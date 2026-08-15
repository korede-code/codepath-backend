import { User } from '../models/index.js';

export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    // Check if user has admin role
    // You can set this in your database - for now, check a specific email or role
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
    
    if (!user || (!user.isAdmin && !adminEmails.includes(user.email))) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin access' });
  }
};