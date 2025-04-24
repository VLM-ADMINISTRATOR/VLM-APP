import { findOne, create } from '../models/User';
import generateToken from '../utils/generateToken.js';

// Register
export async function registerUser(req, res) {
  const { username, email, password } = req.body;

  try {
    const userExists = await findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already in use' });

    const user = await create({ username, email, password });

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
}

// Login
export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
}
