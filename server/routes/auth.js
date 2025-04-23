import { Router } from "express";
import { hash, compare } from "bcrypt";
import pkg from "jsonwebtoken";
const { sign } = pkg; // Destructure sign from the imported package
import { query } from "../config/db.js";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const userExists = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await hash(password, 10);
    await query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)",
      [username, email, hashedPassword, role || "user"]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await query("SELECT * FROM users WHERE email = $1 AND role = $2", [email, role]);
    if (!user.rows.length) return res.status(400).json({ message: "Invalid credentials" });

    const validPassword = await compare(password, user.rows[0].password);
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    const token = sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: user.rows[0].id, username: user.rows[0].username, role: user.rows[0].role }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
