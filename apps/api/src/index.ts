import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppBindings } from "./types/env";
import { registerErrorHandler } from "./middleware/error.middleware";
import { articleRoutes } from "./routes/articles";
import { healthRoutes } from "./routes/health";
import { imageRoutes } from "./routes/images";
import { templateRoutes } from "./routes/templates";
import { usageRoutes } from "./routes/usage";

const app = new Hono<AppBindings>();

function getAllowedOrigins(c: { env: AppBindings["Bindings"] }) {
  const rawOrigins =
    c.env.ALLOWED_ORIGINS ?? c.env.ALLOWED_ORIGIN ?? "http://localhost:3000";

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowedOrigins = getAllowedOrigins(c);
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    },
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

registerErrorHandler(app);

app.route("/health", healthRoutes);
app.route("/articles", articleRoutes);
app.route("/images", imageRoutes);
app.route("/templates", templateRoutes);
app.route("/usage", usageRoutes);

export default app;
