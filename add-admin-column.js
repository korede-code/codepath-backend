import { sequelize, User } from './src/models/index.js';
import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function addAdminColumn() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Add isAdmin column using raw SQL
    await sequelize.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT false;`
    );
    console.log('✅ isAdmin column added');
    
    // Make your user an admin
    const email = 'koredejoseph3@gmail.com';
    await sequelize.query(
      `UPDATE users SET "isAdmin" = true WHERE email = '${email}';`
    );
    console.log(`✅ User ${email} is now an admin`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addAdminColumn();