import 'dotenv/config'; 
import express from "express";
import connectDB from "./src/config/db.js";
import passport from "./src/config/passport.js";
import authRoutes from "./src/routes/auth.route.js";



connectDB();
const app = express();

app.use(express.json());
app.use(passport.initialize());

app.get("/health", (req, res) => {
  res.status(200).json({ success: true , data:null , message: "Server is running"  });
});
app.use("/api/v1/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);  
})
