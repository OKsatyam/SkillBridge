import 'dotenv/config';
import express from "express";
import http from 'http';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from "./src/config/db.js";
import passport from "./src/config/passport.js";
import authRoutes from "./src/routes/auth.route.js";
import cookieParser from "cookie-parser";
import {errorHandler} from "./src/middleware/error.js";
import userRoutes from "./src/routes/user.route.js";
import cors from 'cors';
import gigRoutes from './src/routes/gig.route.js';
import categoryRoutes from './src/routes/category.route.js';
import jobRoutes from './src/routes/job.route.js';
import proposalRoutes from './src/routes/proposal.route.js';
import contractRoutes from './src/routes/contract.route.js';
import walletRoutes from './src/routes/wallet.route.js';
import conversationRoutes from './src/routes/conversation.route.js';
import notificationRoutes from './src/routes/notification.route.js';
import reviewRoutes from './src/routes/review.route.js';
import disputeRoutes from './src/routes/dispute.route.js';
import adminRoutes from './src/routes/admin.route.js';
import { initSocket } from './src/sockets/index.js';

connectDB();
const app = express();
const httpServer = http.createServer(app);
initSocket(httpServer);

// Sets security headers (X-Frame-Options, X-Content-Type-Options, etc.). CSP and cross-origin
// resource policy are disabled here because this is a pure JSON API (no HTML rendered) whose
// /uploads images are loaded cross-origin by the separately-hosted React frontend — helmet's
// defaults would otherwise block the browser from loading those <img> tags.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev')); // request logging in dev
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));

// Generic API-wide limiter, plus a stricter one on auth routes (the classic brute-force target).
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true , data:null , message: "Server is running"  });
});
app.use('/uploads', express.static('uploads'));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/gigs", gigRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/proposals", proposalRoutes);
app.use("/api/v1/contracts", contractRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/disputes", disputeRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use(errorHandler)
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
