import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { firebaseService } from "./firebaseService";
import { collection, query, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { simpleStorage } from "./simpleStorage";
import { smsService } from "./smsService";
import { SecurityService } from "./security";
import { notificationService } from "./notificationService";
import { rateLimitService } from "./rateLimitService";
import { aiService } from "./aiService";
import { 
  insertUserSchema, 
  insertCategorySchema, 
  insertProductSchema, 
  insertCustomerSchema, 
  insertOrderSchema,
  insertOrderItemSchema,
  type User
} from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  phoneOrEmail: z.string().min(1),
  password: z.string().min(1),
});

export function registerRoutes(app: Express): Server {
  // تقديم الملفات الثابتة من مجلد uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // مسارات الذكاء الاصطناعي المتقدمة
  app.post('/api/ai/analyze-sales', async (req, res) => {
    try {
      const result = await aiService.analyzeSalesPerformance({});
      res.json(result);
    } catch (error) {
      console.error('خطأ في تحليل المبيعات:', error);
      res.status(500).json({ error: 'فشل في تحليل المبيعات' });
    }
  });

  app.post('/api/ai/generate-description', async (req, res) => {
    try {
      const { productName, category, price } = req.body;
      const result = await aiService.generateProductDescription(productName, category, price);
      res.json({ description: result });
    } catch (error) {
      console.error('خطأ في توليد الوصف:', error);
      res.status(500).json({ error: 'فشل في توليد الوصف' });
    }
  });

  app.post('/api/ai/analyze-customers', async (req, res) => {
    try {
      const result = await aiService.analyzeCustomerBehavior({});
      res.json(result);
    } catch (error) {
      console.error('خطأ في تحليل العملاء:', error);
      res.status(500).json({ error: 'فشل في تحليل العملاء' });
    }
  });

  app.post('/api/ai/customer-support', async (req, res) => {
    try {
      const { question, context } = req.body;
      const result = await aiService.generateCustomerResponse(question, context);
      res.json({ response: result });
    } catch (error) {
      console.error('خطأ في مساعد العملاء:', error);
      res.status(500).json({ error: 'فشل في مساعد العملاء' });
    }
  });

  app.post('/api/ai/sentiment', async (req, res) => {
    try {
      const { text } = req.body;
      const result = await aiService.analyzeSentiment(text);
      res.json(result);
    } catch (error) {
      console.error('خطأ في تحليل المشاعر:', error);
      res.status(500).json({ error: 'فشل في تحليل المشاعر' });
    }
  });

  // الميزات الجديدة لإدارة التطبيق
  app.post('/api/ai/analyze-app-performance', async (req, res) => {
    try {
      const result = await aiService.analyzeAppPerformance();
      res.json(result);
    } catch (error) {
      console.error('خطأ في تحليل أداء التطبيق:', error);
      res.status(500).json({ error: 'فشل في تحليل أداء التطبيق' });
    }
  });

  app.post('/api/ai/analyze-user-base', async (req, res) => {
    try {
      const result = await aiService.analyzeUserBase();
      res.json(result);
    } catch (error) {
      console.error('خطأ في تحليل قاعدة المستخدمين:', error);
      res.status(500).json({ error: 'فشل في تحليل قاعدة المستخدمين' });
    }
  });

  // استمرار باقي المسارات...
  const httpServer = createServer(app);
  return httpServer;
}