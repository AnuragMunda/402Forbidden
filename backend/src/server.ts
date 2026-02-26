import app from "./app.js";
import "dotenv/config";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.log("MongoDB connection error: ", err);
    process.exit(1);
  });
