import { User } from '../models/index.js';

export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Checking admin access for user:', userId);
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check admin emails from environment
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
    console.log('📧 Admin emails:', adminEmails);
    console.log('👤 User email:', user.email);
    
    // Check if user is admin (either by isAdmin flag or email in admin list)
    const isUserAdmin = user.isAdmin === true || adminEmails.includes(user.email);
    
    if (!isUserAdmin) {
      console.log('❌ User is not an admin');
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    console.log('✅ User is admin');
    next();
  } catch (error) {
    console.error('❌ Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin access' });
  }
};