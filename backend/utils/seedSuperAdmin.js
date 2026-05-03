const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Admin';

const seedSuperAdmin = async () => {
  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    return;
  }

  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);

  const superAdmin = await User.findOneAndUpdate(
    { email: SUPER_ADMIN_EMAIL.toLowerCase() },
    {
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: 'Admin'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.updateMany(
    { _id: { $ne: superAdmin._id } },
    { $set: { role: 'Member' } }
  );

  return superAdmin;
};

module.exports = seedSuperAdmin;