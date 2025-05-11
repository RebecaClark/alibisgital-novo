import { 
  users, type User, type InsertUser,
  alibis, type Alibi, type InsertAlibi,
  emotionalEvaluations, type EmotionalEvaluation, type InsertEmotionalEvaluation,
  faceAnalyses, type FaceAnalysis, type InsertFaceAnalysis,
  subscriptionPlans, type SubscriptionPlan, type InsertSubscriptionPlan
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Alibi methods
  getAlibi(id: number): Promise<Alibi | undefined>;
  getAlibisByUser(userId: number): Promise<Alibi[]>;
  createAlibi(alibi: InsertAlibi): Promise<Alibi>;
  
  // Emotional Evaluation methods
  getEmotionalEvaluation(id: number): Promise<EmotionalEvaluation | undefined>;
  getEmotionalEvaluationsByUser(userId: number): Promise<EmotionalEvaluation[]>;
  createEmotionalEvaluation(evaluation: InsertEmotionalEvaluation): Promise<EmotionalEvaluation>;
  
  // Face Analysis methods
  getFaceAnalysis(id: number): Promise<FaceAnalysis | undefined>;
  getFaceAnalysesByUser(userId: number): Promise<FaceAnalysis[]>;
  createFaceAnalysis(analysis: InsertFaceAnalysis): Promise<FaceAnalysis>;
  
  // Subscription Plan methods
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Alibi methods
  async getAlibi(id: number): Promise<Alibi | undefined> {
    const [alibi] = await db.select().from(alibis).where(eq(alibis.id, id));
    return alibi;
  }
  
  async getAlibisByUser(userId: number): Promise<Alibi[]> {
    return await db.select().from(alibis).where(eq(alibis.userId, userId));
  }
  
  async createAlibi(alibi: InsertAlibi): Promise<Alibi> {
    const [newAlibi] = await db.insert(alibis).values(alibi).returning();
    return newAlibi;
  }
  
  // Emotional Evaluation methods
  async getEmotionalEvaluation(id: number): Promise<EmotionalEvaluation | undefined> {
    const [evaluation] = await db.select().from(emotionalEvaluations).where(eq(emotionalEvaluations.id, id));
    return evaluation;
  }
  
  async getEmotionalEvaluationsByUser(userId: number): Promise<EmotionalEvaluation[]> {
    return await db.select().from(emotionalEvaluations).where(eq(emotionalEvaluations.userId, userId));
  }
  
  async createEmotionalEvaluation(evaluation: InsertEmotionalEvaluation): Promise<EmotionalEvaluation> {
    const [newEvaluation] = await db.insert(emotionalEvaluations).values(evaluation).returning();
    return newEvaluation;
  }
  
  // Face Analysis methods
  async getFaceAnalysis(id: number): Promise<FaceAnalysis | undefined> {
    const [analysis] = await db.select().from(faceAnalyses).where(eq(faceAnalyses.id, id));
    return analysis;
  }
  
  async getFaceAnalysesByUser(userId: number): Promise<FaceAnalysis[]> {
    return await db.select().from(faceAnalyses).where(eq(faceAnalyses.userId, userId));
  }
  
  async createFaceAnalysis(analysis: InsertFaceAnalysis): Promise<FaceAnalysis> {
    const [newAnalysis] = await db.insert(faceAnalyses).values(analysis).returning();
    return newAnalysis;
  }
  
  // Subscription Plan methods
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }
  
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans);
  }
  
  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }
}

export const storage = new DatabaseStorage();
