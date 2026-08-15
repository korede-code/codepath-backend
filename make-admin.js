import { sequelize, User } from './src/models/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function makeAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const email = 'koredejoseph3@gmail.com'; // Change to your email
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }
    
    // Update user to be admin
    user.isAdmin = true;
    await user.save();
    
    console.log(`✅ User ${user.username} (${user.email}) is now an admin!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

makeAdmin();