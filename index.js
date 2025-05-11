var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  alibis: () => alibis,
  alibisRelations: () => alibisRelations,
  emotionalEvaluations: () => emotionalEvaluations,
  emotionalEvaluationsRelations: () => emotionalEvaluationsRelations,
  faceAnalyses: () => faceAnalyses,
  faceAnalysesRelations: () => faceAnalysesRelations,
  insertAlibiSchema: () => insertAlibiSchema,
  insertEmotionalEvaluationSchema: () => insertEmotionalEvaluationSchema,
  insertFaceAnalysisSchema: () => insertFaceAnalysisSchema,
  insertSubscriptionPlanSchema: () => insertSubscriptionPlanSchema,
  insertUserSchema: () => insertUserSchema,
  subscriptionPlans: () => subscriptionPlans,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, integer, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true
});
var alibis = pgTable("alibis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  recipient: text("recipient").notNull(),
  realReason: text("real_reason"),
  alibiType: text("alibi_type").notNull(),
  format: text("format").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertAlibiSchema = createInsertSchema(alibis).pick({
  userId: true,
  recipient: true,
  realReason: true,
  alibiType: true,
  format: true,
  content: true
});
var emotionalEvaluations = pgTable("emotional_evaluations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  stress: text("stress"),
  relaxDifficulty: text("relax_difficulty"),
  morningFeeling: text("morning_feeling"),
  result: text("result"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertEmotionalEvaluationSchema = createInsertSchema(emotionalEvaluations).pick({
  userId: true,
  stress: true,
  relaxDifficulty: true,
  morningFeeling: true,
  result: true
});
var faceAnalyses = pgTable("face_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gender: text("gender"),
  age: integer("age"),
  emotion: text("emotion"),
  diagnosis: text("diagnosis"),
  imageHash: text("image_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertFaceAnalysisSchema = createInsertSchema(faceAnalyses).pick({
  userId: true,
  gender: true,
  age: true,
  emotion: true,
  diagnosis: true,
  imageHash: true
});
var subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  // in cents
  features: json("features"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  description: true,
  price: true,
  features: true
});
var usersRelations = relations(users, ({ many }) => ({
  alibis: many(alibis),
  emotionalEvaluations: many(emotionalEvaluations),
  faceAnalyses: many(faceAnalyses)
}));
var alibisRelations = relations(alibis, ({ one }) => ({
  user: one(users, {
    fields: [alibis.userId],
    references: [users.id]
  })
}));
var emotionalEvaluationsRelations = relations(emotionalEvaluations, ({ one }) => ({
  user: one(users, {
    fields: [emotionalEvaluations.userId],
    references: [users.id]
  })
}));
var faceAnalysesRelations = relations(faceAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [faceAnalyses.userId],
    references: [users.id]
  })
}));

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Alibi methods
  async getAlibi(id) {
    const [alibi] = await db.select().from(alibis).where(eq(alibis.id, id));
    return alibi;
  }
  async getAlibisByUser(userId) {
    return await db.select().from(alibis).where(eq(alibis.userId, userId));
  }
  async createAlibi(alibi) {
    const [newAlibi] = await db.insert(alibis).values(alibi).returning();
    return newAlibi;
  }
  // Emotional Evaluation methods
  async getEmotionalEvaluation(id) {
    const [evaluation] = await db.select().from(emotionalEvaluations).where(eq(emotionalEvaluations.id, id));
    return evaluation;
  }
  async getEmotionalEvaluationsByUser(userId) {
    return await db.select().from(emotionalEvaluations).where(eq(emotionalEvaluations.userId, userId));
  }
  async createEmotionalEvaluation(evaluation) {
    const [newEvaluation] = await db.insert(emotionalEvaluations).values(evaluation).returning();
    return newEvaluation;
  }
  // Face Analysis methods
  async getFaceAnalysis(id) {
    const [analysis] = await db.select().from(faceAnalyses).where(eq(faceAnalyses.id, id));
    return analysis;
  }
  async getFaceAnalysesByUser(userId) {
    return await db.select().from(faceAnalyses).where(eq(faceAnalyses.userId, userId));
  }
  async createFaceAnalysis(analysis) {
    const [newAnalysis] = await db.insert(faceAnalyses).values(analysis).returning();
    return newAnalysis;
  }
  // Subscription Plan methods
  async getSubscriptionPlan(id) {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }
  async getAllSubscriptionPlans() {
    return await db.select().from(subscriptionPlans);
  }
  async createSubscriptionPlan(plan) {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import path from "path";
import express from "express";
import { ZodError } from "zod";
import dotenv from "dotenv";
import * as fs from "fs";
dotenv.config();
async function registerRoutes(app2) {
  const apiRouter = express.Router();
  apiRouter.post("/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  apiRouter.post("/emotional-evaluations", async (req, res) => {
    try {
      const validatedData = insertEmotionalEvaluationSchema.parse(req.body);
      const evaluation = await storage.createEmotionalEvaluation(validatedData);
      res.status(201).json(evaluation);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid data format", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create emotional evaluation" });
      }
    }
  });
  apiRouter.get("/emotional-evaluations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const evaluation = await storage.getEmotionalEvaluation(id);
      if (!evaluation) {
        return res.status(404).json({ error: "Emotional evaluation not found" });
      }
      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve emotional evaluation" });
    }
  });
  apiRouter.post("/face-analyses", async (req, res) => {
    try {
      const validatedData = insertFaceAnalysisSchema.parse(req.body);
      const analysis = await storage.createFaceAnalysis(validatedData);
      res.status(201).json(analysis);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid data format", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create face analysis" });
      }
    }
  });
  apiRouter.get("/face-analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getFaceAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ error: "Face analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve face analysis" });
    }
  });
  apiRouter.post("/alibis", async (req, res) => {
    try {
      const validatedData = insertAlibiSchema.parse(req.body);
      const alibi = await storage.createAlibi(validatedData);
      res.status(201).json(alibi);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid data format", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create alibi" });
      }
    }
  });
  apiRouter.get("/alibis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alibi = await storage.getAlibi(id);
      if (!alibi) {
        return res.status(404).json({ error: "Alibi not found" });
      }
      res.json(alibi);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve alibi" });
    }
  });
  app2.use("/api", apiRouter);
  app2.use(express.static("public"));
  const dirPath = path.join(process.cwd(), "public/screenshots");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const audioPath = path.join(process.cwd(), "public/audios");
  if (!fs.existsSync(audioPath)) {
    fs.mkdirSync(audioPath, { recursive: true });
  }
  apiRouter.post("/text-to-speech", async (req, res) => {
    try {
      const { text: text2, voice_id } = req.body;
      if (!text2) {
        return res.status(400).json({ error: "Texto \xE9 obrigat\xF3rio" });
      }
      const fileName = `speech_${Date.now()}.txt`;
      const filePath = path.join(process.cwd(), "public/audios", fileName);
      fs.writeFileSync(filePath, text2);
      res.json({
        success: true,
        message: "Para integra\xE7\xE3o com a API do ElevenLabs, \xE9 necess\xE1rio a chave de API",
        filePath: `/audios/${fileName}`
      });
    } catch (error) {
      console.error("Erro ao gerar \xE1udio:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      res.status(500).json({ error: "Erro ao processar requisi\xE7\xE3o", details: errorMessage });
    }
  });
  apiRouter.post("/save-screenshot", async (req, res) => {
    try {
      const { base64Image } = req.body;
      if (!base64Image) {
        return res.status(400).json({ error: "A imagem em base64 \xE9 obrigat\xF3ria" });
      }
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `screenshot_${Date.now()}.png`;
      const filePath = path.join(process.cwd(), "public/screenshots", fileName);
      fs.writeFileSync(filePath, base64Data, { encoding: "base64" });
      const imageUrl = `/screenshots/${fileName}`;
      res.json({ success: true, imageUrl });
    } catch (error) {
      console.error("Erro ao salvar captura de tela:", error);
      res.status(500).json({ error: "Erro ao processar requisi\xE7\xE3o", details: error.message });
    }
  });
  app2.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public/index.html"));
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
