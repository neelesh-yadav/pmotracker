// Generate temporary password
const tempPassword = Math.random().toString(36).slice(-8);
const hashedPassword = await bcrypt.hash(tempPassword, 10);

// Create login user for PM
await User.create({
  name,
  email,
  password: hashedPassword,
  role: 'PM',
  initials,
  forcePasswordReset: true
});

// Send temp password to PMO
res.status(201).json({
  pm,
  tempPassword
});
