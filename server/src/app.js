const express = require("express");
const cors = require("cors");
const config = require("./config");
const authRoutes = require("./routes/auth.routes");
const quotesRoutes = require("./routes/quotes.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({
  origin(origin, callback){
    if(!origin || config.frontendOrigins.includes(origin)){
      return callback(null, true);
    }
    return callback(new Error("No permitido por CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/quotes", quotesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(errorHandler);

module.exports = app;
