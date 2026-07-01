import express from "express";
import dotenv from "dotenv";
dotenv.config(); 


const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ success: true , data:null , message: "Server is running"  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);  
})
