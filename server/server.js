import 'dotenv/config'; 
import express from "express";
import connectDB from "./src/config/db.js";
import passport from "./src/config/passport.js";
import authRoutes from "./src/routes/auth.route.js";
import cookieParser from "cookie-parser";
import {errorHandler} from "./src/middleware/error.js";
import userRoutes from "./src/routes/user.route.js";

connectDB();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get("/health", (req, res) => {
  res.status(200).json({ success: true , data:null , message: "Server is running"  });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use(errorHandler)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);  
})
