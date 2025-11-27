
import express from 'express';
import webhookRoutes from "./routes/webhook.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/webhook", webhookRoutes);

app.get("/", (req, res) => {
  res.send("Chatwoot Bot API running ✅");
});

app.listen(PORT, (err) => {
  console.log(`Server is running on port ${PORT}`);
});
