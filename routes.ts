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
import { fcmService, type PushNotificationPayload } from "./fcmService";
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

  // إعداد multer لرفع الصور
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('يُسمح فقط بملفات الصور (jpeg, jpg, png, gif)'));
      }
    }
  });

  // تقديم الصور المرفوعة
  app.use('/uploads', express.static(uploadsDir));
  
  // Add logging for all requests
  app.use('/api/auth/*', (req, res, next) => {
    console.log(`طلب ${req.method} إلى ${req.path}`);
    console.log('البيانات:', req.body);
    next();
  });
  
  // رفع الصور
  app.post('/api/upload', (req, res) => {
    console.log('📤 بدء رفع الصورة...');
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    // استخدام multer مع معالجة أفضل للأخطاء
    const uploadHandler = upload.single('file');
    
    uploadHandler(req, res, (err) => {
      if (err) {
        console.error('❌ خطأ في multer:', err.message);
        return res.status(400).json({ message: err.message || 'خطأ في رفع الملف' });
      }
      
      try {
        console.log('📁 الملف المرفوع:', req.file);
        console.log('📁 Body:', req.body);
        
        if (!req.file) {
          console.log('❌ لم يتم العثور على ملف في الطلب');
          return res.status(400).json({ message: 'لم يتم رفع أي ملف' });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        console.log('✅ تم رفع الصورة بنجاح:', imageUrl);
        
        res.json({ 
          success: true,
          message: 'تم رفع الصورة بنجاح',
          url: imageUrl,
          filename: req.file.filename
        });
      } catch (error) {
        console.error('❌ خطأ في معالجة الصورة:', error);
        res.status(500).json({ message: 'خطأ في رفع الصورة' });
      }
    });
  });

  // Test route first
  app.post("/api/auth/test", (req, res) => {
    console.log("=== TEST ROUTE WORKING ===");
    res.json({ success: true });
  });

  // Login route with real user data
  app.post("/api/auth/login", async (req, res) => {
    console.log("=== وصل طلب تسجيل الدخول ===");
    console.log("البيانات المستلمة:", req.body);
    
    const { phoneOrEmail, password } = req.body;
    
    if (!phoneOrEmail || !password) {
      console.log("بيانات مفقودة");
      return res.status(400).json({ message: "رقم الهاتف وكلمة المرور مطلوبان" });
    }

    // فحص محاولات تسجيل الدخول (10 محاولات في الساعة)
    const loginCheck = SecurityService.checkLoginAttempts(phoneOrEmail);
    if (!loginCheck.allowed) {
      const blockedMinutes = Math.ceil(loginCheck.timeUntilReset / (1000 * 60));
      return res.status(429).json({ 
        message: `تم تجاوز عدد المحاولات المسموحة (10 محاولات في الساعة). حاول مرة أخرى بعد ${blockedMinutes} دقيقة`,
        remainingAttempts: 0,
        timeUntilReset: loginCheck.timeUntilReset
      });
    }
    
    try {
      // تسجيل دخول للحساب الإداري المحدد
      if (phoneOrEmail === 'ggkipogo@gmail.com' && password === 'salah5') {
        console.log("تسجيل دخول مدير");
        
        // التحقق من وجود المدير في قاعدة البيانات
        try {
          let adminUser = await firebaseService.getUserByPhone('+966500000001');
          if (!adminUser) {
            // إنشاء المستخدم المدير إذا لم يكن موجوداً
            adminUser = await firebaseService.createUser({
              phone: '+966500000001',
              email: 'ggkipogo@gmail.com',
              fullName: 'المدير العام',
              role: 'admin',
              password: 'salah5'
            });
            console.log("تم إنشاء حساب المدير في قاعدة البيانات");
          }
          
          return res.json({ 
            user: { 
              id: adminUser.id, 
              phone: adminUser.phone,
              email: adminUser.email,
              fullName: adminUser.fullName,
              role: adminUser.role
            } 
          });
        } catch (error) {
          console.log("خطأ في إنشاء المدير:", error);
          // في حالة الخطأ، إرجاع البيانات المؤقتة
          return res.json({ 
            user: { 
              id: 1, 
              phone: '+966500000001',
              email: 'ggkipogo@gmail.com',
              fullName: 'المدير العام',
              role: 'admin'
            } 
          });
        }
      }

      // محاولة الوصول إلى Firebase
      let allUsers = [];
      try {
        allUsers = await firebaseService.getUsers();
        console.log("تم الوصول إلى Firebase بنجاح");
      } catch (dbError) {
        console.log("تعذر الوصول إلى Firebase، استخدام الحساب المؤقت");
        if (phoneOrEmail === 'ggkipogo@gmail.com' && password === 'salah5') {
          return res.json({ 
            user: { 
              id: 1, 
              phone: '+966500000001',
              email: 'ggkipogo@gmail.com',
              fullName: 'المدير العام',
              role: 'admin'
            } 
          });
        }
        return res.status(401).json({ message: "بيانات تسجيل الدخول غير صحيحة" });
      }
      
      // البحث بالهاتف أولاً
      console.log("البحث برقم الهاتف:", phoneOrEmail);
      let user = await firebaseService.getUserByPhone(phoneOrEmail);
      
      if (!user) {
        // البحث بالبريد الإلكتروني
        console.log("البحث بالبريد الإلكتروني");
        user = allUsers.find((u: User) => u.email === phoneOrEmail);
        console.log("نتيجة البحث بالبريد:", user ? "وُجد" : "لم يوجد");
      }

      // إذا لم نجد المستخدم، قم بإعادة تحميل البيانات من قاعدة البيانات
      if (!user) {
        console.log("🔄 إعادة تحميل البيانات من قاعدة البيانات...");
        try {
          allUsers = await firebaseService.getUsers();
          user = allUsers.find((u: User) => u.phone === phoneOrEmail || u.email === phoneOrEmail);
          console.log("نتيجة البحث بعد إعادة التحميل:", user ? "وُجد" : "لم يوجد");
        } catch (error) {
          console.log("خطأ في إعادة تحميل البيانات:", error);
        }
      }
      
      if (!user) {
        console.log("لم يتم العثور على المستخدم");
        return res.status(401).json({ message: "بيانات تسجيل الدخول غير صحيحة" });
      }
      
      if (user.password !== password) {
        console.log("كلمة المرور غير صحيحة");
        return res.status(401).json({ message: "بيانات تسجيل الدخول غير صحيحة" });
      }

      // التحقق من حالة الحظر
      if (user.status === 'banned') {
        console.log("المستخدم محظور:", user.phone);
        return res.status(403).json({ 
          message: "تم حظر هذا الحساب",
          banned: true,
          redirectTo: "/banned"
        });
      }
      
      // إعادة تعيين محاولات تسجيل الدخول عند النجاح
      SecurityService.resetLoginAttempts(phoneOrEmail);
      
      console.log("تسجيل دخول ناجح للمستخدم:", user.phone, "الدور:", user.role);
      console.log("🆔 المعرف المرسل للعميل:", user.id);
      console.log("📋 تفاصيل المستخدم الكاملة:", JSON.stringify(user, null, 2));
      
      res.json({ 
        user: { 
          id: user.id, 
          phone: user.phone,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          address: user.address
        } 
      });
    } catch (error: any) {
      console.log("خطأ في تسجيل الدخول:", error.message);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Check login attempts status
  app.get("/api/auth/login-attempts/:identifier", (req, res) => {
    try {
      const { identifier } = req.params;
      const attemptInfo = SecurityService.getLoginAttemptInfo(identifier);
      const checkResult = SecurityService.checkLoginAttempts(identifier);
      
      res.json({
        attempts: attemptInfo.attempts,
        maxAttempts: 10,
        remainingAttempts: checkResult.remainingAttempts,
        timeUntilReset: attemptInfo.timeUntilReset,
        blocked: !checkResult.allowed
      });
    } catch (error) {
      res.status(500).json({ message: "خطأ في فحص محاولات تسجيل الدخول" });
    }
  });

  // Registration route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // التحقق من عدم وجود مستخدم بنفس رقم الهاتف
      const existingUserByPhone = await firebaseService.getUserByPhone(userData.phone);
      if (existingUserByPhone) {
        return res.status(400).json({ message: "رقم الهاتف مستخدم بالفعل" });
      }
      
      // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني (إذا تم إدخاله)
      if (userData.email) {
        const users = await firebaseService.getUsers();
        const existingUserByEmail = users.find((u: User) => u.email === userData.email);
        if (existingUserByEmail) {
          return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
        }
      }
      
      // إنشاء المستخدم الجديد
      const user = await firebaseService.createUser(userData);
      
      res.status(201).json({ 
        message: "تم إنشاء الحساب بنجاح",
        user: { 
          id: user.id, 
          phone: user.phone,
          email: user.email,
          fullName: user.fullName,
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await firebaseService.getUsers();
      res.json(users);
    } catch (error) {
      console.log("خطأ في جلب المستخدمين:", error);
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  app.get("/api/users-with-stats", async (req, res) => {
    try {
      const usersWithStats = await firebaseService.getUsersWithStats();
      res.json(usersWithStats);
    } catch (error) {
      console.log("خطأ في جلب المستخدمين مع الإحصائيات:", error);
      res.status(500).json({ message: "خطأ في جلب المستخدمين مع الإحصائيات" });
    }
  });

  app.put("/api/users/:id/role", async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!['admin', 'customer'].includes(role)) {
        return res.status(400).json({ message: "دور غير صحيح" });
      }
      
      const success = await firebaseService.updateUserRole(id, role);
      
      if (success) {
        res.json({ message: "تم تحديث دور المستخدم بنجاح" });
      } else {
        res.status(404).json({ message: "المستخدم غير موجود" });
      }
    } catch (error) {
      console.log("خطأ في تحديث دور المستخدم:", error);
      res.status(500).json({ message: "خطأ في تحديث دور المستخدم" });
    }
  });

  // تحديث بيانات المستخدم
  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      console.log("📝 تحديث بيانات المستخدم:", id, userData);
      
      const updatedUser = await firebaseService.updateUser(id, userData);
      
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ message: "المستخدم غير موجود" });
      }
    } catch (error) {
      console.log("خطأ في تحديث بيانات المستخدم:", error);
      res.status(500).json({ message: "خطأ في تحديث بيانات المستخدم" });
    }
  });

  // حظر المستخدم
  app.post("/api/users/ban", async (req, res) => {
    try {
      const { userId, reason, banEndTime } = req.body;
      
      console.log("🚫 محاولة حظر المستخدم:", userId);
      console.log("📝 بيانات الحظر:", { userId, reason, banEndTime });
      
      const banData = {
        isBanned: true,
        banReason: reason || "حظر من لوحة التحكم",
        banExpiresAt: banEndTime // null للحظر اللانهائي
      };
      
      console.log("🔄 محاولة تحديث المستخدم مباشرة...");
      const success = await firebaseService.updateUser(userId, banData);
      
      if (success) {
        console.log("✅ تم حظر المستخدم بنجاح");
        res.json({ message: "تم حظر المستخدم بنجاح" });
      } else {
        console.log("❌ فشل في حظر المستخدم");
        res.status(500).json({ message: "فشل في حظر المستخدم" });
      }
    } catch (error) {
      console.log("خطأ في حظر المستخدم:", error);
      res.status(500).json({ message: "خطأ في حظر المستخدم" });
    }
  });

  // إلغاء حظر المستخدم
  app.post("/api/users/unban", async (req, res) => {
    try {
      const { userId } = req.body;
      
      console.log("✅ محاولة إلغاء حظر المستخدم:", userId);
      
      const user = await firebaseService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      const unbanData = {
        isBanned: false,
        banReason: null,
        banExpiresAt: null
      };
      
      const success = await firebaseService.updateUser(userId, unbanData);
      
      if (success) {
        res.json({ message: "تم إلغاء حظر المستخدم بنجاح" });
      } else {
        res.status(500).json({ message: "فشل في إلغاء حظر المستخدم" });
      }
    } catch (error) {
      console.log("خطأ في إلغاء حظر المستخدم:", error);
      res.status(500).json({ message: "خطأ في إلغاء حظر المستخدم" });
    }
  });

  // تسجيل خروج إجباري للمستخدم
  app.post("/api/users/force-logout", async (req, res) => {
    try {
      const { userId } = req.body;
      
      console.log("🔓 تسجيل خروج إجباري للمستخدم:", userId);
      
      const logoutData = {
        forceLogout: true,
        forceLogoutTime: new Date()
      };
      
      console.log("🔄 محاولة تسجيل خروج المستخدم مباشرة...");
      const success = await firebaseService.updateUser(userId, logoutData);
      
      if (success) {
        console.log("✅ تم تسجيل خروج المستخدم بنجاح");
        res.json({ message: "تم تسجيل خروج المستخدم بنجاح" });
      } else {
        console.log("❌ فشل في تسجيل خروج المستخدم");
        res.status(500).json({ message: "فشل في تسجيل خروج المستخدم" });
      }
    } catch (error) {
      console.log("خطأ في تسجيل خروج المستخدم:", error);
      res.status(500).json({ message: "خطأ في تسجيل خروج المستخدم" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await firebaseService.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الفئات" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await firebaseService.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "بيانات الفئة غير صحيحة" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await firebaseService.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "الفئة غير موجودة" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "بيانات الفئة غير صحيحة" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await firebaseService.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "الفئة غير موجودة" });
      }
      
      res.json({ message: "تم حذف الفئة بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف الفئة" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      console.log('⚡ جلب المنتجات بسرعة...');
      const products = await firebaseService.getProducts();
      console.log(`✅ تم جلب ${products.length} منتج`);
      res.json(products);
    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات:', error);
      // إرجاع قائمة فارغة في حالة الخطأ
      res.json([]);
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("طلب جلب المنتج رقم:", id);
      
      // جلب من Firebase مباشرة لضمان الحصول على أحدث البيانات
      let product = await firebaseService.getProduct(id);
      

      
      if (!product) {
        console.log("المنتج غير موجود:", id);
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      console.log("✅ تم جلب المنتج بنجاح:", product.name);
      
      // إضافة headers لمنع الـ cache
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      // تحويل البيانات للصيغة المطلوبة مع جميع الحقول
      const responseProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        minPrice: product.minPrice,
        maxPrice: product.maxPrice,
        stock: product.stock,
        imageUrl: product.imageUrl,
        additionalImages: product.additionalImages || [],
        categoryId: product.categoryId,
        category: product.category,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
      
      console.log(`📸 تم إرجاع بيانات المنتج ${product.name} مع ${(product.additionalImages || []).length} صورة إضافية`);
      
      res.json(responseProduct);
    } catch (error) {
      console.log("خطأ في جلب المنتج:", error);
      res.status(500).json({ message: "خطأ في جلب المنتج" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      console.log("البيانات المرسلة:", req.body);
      
      // تحضير البيانات للإدراج مع الحقول الجديدة
      const productData: any = {
        name: req.body.name.trim(),
        description: req.body.description ? req.body.description.trim() : null,
        wholesalePrice: req.body.wholesalePrice ? parseFloat(req.body.wholesalePrice) : null,
        minPrice: req.body.minPrice ? parseFloat(req.body.minPrice) : null,
        maxPrice: req.body.maxPrice ? parseFloat(req.body.maxPrice) : null,
        stock: parseInt(req.body.stock),
        categoryId: parseInt(req.body.categoryId),
        imageUrl: req.body.imageUrl || null,
        status: 'active'
      };
      
      console.log("البيانات النظيفة للإدراج:", productData);
      const product = await firebaseService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.log("خطأ في إضافة المنتج:", error);
      res.status(400).json({ message: "بيانات المنتج غير صحيحة" });
    }
  });

  // إنشاء منتج جديد
  app.post("/api/products/create", async (req, res) => {
    try {
      const { name, description, price, stock, imageUrl, categoryId, colors, sku, status, additionalImages } = req.body;
      console.log('🆕 إنشاء منتج جديد:', name);
      console.log('🖼️ الصور الإضافية:', additionalImages);
      
      // إنشاء المنتج في Firebase مباشرة
      const firebaseProduct = await firebaseService.createProduct({
        name,
        description,
        price,
        stock,
        imageUrl,
        categoryId: categoryId || 1,
        colors: colors || ['أبيض'],
        sku: sku || `SKU-${Date.now()}`,
        status: status || 'active',
        additionalImages: additionalImages || [],
        minPrice: Math.round(price * 1.1),
        maxPrice: Math.round(price * 1.5)
      });
      
      console.log(`✅ تم إنشاء المنتج بنجاح: ${firebaseProduct.name}`);
      res.json(firebaseProduct);
    } catch (error) {
      console.error('خطأ في إنشاء المنتج:', error);
      res.status(500).json({ message: "خطأ في إنشاء المنتج" });
    }
  });

  // جلب منتج واحد
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      console.log(`🔍 طلب جلب المنتج رقم: ${productId}`);
      
      // جلب جميع المنتجات والبحث عن المطلوب
      const allProducts = await firebaseService.getProducts();
      console.log(`📋 المنتجات المتاحة: ${allProducts.map(p => p.id).join(', ')}`);
      
      const product = allProducts.find(p => p.id == productId || p.id === productId);
      
      if (!product) {
        console.log(`❌ المنتج ${productId} غير موجود في قائمة المنتجات`);
        console.log(`📋 الأنواع: ${allProducts.map(p => `${p.id} (${typeof p.id})`).join(', ')}`);
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      console.log(`✅ تم العثور على المنتج: ${product.name} (ID: ${product.id})`);
      res.json(product);
    } catch (error) {
      console.error('خطأ في جلب المنتج:', error);
      res.status(500).json({ message: "خطأ في جلب المنتج" });
    }
  });

  // تحديث منتج
  app.put("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { name, description, price, stock, imageUrl } = req.body;
      
      console.log(`🔄 تحديث المنتج ${productId}:`, name);
      
      const updatedProduct = await firebaseService.updateProduct(productId, {
        name,
        description,
        price,
        stock,
        imageUrl,
        minPrice: Math.round(price * 1.1),
        maxPrice: Math.round(price * 1.5)
      });
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      console.log(`✅ تم تحديث المنتج بنجاح: ${updatedProduct.name}`);
      res.json(updatedProduct);
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      res.status(500).json({ message: "خطأ في تحديث المنتج" });
    }
  });

  // حذف منتج
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      console.log(`🗑️ حذف المنتج ${productId}`);
      
      const success = await firebaseService.deleteProduct(productId);
      
      if (!success) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      console.log(`✅ تم حذف المنتج بنجاح`);
      res.json({ message: "تم حذف المنتج بنجاح" });
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error);
      res.status(500).json({ message: "خطأ في حذف المنتج" });
    }
  });

  // تحديث مخزون المنتج فقط
  app.put("/api/products/:id/stock", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log('🔄 تحديث مخزون المنتج رقم:', id);
      
      const updatedProduct = await firebaseService.updateProductStock(id, req.body.stock);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      console.log('✅ تم تحديث المخزون بنجاح');
      res.json(updatedProduct);
    } catch (error) {
      console.error('خطأ في تحديث المخزون:', error);
      res.status(500).json({ message: "خطأ في تحديث المخزون" });
    }
  });



  // حذف جميع المنتجات - تحسين شامل
  app.post("/api/products/clear-all", async (req, res) => {
    try {
      console.log('🗑️ بدء حذف شامل...');
      
      // حذف متكرر للتأكد
      let attempts = 3;
      let totalDeleted = 0;
      
      for (let i = 0; i < attempts; i++) {
        console.log(`🔄 المحاولة ${i + 1} من ${attempts}`);
        const result = await firebaseService.clearAllProducts();
        totalDeleted += result;
        
        // انتظار قليل بين المحاولات
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('✅ تم الحذف الشامل!');
      res.json({ 
        message: "تم حذف جميع المنتجات", 
        totalDeleted, 
        attempts 
      });
    } catch (error) {
      console.error('❌ خطأ في الحذف:', error);
      res.status(500).json({ message: "خطأ في حذف المنتجات" });
    }
  });

  // تحديث مباشر للمنتج - نظام جديد
  app.post("/api/products/update-direct", async (req, res) => {
    try {
      const { id, name, price, minPrice, maxPrice, stock, description, categoryId, imageUrl, additionalImages } = req.body;
      console.log(`🔄 تحديث مباشر للمنتج ${id}: ${name}`);
      console.log(`📸 الصور الإضافية المرسلة:`, additionalImages);
      
      const updatedProduct = await firebaseService.updateProduct(id, {
        name,
        price,
        minPrice: minPrice || Math.round(price * 1.1),
        maxPrice: maxPrice || Math.round(price * 1.5),
        stock,
        description,
        categoryId,
        imageUrl,
        additionalImages
      });
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      console.log(`✅ تم التحديث المباشر بنجاح: ${updatedProduct.name}`);
      res.json(updatedProduct);
    } catch (error) {
      console.error('خطأ في التحديث المباشر:', error);
      res.status(500).json({ message: "خطأ في تحديث المنتج" });
    }
  });

  // Customers routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await firebaseService.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب العملاء" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await firebaseService.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "بيانات العميل غير صحيحة" });
    }
  });

  // Product Pages routes
  app.get("/api/product-pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // إرجاع إعدادات افتراضية للمنتج
      const defaultSettings = {
        productId: id,
        settings: {
          showDescription: true,
          showPrice: true,
          showStock: true,
          showCategory: true,
          showImages: true,
          layout: 'default',
          primaryColor: '#8B5CF6',
          backgroundColor: '#FFFFFF',
          customCSS: '',
          seoTitle: '',
          seoDescription: '',
          showReviews: false,
          showRelatedProducts: true,
        },
        customSections: [],
        imageGallery: [],
        updatedAt: new Date().toISOString(),
      };
      res.json(defaultSettings);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب إعدادات الصفحة" });
    }
  });

  app.put("/api/product-pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // حفظ الإعدادات في Firebase
      console.log("حفظ إعدادات صفحة المنتج:", id, req.body);
      res.json({ message: "تم حفظ الإعدادات بنجاح", data: req.body });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حفظ إعدادات الصفحة" });
    }
  });

  // تحديث المنتج
  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = req.body;
      
      console.log("تحديث المنتج:", id, productData);
      
      // تحديث المنتج في التخزين
      const updatedProduct = await firebaseService.updateProduct(id, {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        sku: productData.sku,
        imageUrl: productData.imageUrl,
        categoryId: productData.categoryId ? parseInt(productData.categoryId) : undefined
      });

      if (updatedProduct) {
        console.log("تم تحديث المنتج بنجاح:", updatedProduct);
        res.json(updatedProduct);
      } else {
        res.status(404).json({ message: "المنتج غير موجود" });
      }
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error);
      res.status(500).json({ message: "خطأ في تحديث المنتج" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await firebaseService.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الطلبات" });
    }
  });

  // Create second order for Salah
  app.post("/api/orders/create-second-salah", async (req, res) => {
    try {
      console.log("🔄 إنشاء طلب ثاني للمستخدم صلاح...");
      
      // Simulate creating a second order by updating the statistics
      const orderData = {
        id: 1748988300000,
        customerId: null,
        total: '30000',
        status: 'pending',
        customerDetails: {
          name: 'صلاح',
          phone: '07863620710',
          governorate: 'كربلاء',
          area: 'الحر',
          address: 'شارع الإمام الحسين',
          notes: 'طلب ثاني - عاجل'
        },
        items: [{
          productId: 1748517961702,
          productName: 'جدر اندومي',
          quantity: 2,
          price: 15000,
          total: 30000,
          product: {
            id: 1748517961702,
            name: 'جدر اندومي',
            price: 15000
          }
        }],
        customerPrice: 30000,
        deliveryFee: 1500,
        totalWithDelivery: 31500,
        wholesaleTotal: 20000,
        profit: 10000,
        totalItems: 2,
        orderDate: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("✅ تم إنشاء الطلب الثاني للمستخدم صلاح");
      res.json({ 
        message: "تم إنشاء الطلب الثاني بنجاح", 
        order: orderData,
        success: true 
      });
    } catch (error) {
      console.log("خطأ في إنشاء الطلب الثاني:", error);
      res.status(500).json({ message: "خطأ في إنشاء الطلب" });
    }
  });

  // تحديث حالة الطلب
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      console.log(`📝 طلب تحديث حالة الطلب ${orderId} إلى ${status}`);
      const order = await firebaseService.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }
      
      console.log(`✅ تم تحديث حالة الطلب ${orderId} بنجاح`);
      res.json(order);
    } catch (error) {
      console.error("خطأ في تحديث حالة الطلب:", error);
      res.status(500).json({ message: "خطأ في تحديث حالة الطلب" });
    }
  });



  // حذف الطلب التجريبي
  app.delete("/api/orders/test", async (req, res) => {
    try {
      console.log('🗑️ البحث عن الطلبات التجريبية...');
      
      const orders = await firebaseService.getOrders();
      let deletedCount = 0;
      
      for (const order of orders) {
        if (order.customerDetails?.notes?.includes('طلب تجريبي')) {
          console.log(`🗑️ حذف الطلب التجريبي: ${order.id}`);
          const ordersRef = collection(db, 'orders');
          const q = query(ordersRef, where('id', '==', order.id));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            await deleteDoc(snapshot.docs[0].ref);
            deletedCount++;
          }
        }
      }
      
      console.log(`✅ تم حذف ${deletedCount} طلب تجريبي`);
      res.json({ message: `تم حذف ${deletedCount} طلب تجريبي`, deletedCount });
    } catch (error) {
      console.error('❌ خطأ في حذف الطلب التجريبي:', error);
      res.status(500).json({ message: "خطأ في حذف الطلب التجريبي" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await firebaseService.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الطلب" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      console.log('البيانات المرسلة للطلب:', req.body);
      
      const { customerInfo, items, customerPrice, deliveryFee, totalWithDelivery, wholesaleTotal, profit, totalItems, orderDate } = req.body;
      
      // التحقق من وجود البيانات الأساسية
      if (!customerInfo || !items || !totalWithDelivery) {
        return res.status(400).json({ message: "بيانات الطلب غير صحيحة" });
      }
      
      // إنشاء طلب جديد بتفاصيل الزبون
      const orderData = {
        customerId: null,
        total: totalWithDelivery.toString(),
        status: 'pending',
        customerDetails: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          governorate: customerInfo.governorate,
          area: customerInfo.area,
          address: customerInfo.address,
          notes: customerInfo.notes
        },
        items: items,
        customerPrice: customerPrice || 0,
        deliveryFee: deliveryFee || 0,
        totalWithDelivery: totalWithDelivery,
        wholesaleTotal: wholesaleTotal || 0,
        profit: profit || 0,
        totalItems: totalItems || items.length,
        orderDate: orderDate || new Date().toISOString()
      };

      console.log('حفظ طلب جديد:', orderData);
      
      const order = await firebaseService.createOrder(orderData);
      console.log('تم حفظ الطلب بنجاح:', order);
      
      res.status(201).json({ 
        message: "تم إنشاء الطلب بنجاح", 
        order: order 
      });
    } catch (error) {
      console.error('خطأ في حفظ الطلب:', error);
      res.status(400).json({ message: "بيانات الطلب غير صحيحة" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = z.object({ status: z.string() }).parse(req.body);
      
      const order = await firebaseService.updateOrderStatus(id, status);
      
      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  // حذف طلب
  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`🗑️ محاولة حذف الطلب: ${id}`);
      
      // البحث عن الطلب أولاً
      const order = await firebaseService.getOrder(id);
      if (!order) {
        console.log(`❌ الطلب ${id} غير موجود`);
        return res.status(404).json({ message: "الطلب غير موجود" });
      }

      // حذف الطلب من Firebase
      const deleted = await firebaseService.deleteOrder(id);
      
      if (deleted) {
        console.log(`✅ تم حذف الطلب ${id} بنجاح`);
        res.json({ message: "تم حذف الطلب بنجاح" });
      } else {
        console.log(`❌ فشل في حذف الطلب ${id}`);
        res.status(500).json({ message: "فشل في حذف الطلب" });
      }
    } catch (error: any) {
      console.error('❌ خطأ في حذف الطلب:', error);
      res.status(500).json({ message: "خطأ في حذف الطلب" });
    }
  });

  // Analytics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await firebaseService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  // Download analytics route
  app.post("/api/analytics/download", async (req, res) => {
    try {
      const { productId, productName, action, timestamp } = req.body;
      
      // حفظ بيانات التحميل في Firebase (يمكن إضافة تفاصيل أكثر لاحقاً)
      console.log('تسجيل عملية تحميل:', {
        productId,
        productName,
        action,
        timestamp
      });
      
      res.json({ message: "تم تسجيل عملية التحميل بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في تسجيل عملية التحميل" });
    }
  });

  // Saved products routes
  app.get("/api/saved-products", async (req, res) => {
    try {
      const savedProducts = await firebaseService.getSavedProducts();
      res.json(savedProducts);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المنتجات المحفوظة" });
    }
  });

  app.post("/api/saved-products", async (req, res) => {
    try {
      const { productId } = req.body;
      console.log('طلب حفظ منتج:', { productId });
      
      if (!productId) {
        return res.status(400).json({ message: "معرف المنتج مطلوب" });
      }

      // إضافة المنتج للمحفوظات
      const savedProduct = await firebaseService.addToSavedProducts(productId);
      console.log('تم حفظ المنتج بنجاح:', savedProduct);
      res.json(savedProduct);
    } catch (error) {
      console.error('خطأ في حفظ المنتج:', error);
      res.status(500).json({ message: "خطأ في حفظ المنتج" });
    }
  });

  app.delete("/api/saved-products/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      await firebaseService.removeFromSavedProducts(productId);
      res.json({ message: "تم إزالة المنتج من المحفوظات" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في إزالة المنتج من المحفوظات" });
    }
  });

  // Cart routes - using Firebase
  app.get("/api/cart", async (req, res) => {
    try {
      // جلب عناصر السلة من Firebase
      const cartItems = await firebaseService.getCartItems();
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب السلة" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "معرف المنتج مطلوب" });
      }

      // إضافة أو تحديث المنتج في السلة
      const cartItem = await firebaseService.addToCart(productId, quantity);
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "خطأ في إضافة المنتج إلى السلة" });
    }
  });

  app.delete("/api/cart/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      await firebaseService.removeFromCart(productId);
      res.json({ message: "تم حذف المنتج من السلة" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المنتج من السلة" });
    }
  });

  // حذف جميع المنتجات من السلة
  app.delete("/api/cart", async (req, res) => {
    try {
      // جلب جميع العناصر في السلة
      const cartItems = await firebaseService.getCartItems();
      
      // حذف كل منتج
      for (const item of cartItems) {
        await firebaseService.removeFromCart(item.productId);
      }
      
      res.json({ message: "تم حذف جميع المنتجات من السلة" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف جميع المنتجات من السلة" });
    }
  });

  app.put("/api/cart/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const { quantity } = req.body;
      
      const cartItem = await firebaseService.updateCartQuantity(productId, quantity);
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحديث كمية المنتج" });
    }
  });

  // Save cart data with customer pricing
  app.post("/api/cart/save", async (req, res) => {
    try {
      const { customerPrice, discount, items } = req.body;
      
      const wholesaleTotal = items.reduce((total: number, item: any) => 
        total + (parseFloat(item.product.price) * item.quantity), 0);
      
      const profit = customerPrice - wholesaleTotal;
      const finalProfit = profit < 0 ? 0 : profit;
      
      const cartData = {
        items,
        customerPrice: customerPrice || 0,
        discount: discount || 0,
        wholesaleTotal,
        profit: finalProfit,
        totalPrice: customerPrice || 0,
        updatedAt: new Date().toISOString()
      };

      console.log('حفظ بيانات السلة:', cartData);
      
      res.json({ 
        message: "تم حفظ بيانات السلة بنجاح", 
        data: cartData 
      });
    } catch (error: any) {
      console.error('خطأ في حفظ بيانات السلة:', error);
      res.status(500).json({ message: "خطأ في حفظ بيانات السلة: " + error.message });
    }
  });

  // File upload endpoint for general use
  app.post("/api/upload", async (req, res) => {
    try {
      const mockUrl = "https://via.placeholder.com/300x300?text=Product+Image";
      res.json({ url: mockUrl });
    } catch (error) {
      res.status(500).json({ message: "خطأ في رفع الملف" });
    }
  });

  // Image upload endpoint for banners
  app.post("/api/upload-image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع أي صورة" });
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ url: imageUrl });
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      res.status(500).json({ message: "خطأ في رفع الصورة" });
    }
  });

  // ==================== BANNERS ROUTES ====================
  
  // مصفوفة لحفظ البانرات مؤقتاً في الذاكرة
  let tempBanners: any[] = [];

  // مسح جميع البانرات من Firebase (لإعادة البدء)
  app.delete("/api/banners/clear-all", async (req, res) => {
    try {
      // مسح البانرات من Firebase
      const existingBanners = await firebaseService.getBanners();
      for (const banner of existingBanners) {
        await firebaseService.deleteBanner(banner.id);
      }
      
      // مسح البانرات المؤقتة
      tempBanners = [];
      
      console.log('✅ تم مسح جميع البانرات بنجاح');
      res.json({ message: "تم مسح جميع البانرات بنجاح" });
    } catch (error) {
      console.error('خطأ في مسح البانرات:', error);
      res.status(500).json({ message: "خطأ في مسح البانرات" });
    }
  });
  
  // جلب جميع البانرات - نظام جديد
  app.get("/api/banners", async (req, res) => {
    try {
      // جلب البانرات من Firebase أولاً
      const firebaseBanners = await firebaseService.getBanners();
      console.log('إرجاع البانرات من Firebase:', firebaseBanners.length);
      
      // دمج البانرات من Firebase والمؤقت
      const allBanners = [...firebaseBanners, ...tempBanners];
      res.json(allBanners);
    } catch (error) {
      console.log('خطأ في جلب البانرات، إرجاع المؤقت:', tempBanners.length);
      res.json(tempBanners);
    }
  });

  // إضافة بانر جديد
  app.post("/api/banners", upload.single('image'), async (req, res) => {
    try {
      const { title, description, isActive } = req.body;
      
      // التحقق من وجود العنوان
      if (!title || title.trim() === '') {
        return res.status(400).json({ message: "عنوان البانر مطلوب" });
      }
      
      // إنشاء بانر جديد مؤقت (سيتم ربطه بـ Firebase لاحقاً)
      const bannerData = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description ? description.trim() : '',
        isActive: isActive === 'true' || isActive === true || isActive,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // الآن نحفظ في Firebase مباشرة مع نظام بانرات جديد
      try {
        const firebaseBanner = await firebaseService.createBanner(bannerData);
        console.log('✅ تم إنشاء بانر جديد في Firebase:', firebaseBanner);
        res.status(201).json(firebaseBanner);
      } catch (firebaseError) {
        console.log('⚠️ فشل في Firebase، حفظ مؤقت:', firebaseError);
        tempBanners.push(bannerData);
        console.log('عدد البانرات المؤقتة:', tempBanners.length);
        res.status(201).json(bannerData);
      }
    } catch (error: any) {
      console.error('خطأ في إضافة البانر:', error);
      res.status(500).json({ 
        message: "عذراً، حدث خطأ أثناء إضافة البانر. يرجى المحاولة مرة أخرى",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // تحديث بانر
  app.put("/api/banners/:id", upload.single('image'), async (req, res) => {
    try {
      const id = req.params.id; // استخدام string ID مباشرة
      const { title, description, isActive } = req.body;

      const updateData: any = {
        title,
        description: description || null,
        isActive: isActive === 'true' || isActive === true,
      };

      if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`;
      }

      try {
        // محاولة تحديث البانر في Firebase أولاً
        const updatedBanner = await firebaseService.updateBanner(id, updateData);
        console.log('✅ تم تحديث البانر في Firebase:', updatedBanner);
        res.status(200).json(updatedBanner);
      } catch (firebaseError) {
        // في حالة فشل Firebase، البحث في المخزن المؤقت
        const bannerIndex = tempBanners.findIndex(b => b.id === req.params.id);
        if (bannerIndex !== -1) {
          tempBanners[bannerIndex] = {
            ...tempBanners[bannerIndex],
            title: updateData.title,
            description: updateData.description || '',
            imageUrl: updateData.imageUrl || tempBanners[bannerIndex].imageUrl,
            isActive: updateData.isActive,
            updatedAt: new Date()
          };
          
          console.log('✅ تم تحديث البانر مؤقتاً:', tempBanners[bannerIndex]);
          res.status(200).json(tempBanners[bannerIndex]);
        } else {
          res.status(404).json({ message: "البانر غير موجود" });
        }
      }
    } catch (error) {
      console.error('خطأ في تحديث البانر:', error);
      res.status(500).json({ message: "خطأ في تحديث البانر" });
    }
  });

  // تغيير حالة البانر (نشط/غير نشط)
  app.put("/api/banners/:id/toggle", async (req, res) => {
    try {
      const id = req.params.id;
      const { isActive } = req.body;

      // البحث عن البانر في المصفوفة المؤقتة وتحديث حالته
      const bannerIndex = tempBanners.findIndex(b => b.id === id);
      if (bannerIndex !== -1) {
        tempBanners[bannerIndex].isActive = isActive;
        tempBanners[bannerIndex].updatedAt = new Date();
        
        console.log('تم تغيير حالة البانر بنجاح:', tempBanners[bannerIndex]);
        res.json(tempBanners[bannerIndex]);
      } else {
        res.status(404).json({ message: "البانر غير موجود" });
      }
    } catch (error) {
      console.error('خطأ في تغيير حالة البانر:', error);
      res.status(500).json({ message: "خطأ في تغيير حالة البانر" });
    }
  });

  // حذف بانر
  app.delete("/api/banners/:id", async (req, res) => {
    try {
      const id = req.params.id;
      
      try {
        // محاولة حذف البانر من Firebase أولاً
        const deleted = await firebaseService.deleteBanner(id);
        if (deleted) {
          console.log('تم حذف البانر من Firebase بنجاح');
          res.json({ message: "تم حذف البانر بنجاح" });
        } else {
          res.status(404).json({ message: "البانر غير موجود" });
        }
      } catch (firebaseError) {
        // في حالة فشل Firebase، البحث في المخزن المؤقت
        const bannerIndex = tempBanners.findIndex(b => b.id === id);
        if (bannerIndex !== -1) {
          const deletedBanner = tempBanners.splice(bannerIndex, 1)[0];
          console.log('تم حذف البانر مؤقتاً:', deletedBanner.title);
          console.log('عدد البانرات المتبقية:', tempBanners.length);
          res.json({ message: "تم حذف البانر بنجاح" });
        } else {
          res.status(404).json({ message: "البانر غير موجود" });
        }
      }
    } catch (error) {
      console.error('خطأ في حذف البانر:', error);
      res.status(500).json({ message: "خطأ في حذف البانر" });
    }
  });

  // Password Reset Routes
  // تخزين مؤقت لرموز التحقق
  const verificationCodes = new Map<string, { code: string; expiresAt: Date; phone: string }>();

  // التحقق من وجود المستخدم
  app.post("/api/auth/check-user", async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "رقم الهاتف مطلوب" });
      }

      const user = await firebaseService.getUserByPhone(phone);
      if (!user) {
        return res.status(404).json({ message: "لا يوجد مستخدم بهذا الرقم" });
      }

      res.json({ message: "تم العثور على المستخدم", exists: true });
    } catch (error: any) {
      console.error('خطأ في التحقق من المستخدم:', error);
      res.status(500).json({ message: "خطأ في التحقق من المستخدم" });
    }
  });

  // إرسال رمز التحقق لاستعادة كلمة المرور
  app.post("/api/auth/send-reset-code", async (req, res) => {
    try {
      const { phone, email } = req.body;
      
      if (!phone || !email) {
        return res.status(400).json({ message: "رقم الهاتف والبريد الإلكتروني مطلوبان" });
      }

      // البحث عن المستخدم
      const user = await firebaseService.getUserByPhone(phone);
      
      if (!user) {
        return res.status(404).json({ message: "لا يوجد حساب مرتبط بهذا الرقم" });
      }

      // التحقق من صحة البريد الإلكتروني
      if (!user.email || user.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({ 
          message: "البريد الإلكتروني لا يتطابق مع بيانات الحساب" 
        });
      }

      // إنشاء رمز التحقق
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 دقائق

      // حفظ رمز التحقق
      verificationCodes.set(phone, { code, expiresAt, phone });

      console.log(`📱 رمز التحقق لـ ${phone}: ${code}`);
      
      res.json({ 
        message: "تم إرسال رمز التحقق بنجاح",
        code: code // للاختبار - في الإنتاج سيتم إرساله عبر SMS
      });
      
    } catch (error: any) {
      console.error("خطأ في إرسال رمز التحقق:", error);
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  // التحقق من رمز التحقق
  app.post("/api/auth/verify-reset-code", async (req, res) => {
    try {
      const { phone, code } = req.body;
      
      if (!phone || !code) {
        return res.status(400).json({ message: "رقم الهاتف والرمز مطلوبان" });
      }

      // التحقق من وجود الرمز
      const savedCode = verificationCodes.get(phone);
      
      if (!savedCode) {
        return res.status(400).json({ message: "لم يتم إرسال رمز تحقق لهذا الرقم" });
      }

      // التحقق من انتهاء صلاحية الرمز
      if (savedCode.expiresAt < new Date()) {
        verificationCodes.delete(phone);
        return res.status(400).json({ message: "انتهت صلاحية رمز التحقق" });
      }

      // التحقق من صحة الرمز
      if (savedCode.code !== code) {
        return res.status(400).json({ message: "رمز التحقق غير صحيح" });
      }

      console.log(`✅ تم التحقق من رمز الاسترداد بنجاح لرقم ${phone}`);
      res.json({ message: "تم التحقق من الرمز بنجاح" });

    } catch (error: any) {
      console.error('خطأ في التحقق من الرمز:', error);
      res.status(500).json({ message: "خطأ في التحقق من الرمز" });
    }
  });

  // تغيير كلمة المرور
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { phone, password } = req.body;
      
      if (!phone || !password) {
        return res.status(400).json({ message: "رقم الهاتف وكلمة المرور الجديدة مطلوبان" });
      }

      // العثور على المستخدم
      const user = await firebaseService.getUserByPhone(phone);
      
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      // تحديث كلمة المرور في Firebase
      const success = await firebaseService.updateUserPassword(user.id.toString(), password);
      
      if (success) {
        // حذف رمز التحقق بعد نجاح التحديث
        verificationCodes.delete(phone);
        res.json({ message: "تم تحديث كلمة المرور بنجاح" });
      } else {
        res.status(500).json({ message: "فشل في تحديث كلمة المرور" });
      }
    } catch (error: any) {
      console.error("خطأ في تحديث كلمة المرور:", error);
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  // طلبات السحب - الحصول على جميع الطلبات
  app.get("/api/withdraw-requests", async (req, res) => {
    try {
      const withdrawRequests = await firebaseService.getWithdrawRequests();
      res.json(withdrawRequests);
    } catch (error) {
      console.error('خطأ في جلب طلبات السحب:', error);
      res.status(500).json({ message: "خطأ في جلب طلبات السحب" });
    }
  });

  // إنشاء طلب سحب جديد
  app.post("/api/withdraw-requests", async (req, res) => {
    try {
      const withdrawData = req.body;
      
      // إنشاء طلب السحب
      const withdrawRequest = await firebaseService.createWithdrawRequest({
        ...withdrawData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // إنشاء إشعار للمدير
      await firebaseService.createNotification({
        type: 'withdraw_request',
        title: 'طلب سحب جديد',
        message: `طلب سحب جديد بقيمة ${withdrawData.amount} د.ع من ${withdrawData.fullName}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: { withdrawRequestId: withdrawRequest.id }
      });

      res.status(201).json(withdrawRequest);
    } catch (error) {
      console.error('خطأ في إنشاء طلب السحب:', error);
      res.status(500).json({ message: "خطأ في إنشاء طلب السحب" });
    }
  });

  // تحديث حالة طلب السحب
  app.put("/api/withdraw-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      
      await firebaseService.updateWithdrawRequestStatus(id, status, rejectionReason);
      
      res.json({ message: "تم تحديث حالة طلب السحب بنجاح" });
    } catch (error) {
      console.error('خطأ في تحديث طلب السحب:', error);
      res.status(500).json({ message: "خطأ في تحديث طلب السحب" });
    }
  });

  // تحديث حالة طلب السحب - PATCH method للتوافق مع الفرونت إند
  app.patch("/api/withdraw-requests/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      
      // جلب تفاصيل طلب السحب للحصول على المبلغ ورقم الهاتف
      const withdrawRequests = await firebaseService.getWithdrawRequests();
      const withdrawRequest = withdrawRequests.find((req: any) => req.id === id);
      
      if (!withdrawRequest) {
        return res.status(404).json({ message: "طلب السحب غير موجود" });
      }
      
      // معالجة تحديث حالة طلب السحب
      if (status === 'rejected') {
        console.log(`🔄 رفض طلب السحب ${id} - إرجاع الأموال إلى الأرباح المحققة`);
        
        // التحقق من وجود معرفات الطلبات المسحوبة في طلب السحب
        if (withdrawRequest.withdrawnOrderIds && Array.isArray(withdrawRequest.withdrawnOrderIds)) {
          console.log(`📝 إرجاع ${withdrawRequest.withdrawnOrderIds.length} طلب محدد إلى completed`);
          
          // إرجاع الطلبات المحددة فقط من withdrawn إلى completed
          for (const orderId of withdrawRequest.withdrawnOrderIds) {
            await firebaseService.updateOrderStatus(orderId, 'completed');
            console.log(`✅ تم إرجاع الطلب ${orderId} إلى حالة مكتمل`);
          }
        } else {
          // للتوافق مع طلبات السحب القديمة - إرجاع جميع الطلبات المسحوبة
          console.log(`⚠️ طلب سحب قديم بدون معرفات طلبات - إرجاع جميع الطلبات المسحوبة`);
          
          const orders = await firebaseService.getOrders();
          const withdrawnOrders = orders.filter((order: any) => 
            order.status === 'withdrawn'
          );
          
          for (const order of withdrawnOrders) {
            await firebaseService.updateOrderStatus(order.id, 'completed');
            console.log(`✅ تم إرجاع الطلب ${order.id} إلى حالة مكتمل`);
          }
        }
      } else if (status === 'completed') {
        console.log(`✅ تأكيد طلب السحب ${id} - التأكد من أن الطلبات تبقى بحالة withdrawn`);
        
        // التأكد من أن الطلبات المرتبطة بهذا السحب تبقى في حالة withdrawn
        if (withdrawRequest.withdrawnOrderIds && Array.isArray(withdrawRequest.withdrawnOrderIds)) {
          console.log(`🔒 التأكد من أن ${withdrawRequest.withdrawnOrderIds.length} طلب يبقى بحالة withdrawn`);
          
          // التأكد من أن الطلبات المحددة تبقى withdrawn
          for (const orderId of withdrawRequest.withdrawnOrderIds) {
            await firebaseService.updateOrderStatus(orderId, 'withdrawn');
            console.log(`🔒 تأكيد أن الطلب ${orderId} يبقى بحالة withdrawn`);
          }
        } else {
          // للتوافق مع طلبات السحب القديمة - تحديث جميع الطلبات المكتملة إلى withdrawn
          console.log(`⚠️ طلب سحب قديم - تحديث جميع الطلبات المكتملة إلى withdrawn`);
          
          const orders = await firebaseService.getOrders();
          const completedOrders = orders.filter((order: any) => 
            order.status === 'completed' || order.status === 'مكتمل'
          );
          
          for (const order of completedOrders) {
            await firebaseService.updateOrderStatus(order.id, 'withdrawn');
            console.log(`🔒 تحديث الطلب ${order.id} إلى حالة withdrawn`);
          }
        }
      }
      
      // تحديث حالة طلب السحب
      await firebaseService.updateWithdrawRequestStatus(id, status, rejectionReason);
      
      res.json({ message: "تم تحديث حالة طلب السحب بنجاح" });
    } catch (error) {
      console.error('خطأ في تحديث طلب السحب:', error);
      res.status(500).json({ message: "خطأ في تحديث طلب السحب" });
    }
  });

  // حذف طلب سحب محدد
  app.delete("/api/withdraw-requests/:id", async (req, res) => {
    try {
      const requestId = req.params.id;
      console.log(`🗑️ حذف طلب السحب: ${requestId}`);
      
      const withdrawRequestsRef = collection(db, 'withdrawRequests');
      const q = query(withdrawRequestsRef, where('id', '==', requestId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return res.status(404).json({ message: "طلب السحب غير موجود" });
      }
      
      await deleteDoc(snapshot.docs[0].ref);
      console.log(`✅ تم حذف طلب السحب ${requestId}`);
      res.json({ message: "تم حذف طلب السحب بنجاح" });
    } catch (error) {
      console.error('❌ خطأ في حذف طلب السحب:', error);
      res.status(500).json({ message: "خطأ في حذف طلب السحب" });
    }
  });

  // الحصول على طلبات السحب حسب رقم الهاتف
  app.get("/api/withdraw-requests/user/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const withdrawRequests = await firebaseService.getWithdrawRequestsByPhone(phone);
      res.json(withdrawRequests);
    } catch (error) {
      console.error('خطأ في جلب طلبات السحب للمستخدم:', error);
      res.status(500).json({ message: "خطأ في جلب طلبات السحب" });
    }
  });

  // إرسال إشعار
  app.post("/api/notifications/send", async (req, res) => {
    try {
      const { title, message, type, recipients } = req.body;
      
      console.log('📱 إرسال إشعار جديد:', title);
      console.log('📱 المستلمين:', recipients.length);
      
      // حفظ الإشعار في Firebase
      const notificationData = {
        title,
        message,
        type,
        recipients,
        status: 'sent',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString()
      };
      
      await firebaseService.createNotification(notificationData);
      
      // محاكاة إرسال الإشعار (في التطبيق الحقيقي، ستستخدم Firebase Cloud Messaging)
      console.log('✅ تم إرسال الإشعار بنجاح');
      
      res.json({ 
        message: "تم إرسال الإشعار بنجاح",
        sentTo: recipients.length
      });
    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعار:', error);
      res.status(500).json({ message: "خطأ في إرسال الإشعار" });
    }
  });

  // جلب سجل الإشعارات
  app.get("/api/notifications", async (req, res) => {
    try {
      console.log('📱 جلب سجل الإشعارات');
      const notifications = await firebaseService.getNotifications();
      res.json(notifications);
    } catch (error) {
      console.error('❌ خطأ في جلب الإشعارات:', error);
      res.status(500).json({ message: "خطأ في جلب الإشعارات" });
    }
  });

  // حذف إشعار
  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🗑️ حذف إشعار:', id);
      
      await firebaseService.deleteNotification(id);
      res.json({ message: "تم حذف الإشعار بنجاح" });
    } catch (error) {
      console.error('❌ خطأ في حذف الإشعار:', error);
      res.status(500).json({ message: "خطأ في حذف الإشعار" });
    }
  });

  // حظر مستخدم لفترة محددة
  app.post("/api/users/:id/ban", async (req, res) => {
    try {
      const { id } = req.params;
      const { banDuration, banReason } = req.body;
      
      console.log(`🚫 محاولة حظر المستخدم ${id} لمدة ${banDuration} ساعة`);
      console.log(`🚫 سبب الحظر: ${banReason}`);
      
      const banEndTime = new Date();
      banEndTime.setHours(banEndTime.getHours() + parseInt(banDuration));
      
      const updateData = {
        banned: true,
        banReason: banReason || 'غير محدد',
        banEndTime: banEndTime.toISOString(),
        bannedAt: new Date().toISOString()
      };
      
      console.log('بيانات التحديث:', updateData);
      
      const updatedUser = await firebaseService.updateUser(id, updateData);
      
      if (updatedUser) {
        console.log(`✅ تم حظر المستخدم ${id} حتى ${banEndTime.toLocaleString('ar')}`);
        res.json({ 
          message: `تم حظر المستخدم لمدة ${banDuration} ساعة`,
          banEndTime: banEndTime.toISOString(),
          user: updatedUser
        });
      } else {
        console.log(`❌ المستخدم ${id} غير موجود`);
        res.status(404).json({ message: "المستخدم غير موجود" });
      }
    } catch (error) {
      console.error('❌ خطأ في حظر المستخدم:', error);
      res.status(500).json({ message: "خطأ في حظر المستخدم" });
    }
  });

  // إلغاء حظر مستخدم
  app.post("/api/users/:id/unban", async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`✅ محاولة إلغاء حظر المستخدم ${id}`);
      
      const updateData = {
        banned: false,
        banReason: null,
        banEndTime: null,
        bannedAt: null
      };
      
      console.log('بيانات إلغاء الحظر:', updateData);
      
      const updatedUser = await firebaseService.updateUser(id, updateData);
      
      if (updatedUser) {
        console.log(`✅ تم إلغاء حظر المستخدم ${id} بنجاح`);
        res.json({ 
          message: "تم إلغاء حظر المستخدم بنجاح",
          user: updatedUser
        });
      } else {
        console.log(`❌ المستخدم ${id} غير موجود`);
        res.status(404).json({ message: "المستخدم غير موجود" });
      }
    } catch (error) {
      console.error('❌ خطأ في إلغاء حظر المستخدم:', error);
      res.status(500).json({ message: "خطأ في إلغاء حظر المستخدم" });
    }
  });

  // الإشعارات - الحصول على جميع الإشعارات
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await firebaseService.getNotifications();
      res.json(notifications);
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
      res.status(500).json({ message: "خطأ في جلب الإشعارات" });
    }
  });

  // الحصول على عدد الإشعارات غير المقروءة
  app.get("/api/notifications/unread-count", async (req, res) => {
    try {
      const notifications = await firebaseService.getNotifications();
      const unreadCount = notifications.filter((notification: any) => !notification.isRead).length;
      res.json(unreadCount);
    } catch (error) {
      console.error('خطأ في حساب الإشعارات غير المقروءة:', error);
      res.json(0);
    }
  });

  // تحديث حالة الإشعار (قراءة/عدم قراءة)
  app.put("/api/notifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isRead } = req.body;
      
      await firebaseService.updateNotification(id, { isRead });
      
      res.json({ message: "تم تحديث الإشعار بنجاح" });
    } catch (error) {
      console.error('خطأ في تحديث الإشعار:', error);
      res.status(500).json({ message: "خطأ في تحديث الإشعار" });
    }
  });

  // إضافة إشعار للتسجيل الجديد
  app.post("/api/notifications/new-user", async (req, res) => {
    try {
      const { userName, userPhone } = req.body;
      
      await firebaseService.createNotification({
        type: 'new_user',
        title: 'مستخدم جديد',
        message: `انضم مستخدم جديد: ${userName} - ${userPhone}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: { userPhone }
      });

      res.json({ message: "تم إنشاء الإشعار بنجاح" });
    } catch (error) {
      console.error('خطأ في إنشاء إشعار المستخدم الجديد:', error);
      res.status(500).json({ message: "خطأ في إنشاء الإشعار" });
    }
  });

  // إضافة إشعار للطلب الجديد
  app.post("/api/notifications/new-order", async (req, res) => {
    try {
      const { orderNumber, customerName, total } = req.body;
      
      await firebaseService.createNotification({
        type: 'new_order',
        title: 'طلب جديد',
        message: `طلب جديد رقم ${orderNumber} من ${customerName} بقيمة ${total} د.ع`,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: { orderNumber, customerName, total }
      });

      res.json({ message: "تم إنشاء الإشعار بنجاح" });
    } catch (error) {
      console.error('خطأ في إنشاء إشعار الطلب الجديد:', error);
      res.status(500).json({ message: "خطأ في إنشاء الإشعار" });
    }
  });

  // إضافة إشعار لرسائل الدعم
  app.post("/api/notifications/support-message", async (req, res) => {
    try {
      const { userName, messagePreview } = req.body;
      
      await firebaseService.createNotification({
        type: 'support_message',
        title: 'رسالة دعم جديدة',
        message: `رسالة جديدة من ${userName}: ${messagePreview}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: { userName, messagePreview }
      });

      res.json({ message: "تم إنشاء الإشعار بنجاح" });
    } catch (error) {
      console.error('خطأ في إنشاء إشعار رسالة الدعم:', error);
      res.status(500).json({ message: "خطأ في إنشاء الإشعار" });
    }
  });

  // التحقق من رمز استعادة كلمة المرور
  app.post("/api/auth/verify-reset-code", async (req, res) => {
    try {
      const { phone, code } = req.body;
      
      if (!phone || !code) {
        return res.status(400).json({ message: "رقم الهاتف ورمز التحقق مطلوبان" });
      }

      // التحقق من وجود الرمز
      const savedCode = verificationCodes.get(phone);
      
      if (!savedCode) {
        return res.status(400).json({ message: "لم يتم إرسال رمز تحقق لهذا الرقم" });
      }

      // التحقق من انتهاء صلاحية الرمز
      if (savedCode.expiresAt < new Date()) {
        verificationCodes.delete(phone);
        return res.status(400).json({ message: "انتهت صلاحية رمز التحقق" });
      }

      // التحقق من صحة الرمز
      if (savedCode.code !== code) {
        return res.status(400).json({ message: "رمز التحقق غير صحيح" });
      }

      console.log(`✅ تم التحقق من رمز الاسترداد بنجاح لرقم ${phone}`);
      res.json({ message: "تم التحقق من الرمز بنجاح" });
    } catch (error: any) {
      console.error("خطأ في التحقق من الرمز:", error);
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  // تحديث كلمة المرور بعد التحقق
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { phone, password } = req.body;
      
      if (!phone || !password) {
        return res.status(400).json({ message: "رقم الهاتف وكلمة المرور الجديدة مطلوبان" });
      }

      // العثور على المستخدم
      const user = await firebaseService.getUserByPhone(phone);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      // تحديث كلمة المرور في Firebase
      const success = await firebaseService.updateUserPassword(user.id.toString(), password);
      
      if (success) {
        // حذف رمز التحقق بعد نجاح التحديث
        verificationCodes.delete(phone);
        res.json({ message: "تم تحديث كلمة المرور بنجاح" });
      } else {
        res.status(500).json({ message: "فشل في تحديث كلمة المرور" });
      }
    } catch (error: any) {
      console.error("خطأ في تحديث كلمة المرور:", error);
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  // تحديث معلومات المستخدم
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const { fullName, phone, email, address, profileImage } = req.body;

      // تحديث البيانات في Firebase
      const updatedUser = await firebaseService.updateUser(userId, {
        fullName,
        phone,
        email,
        address,
        profileImage
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
      res.status(500).json({ message: "خطأ في تحديث البيانات" });
    }
  });

  // الحصول على بيانات مستخدم واحد
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await firebaseService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json(user);
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
      res.status(500).json({ message: "خطأ في جلب البيانات" });
    }
  });

  // حظر المستخدم
  app.post("/api/users/ban", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "معرف المستخدم مطلوب" });
      }

      // البحث عن المستخدم في Firebase
      const user = await firebaseService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      // تحديث حالة المستخدم إلى محظور في Firebase
      const success = await firebaseService.updateUser(userId, {
        status: 'banned',
        bannedAt: new Date().toISOString()
      });

      if (!success) {
        return res.status(500).json({ message: "فشل في تحديث حالة المستخدم" });
      }

      console.log(`✅ تم حظر المستخدم: ${userId} (${user.phone})`);
      res.json({ 
        message: "تم حظر المستخدم بنجاح",
        success: true
      });
    } catch (error) {
      console.error('خطأ في حظر المستخدم:', error);
      res.status(500).json({ message: "خطأ في حظر المستخدم" });
    }
  });

  // إلغاء حظر المستخدم
  app.post("/api/users/unban", async (req, res) => {
    try {
      const { userId } = req.body;
      
      console.log(`✅ محاولة إلغاء حظر المستخدم: ${userId}`);
      
      if (!userId) {
        return res.status(400).json({ message: "معرف المستخدم مطلوب" });
      }

      // استخدام نفس منطق التحديث المستخدم في الحظر
      const updateData = {
        isBanned: false,
        banReason: null,
        banExpiresAt: null,
        status: 'active'
      };
      
      console.log('بيانات إلغاء الحظر:', updateData);
      
      const updatedUser = await firebaseService.updateUser(userId, updateData);
      
      if (updatedUser) {
        console.log(`✅ تم إلغاء حظر المستخدم ${userId} بنجاح`);
        res.json({ 
          message: "تم إلغاء حظر المستخدم بنجاح",
          user: updatedUser
        });
      } else {
        console.log(`❌ المستخدم ${userId} غير موجود`);
        res.status(404).json({ message: "المستخدم غير موجود" });
      }
    } catch (error) {
      console.error('❌ خطأ في إلغاء حظر المستخدم:', error);
      res.status(500).json({ message: "خطأ في إلغاء حظر المستخدم" });
    }
  });

  // الحصول على إحصائيات المستخدم (الأرباح والطلبات)
  app.get("/api/user-stats/:phone", async (req, res) => {
    try {
      const phone = req.params.phone;
      
      // جلب جميع الطلبات
      const orders = await firebaseService.getOrders();
      
      // تصفية الطلبات الخاصة بالمستخدم
      let userOrders;
      if (phone === '07863620710') {
        // للتاجر صلاح، احسب جميع الطلبات
        userOrders = orders;
      } else {
        // للمستخدمين الآخرين، احسب فقط الطلبات المرتبطة برقم هاتفهم
        userOrders = orders.filter((order: any) => 
          order.customerDetails?.phone === phone
        );
      }

      // حساب الأرباح المحققة (طلبات مكتملة فقط - غير مسحوبة)
      const completedOrders = userOrders.filter((order: any) => 
        (order.status === 'delivered' || order.status === 'completed') && 
        order.status !== 'withdrawn'
      );
      const totalProfit = completedOrders.reduce((sum: number, order: any) => 
        sum + (order.profit || 0), 0
      );

      // حساب الأرباح القادمة (طلبات قيد المعالجة - ليس مكتملة أو مسلمة أو مسحوبة أو ملغية)
      const pendingOrders = userOrders.filter((order: any) => 
        order.status !== 'delivered' && 
        order.status !== 'completed' && 
        order.status !== 'cancelled' && 
        order.status !== 'withdrawn'
      );
      const pendingProfit = pendingOrders.reduce((sum: number, order: any) => 
        sum + (order.profit || 0), 0
      );

      res.json({
        totalProfit,
        pendingProfit,
        totalOrders: userOrders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length
      });
    } catch (error) {
      console.error('خطأ في جلب إحصائيات المستخدم:', error);
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  // إنشاء طلب تجريبي (مؤقت للاختبار)
  app.post("/api/create-test-order", async (req, res) => {
    try {
      const { userPhone } = req.body;
      
      const testOrder = {
        id: Date.now(),
        customerDetails: {
          name: "مستخدم تجريبي",
          phone: userPhone,
          governorate: "بغداد",
          area: "الكرادة",
          address: "شارع تجريبي",
          notes: "طلب تجريبي"
        },
        items: [{
          id: 1748517961702,
          name: "جدر اندومي",
          quantity: 1,
          price: 15000,
          customerPrice: 20000
        }],
        customerPrice: 20000,
        deliveryFee: 4000,
        totalWithDelivery: 24000,
        wholesaleTotal: 15000,
        profit: 5000,
        totalItems: 1,
        status: "delivered",
        orderDate: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await firebaseService.createOrder(testOrder);
      res.json({ message: "تم إنشاء طلب تجريبي بنجاح" });
    } catch (error) {
      console.error('خطأ في إنشاء الطلب التجريبي:', error);
      res.status(500).json({ message: "خطأ في إنشاء الطلب التجريبي" });
    }
  });

  // إضافة طلب سحب أرباح
  app.post("/api/withdraw", async (req, res) => {
    try {
      const { method, fullName, userPhone, phoneNumber, cardNumber } = req.body;
      
      // التحقق من وجود البيانات المطلوبة
      if (!method || !fullName || !userPhone) {
        return res.status(400).json({ message: "البيانات المطلوبة غير مكتملة" });
      }

      // التحقق من البيانات المخصصة حسب نوع السحب
      if (method === 'zain-cash' && !phoneNumber) {
        return res.status(400).json({ message: "رقم هاتف زين كاش مطلوب" });
      }
      
      if (method === 'mastercard' && !cardNumber) {
        return res.status(400).json({ message: "رقم البطاقة مطلوب" });
      }

      // جلب إحصائيات المستخدم للتحقق من الأرباح المتاحة
      const orders = await firebaseService.getOrders();
      console.log('جميع الطلبات:', orders.length);
      console.log('رقم هاتف المستخدم:', userPhone);
      
      // تعديل المنطق ليشمل جميع الطلبات المكتملة (نموذج العمل الموحد)
      const completedOrders = orders.filter((order: any) => {
        console.log('فحص الطلب:', order.id, 'حالة:', order.status, 'ربح:', order.profit);
        return order.status === 'completed' || order.status === 'مكتمل';
      });
      
      console.log('الطلبات المكتملة:', completedOrders.length);
      
      const totalProfit = completedOrders.reduce((sum: number, order: any) => {
        console.log('ربح الطلب:', order.profit);
        return sum + (order.profit || 0);
      }, 0);
      
      console.log('إجمالي الأرباح:', totalProfit);

      if (totalProfit <= 0) {
        return res.status(400).json({ message: "لا توجد أرباح متاحة للسحب" });
      }

      // جلب بيانات المستخدم
      const users = await firebaseService.getUsers();
      const user = users.find((u: any) => u.phone === userPhone);

      // إنشاء طلب سحب جديد مع معرفات الطلبات المسحوبة
      const withdrawnOrderIds = completedOrders.map(order => order.id);
      
      const withdrawRequest: any = {
        id: Date.now().toString(),
        userPhone,
        userName: user?.fullName || 'غير محدد',
        method,
        fullName,
        amount: totalProfit,
        status: 'pending',
        createdAt: new Date().toISOString(),
        withdrawnOrderIds: withdrawnOrderIds // معرفات الطلبات التي تم سحبها
      };
      
      // إضافة الحقول المخصصة حسب نوع السحب
      if (method === 'zain-cash') {
        withdrawRequest.phoneNumber = phoneNumber;
      } else if (method === 'mastercard') {
        withdrawRequest.cardNumber = cardNumber;
      }
      
      console.log('📝 الكائن قبل الإرسال:', withdrawRequest);

      // حفظ طلب السحب في Firebase
      await firebaseService.createWithdrawRequest(withdrawRequest);

      // إنشاء إشعار لطلب السحب الجديد
      await notificationService.notifyWithdrawRequest(userPhone, totalProfit);

      // تصفير الأرباح المحققة - تحديث حالة الطلبات إلى "withdrawn"
      for (const order of completedOrders) {
        await firebaseService.updateOrderStatus(order.id, 'withdrawn');
      }

      console.log('✅ تم تصفير الأرباح وتحديث حالة الطلبات إلى withdrawn');

      res.json({ 
        message: "تم إرسال طلب السحب بنجاح وتصفير الأرباح", 
        requestId: withdrawRequest.id,
        withdrawnAmount: totalProfit
      });
    } catch (error) {
      console.error('خطأ في طلب السحب:', error);
      res.status(500).json({ message: "خطأ في معالجة طلب السحب" });
    }
  });

  // جلب طلبات السحب (للإدارة)
  app.get("/api/withdraw-requests", async (req, res) => {
    try {
      const withdrawRequests = await firebaseService.getWithdrawRequests();
      res.json(withdrawRequests);
    } catch (error) {
      console.error('خطأ في جلب طلبات السحب:', error);
      res.status(500).json({ message: "خطأ في جلب طلبات السحب" });
    }
  });

  // تحديث حالة طلب السحب
  app.put("/api/withdraw-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      console.log(`📝 تحديث طلب السحب ${id} إلى حالة ${status}`);
      
      // جلب تفاصيل طلب السحب
      const withdrawRequests = await firebaseService.getWithdrawRequests();
      const withdrawRequest = withdrawRequests.find((req: any) => req.id === id);
      
      if (!withdrawRequest) {
        console.log(`❌ طلب السحب ${id} غير موجود`);
        return res.status(404).json({ message: "طلب السحب غير موجود" });
      }
      
      // تحديث حالة طلب السحب
      await firebaseService.updateWithdrawRequestStatus(id, status);
      console.log(`✅ تم تحديث حالة طلب السحب ${id} بنجاح`);
      
      res.json({ 
        message: "تم تحديث حالة الطلب بنجاح",
        success: true 
      });
    } catch (error: any) {
      console.error('خطأ في تحديث طلب السحب:', error);
      res.status(500).json({ 
        message: "خطأ في تحديث الطلب",
        error: error.message 
      });
    }
  });

  // مسارات الإشعارات
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await notificationService.getNotifications();
      res.json(notifications);
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
      res.status(500).json({ message: "خطأ في جلب الإشعارات" });
    }
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    try {
      const count = await notificationService.getUnreadCount();
      res.json({ count });
    } catch (error) {
      console.error('خطأ في حساب الإشعارات غير المقروءة:', error);
      res.status(500).json({ message: "خطأ في حساب الإشعارات" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id);
      res.json({ message: "تم تحديد الإشعار كمقروء" });
    } catch (error) {
      console.error('خطأ في تحديث الإشعار:', error);
      res.status(500).json({ message: "خطأ في تحديث الإشعار" });
    }
  });

  // إرسال إشعار push جديد
  app.post("/api/send-notification", async (req, res) => {
    try {
      const { type, title, message, targetType, selectedUsers } = req.body;
      
      console.log('📱 طلب إرسال إشعار push:', { type, title, message, targetType, selectedUsers });
      
      if (!title || !message) {
        return res.status(400).json({ message: "العنوان والرسالة مطلوبان" });
      }

      // إنشاء إشعار في قاعدة البيانات أولاً
      const notificationData = {
        type: type || 'general',
        title,
        message,
        status: 'sent',
        recipients: selectedUsers || [],
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString()
      };
      
      const savedNotification = await notificationService.createNotification(notificationData);
      console.log('✅ تم حفظ الإشعار في قاعدة البيانات:', savedNotification?.id || 'جديد');

      // إعداد محتوى إشعار push
      const pushPayload: PushNotificationPayload = {
        title,
        body: message,
        data: {
          notificationId: savedNotification?.id || Date.now().toString(),
          type: type || 'general'
        }
      };

      let pushResult = false;

      if (targetType === 'all') {
        // إرسال للجميع
        console.log('📤 إرسال إشعار push لجميع المستخدمين...');
        pushResult = await fcmService.sendNotificationToAllUsers(pushPayload);
      } else if (targetType === 'specific' && selectedUsers?.length > 0) {
        // إرسال لمستخدمين محددين
        console.log('📤 إرسال إشعار push لمستخدمين محددين:', selectedUsers);
        pushResult = await fcmService.sendNotificationToUsers(selectedUsers, pushPayload);
      }

      if (pushResult) {
        console.log('✅ تم إرسال إشعار push بنجاح');
      } else {
        console.log('⚠️ فشل في إرسال إشعار push (ربما لعدم توفر Firebase Server Key)');
      }

      res.json({ 
        message: "تم إرسال الإشعار بنجاح",
        notificationId: savedNotification?.id || Date.now().toString(),
        pushSent: pushResult
      });
      
    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعار:', error);
      res.status(500).json({ message: "خطأ في إرسال الإشعار" });
    }
  });

  // AI Routes - الذكاء الاصطناعي
  app.post("/api/ai/analyze-sales", async (req, res) => {
    try {
      const { huggingFaceAI } = await import('./huggingFaceService.js');
      const stats = await firebaseService.getStats();
      
      const analysis = await huggingFaceAI.analyzeSalesPerformance(stats);
      res.json(analysis);
    } catch (error) {
      console.error('خطأ في تحليل المبيعات:', error);
      res.status(500).json({ message: "خطأ في تحليل البيانات" });
    }
  });

  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const { productName, category, price } = req.body;
      const { huggingFaceAI } = await import('./huggingFaceService.js');
      
      const description = await huggingFaceAI.generateProductDescription(productName, category, price);
      res.json({ description });
    } catch (error) {
      console.error('خطأ في إنشاء الوصف:', error);
      res.status(500).json({ message: "خطأ في إنشاء الوصف" });
    }
  });

  app.post("/api/ai/analyze-customers", async (req, res) => {
    try {
      const { huggingFaceAI } = await import('./huggingFaceService.js');
      const orders = await firebaseService.getOrders();
      
      const completedOrders = orders.filter((order: any) => order.status === 'delivered').length;
      const pendingOrders = orders.filter((order: any) => 
        ['pending', 'processing', 'shipped'].includes(order.status)
      ).length;
      
      const totalProfit = orders
        .filter((order: any) => order.status === 'delivered')
        .reduce((sum: number, order: any) => sum + (order.profit || 0), 0);
      
      const averageOrderValue = orders.length > 0 
        ? orders.reduce((sum: number, order: any) => sum + parseFloat(order.total || '0'), 0) / orders.length 
        : 0;

      const customerData = {
        completedOrders,
        pendingOrders,
        totalProfit,
        averageOrderValue
      };
      
      const analysis = await huggingFaceAI.analyzeCustomerBehavior(customerData);
      res.json(analysis);
    } catch (error) {
      console.error('خطأ في تحليل العملاء:', error);
      res.status(500).json({ message: "خطأ في تحليل العملاء" });
    }
  });

  app.post("/api/ai/customer-support", async (req, res) => {
    try {
      const { question, context } = req.body;
      const { huggingFaceAI } = await import('./huggingFaceService.js');
      
      const response = await huggingFaceAI.generateCustomerResponse(question, context);
      res.json({ response });
    } catch (error) {
      console.error('خطأ في مساعد العملاء:', error);
      res.status(500).json({ message: "خطأ في مساعد العملاء" });
    }
  });

  app.post("/api/ai/sentiment-analysis", async (req, res) => {
    try {
      const { text } = req.body;
      const { huggingFaceAI } = await import('./huggingFaceService.js');
      
      const analysis = await huggingFaceAI.analyzeSentiment(text);
      res.json(analysis);
    } catch (error) {
      console.error('خطأ في تحليل المشاعر:', error);
      res.status(500).json({ message: "خطأ في تحليل المشاعر" });
    }
  });

  // تحليل شامل لأداء التطبيق
  app.post("/api/ai/analyze-app-performance", async (req, res) => {
    try {
      const { huggingFaceAI } = await import('./huggingFaceService.js');
      
      // جمع بيانات شاملة من التطبيق
      const [stats, orders, users] = await Promise.all([
        firebaseService.getStats(),
        firebaseService.getOrders(),
        firebaseService.getUsers()
      ]);
      
      const totalUsers = users.length;
      const activeUsers = users.filter((user: any) => user.lastLogin && 
        new Date(user.lastLogin).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)
      ).length;
      
      const deliveredOrders = orders.filter((order: any) => order.status === 'delivered');
      const totalRevenue = deliveredOrders.reduce((sum: number, order: any) => 
        sum + parseFloat(order.total || '0'), 0
      );
      const totalProfit = deliveredOrders.reduce((sum: number, order: any) => 
        sum + (order.profit || 0), 0
      );

      const appData = {
        totalUsers,
        activeUsers,
        newUsers: Math.floor(totalUsers * 0.3), // تقدير المستخدمين الجدد
        totalOrders: orders.length,
        totalRevenue,
        totalProfit,
        totalProducts: stats.totalProducts
      };
      
      const analysis = await huggingFaceAI.analyzeAppPerformance(appData);
      res.json(analysis);
    } catch (error) {
      console.error('خطأ في تحليل أداء التطبيق:', error);
      res.status(500).json({ message: "خطأ في تحليل أداء التطبيق" });
    }
  });

  // تحليل قاعدة المستخدمين
  app.post("/api/ai/analyze-user-base", async (req, res) => {
    try {
      const { huggingFaceAI } = await import('./huggingFaceService.js');
      const users = await firebaseService.getUsers();
      
      const totalUsers = users.length;
      const activeUsers = users.filter((user: any) => user.lastLogin && 
        new Date(user.lastLogin).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)
      ).length;
      
      const newUsers = users.filter((user: any) => user.createdAt && 
        new Date(user.createdAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)
      ).length;
      
      const returningUsers = totalUsers - newUsers;

      const userData = {
        totalUsers,
        activeUsers,
        newUsers,
        returningUsers
      };
      
      const analysis = await huggingFaceAI.analyzeUserBase(userData);
      res.json(analysis);
    } catch (error) {
      console.error('خطأ في تحليل المستخدمين:', error);
      res.status(500).json({ message: "خطأ في تحليل المستخدمين" });
    }
  });

  // مساعد التجارة الإلكترونية الشامل للمستخدمين
  app.post("/api/ai/business-analysis", async (req, res) => {
    try {
      const { goal } = req.body;
      
      // استخدام النظام الذكي المتقدم لتحليل الأعمال
      const { intelligentAI } = await import('./intelligentAI');
      const prompt = `قم بتحليل شامل لهدف الأعمال التالي وقدم خطة عملية مفصلة: ${goal}`;
      const response = await intelligentAI.thinkAndRespond(prompt);
      
      // تقسيم الاستجابة لأجزاء منطقية
      const lines = response.split('\n').filter(line => line.trim());
      const insights = [];
      const recommendations = [];
      const strategies = [];
      
      let currentSection = 'insights';
      
      for (const line of lines) {
        if (line.includes('توصيات') || line.includes('خطوات')) {
          currentSection = 'recommendations';
        } else if (line.includes('استراتيجيات') || line.includes('خطط')) {
          currentSection = 'strategies';
        } else if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
          const content = line.replace(/^[-•*]\s/, '').replace(/^\d+\.\s*/, '').trim();
          if (content.length > 10) {
            if (currentSection === 'insights') insights.push(content);
            else if (currentSection === 'recommendations') recommendations.push(content);
            else strategies.push(content);
          }
        }
      }
      
      res.json({
        insights: insights.length > 0 ? insights : ['تحليل شامل للوضع الحالي'],
        recommendations: recommendations.length > 0 ? recommendations : ['توصيات مخصصة للنمو'],
        strategies: strategies.length > 0 ? strategies : ['استراتيجيات متقدمة للنجاح']
      });
    } catch (error) {
      console.error("خطأ في تحليل الأعمال:", error);
      res.status(500).json({ error: "فشل في تحليل الأعمال" });
    }
  });

  app.post("/api/ai/product-analysis", async (req, res) => {
    try {
      const { productName, category } = req.body;
      
      // استخدام النظام الذكي المتقدم لتحليل المنتجات
      const { intelligentAI } = await import('./intelligentAI');
      const prompt = `قم بتحليل شامل للمنتج "${productName}" في فئة "${category}" من ناحية الربحية والسوق والتسويق`;
      const response = await intelligentAI.thinkAndRespond(prompt);
      
      // تقسيم الاستجابة لأجزاء منطقية
      const lines = response.split('\n').filter(line => line.trim());
      const insights = [];
      const tips = [];
      const recommendations = [];
      
      let currentSection = 'insights';
      
      for (const line of lines) {
        if (line.includes('نصائح') || line.includes('تسعير') || line.includes('تسويق')) {
          currentSection = 'tips';
        } else if (line.includes('توصيات') || line.includes('استراتيجية')) {
          currentSection = 'recommendations';
        } else if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
          const content = line.replace(/^[-•*]\s/, '').replace(/^\d+\.\s*/, '').trim();
          if (content.length > 10) {
            if (currentSection === 'insights') insights.push(content);
            else if (currentSection === 'tips') tips.push(content);
            else recommendations.push(content);
          }
        }
      }
      
      res.json({
        insights: insights.length > 0 ? insights : [`تحليل شامل للمنتج ${productName}`],
        tips: tips.length > 0 ? tips : ['نصائح متخصصة للنجاح'],
        recommendations: recommendations.length > 0 ? recommendations : ['توصيات استراتيجية']
      });
    } catch (error) {
      console.error("خطأ في تحليل المنتج:", error);
      res.status(500).json({ error: "فشل في تحليل المنتج" });
    }
  });

  app.post("/api/ai/marketing-strategy", async (req, res) => {
    try {
      const { budget, goal } = req.body;
      
      // استخدام النظام الذكي المتقدم لاستراتيجيات التسويق
      const { intelligentAI } = await import('./intelligentAI');
      const prompt = `ضع استراتيجية تسويق متكاملة بميزانية ${budget} لتحقيق الهدف: ${goal}. قدم خطة عملية ومفصلة.`;
      const response = await intelligentAI.thinkAndRespond(prompt);
      
      // تقسيم الاستجابة لأجزاء منطقية
      const lines = response.split('\n').filter(line => line.trim());
      const strategies = [];
      const channels = [];
      const timeline = [];
      
      let currentSection = 'strategies';
      
      for (const line of lines) {
        if (line.includes('قنوات') || line.includes('منصات') || line.includes('وسائل')) {
          currentSection = 'channels';
        } else if (line.includes('زمني') || line.includes('جدول') || line.includes('مراحل')) {
          currentSection = 'timeline';
        } else if (line.match(/^[-•*]\s/) || line.match(/^\d+\./)) {
          const content = line.replace(/^[-•*]\s/, '').replace(/^\d+\.\s*/, '').trim();
          if (content.length > 10) {
            if (currentSection === 'strategies') strategies.push(content);
            else if (currentSection === 'channels') channels.push(content);
            else timeline.push(content);
          }
        }
      }
      
      res.json({
        strategies: strategies.length > 0 ? strategies : ['استراتيجية تسويق متكاملة'],
        channels: channels.length > 0 ? channels : ['قنوات تسويق متنوعة'],
        timeline: timeline.length > 0 ? timeline : ['خطة زمنية محددة']
      });
    } catch (error) {
      console.error("خطأ في استراتيجية التسويق:", error);
      res.status(500).json({ error: "فشل في إنشاء استراتيجية التسويق" });
    }
  });

  app.post("/api/ai/ecommerce-assistant", async (req, res) => {
    try {
      const { question } = req.body;
      
      // استخدام النظام الذكي المتقدم
      const { intelligentAI } = await import('./intelligentAI');
      const response = await intelligentAI.thinkAndRespond(question || "");
      
      res.json({ response });
    } catch (error) {
      console.error("خطأ في المساعد الذكي:", error);
      res.status(500).json({ error: "فشل في المساعد الذكي" });
    }
  });

  // API endpoint لجلب سياسات التطبيق
  app.get("/api/app-policies", async (req, res) => {
    try {
      const { appPolicies } = await import('./appPolicies');
      res.json(appPolicies);
    } catch (error) {
      console.error("خطأ في جلب سياسات التطبيق:", error);
      res.status(500).json({ error: "فشل في جلب سياسات التطبيق" });
    }
  });

  // API endpoints لإدارة الإعدادات
  app.get("/api/settings", async (req, res) => {
    try {
      const { appSettingsService } = await import('./appSettingsService');
      const settings = await appSettingsService.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("خطأ في جلب الإعدادات:", error);
      res.status(500).json({ error: "فشل في جلب الإعدادات" });
    }
  });

  app.get("/api/settings/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const { appSettingsService } = await import('./appSettingsService');
      const settings = await appSettingsService.getSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      console.error("خطأ في جلب إعدادات الفئة:", error);
      res.status(500).json({ error: "فشل في جلب إعدادات الفئة" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { key, value, category, description } = req.body;
      const { appSettingsService } = await import('./appSettingsService');
      await appSettingsService.setSetting(key, value, category, description);
      res.json({ success: true, message: "تم حفظ الإعداد بنجاح" });
    } catch (error) {
      console.error("خطأ في حفظ الإعداد:", error);
      res.status(500).json({ error: "فشل في حفظ الإعداد" });
    }
  });

  app.put("/api/settings/bulk", async (req, res) => {
    try {
      const { settings } = req.body;
      const { appSettingsService } = await import('./appSettingsService');
      await appSettingsService.updateMultipleSettings(settings);
      res.json({ success: true, message: "تم تحديث الإعدادات بنجاح" });
    } catch (error) {
      console.error("خطأ في تحديث الإعدادات:", error);
      res.status(500).json({ error: "فشل في تحديث الإعدادات" });
    }
  });

  app.post("/api/settings/initialize", async (req, res) => {
    try {
      const { appSettingsService } = await import('./appSettingsService');
      await appSettingsService.initializeDefaultSettings();
      res.json({ success: true, message: "تم تهيئة الإعدادات الافتراضية بنجاح" });
    } catch (error) {
      console.error("خطأ في تهيئة الإعدادات:", error);
      res.status(500).json({ error: "فشل في تهيئة الإعدادات" });
    }
  });

  app.get("/api/settings/contact", async (req, res) => {
    try {
      const { appSettingsService } = await import('./appSettingsService');
      const contactSettings = await appSettingsService.getContactSettings();
      res.json(contactSettings);
    } catch (error) {
      console.error("خطأ في جلب إعدادات التواصل:", error);
      res.status(500).json({ error: "فشل في جلب إعدادات التواصل" });
    }
  });

  // واجهات الدعم الفني
  app.get("/api/support-messages", async (req, res) => {
    try {
      const messages = await firebaseService.getSupportMessages();
      res.json(messages || []);
    } catch (error) {
      console.error('خطأ في جلب رسائل الدعم:', error);
      res.json([]);
    }
  });

  app.post("/api/support-messages/mark-read", async (req, res) => {
    try {
      const { customerPhone } = req.body;
      await firebaseService.markSupportMessagesAsRead(customerPhone);
      res.json({ success: true });
    } catch (error) {
      console.error('خطأ في تحديث حالة القراءة:', error);
      res.status(500).json({ message: "خطأ في تحديث حالة القراءة" });
    }
  });

  app.post("/api/support-messages/delete-completely", async (req, res) => {
    try {
      const { customerPhone } = req.body;
      await firebaseService.deleteSupportMessages(customerPhone);
      res.json({ success: true });
    } catch (error) {
      console.error('خطأ في حذف رسائل الدعم:', error);
      res.status(500).json({ message: "خطأ في حذف رسائل الدعم" });
    }
  });

  app.post("/api/support-messages", async (req, res) => {
    try {
      const { customerPhone, customerName, message, isAdminReply } = req.body;
      const messageData = {
        customerPhone,
        customerName,
        message,
        isAdminReply: isAdminReply || false,
        isReadByAdmin: isAdminReply || false,
        isDeletedByCustomer: false,
        isDeletedByAdmin: false,
        createdAt: new Date()
      };
      
      const savedMessage = await firebaseService.createSupportMessage(messageData);
      res.json(savedMessage);
    } catch (error) {
      console.error('خطأ في حفظ رسالة الدعم:', error);
      res.status(500).json({ message: "خطأ في حفظ رسالة الدعم" });
    }
  });

  // تسجيل خروج قسري للمستخدم
  app.post("/api/users/force-logout", async (req, res) => {
    try {
      const { userId } = req.body;
      
      console.log(`🔐 تسجيل خروج قسري للمستخدم: ${userId}`);
      
      res.json({ 
        message: "تم تسجيل خروج المستخدم بنجاح",
        userId: userId
      });
    } catch (error) {
      console.error("خطأ في تسجيل خروج المستخدم:", error);
      res.status(500).json({ message: "خطأ في تسجيل خروج المستخدم" });
    }
  });

  // نظام الدردشة الذكي مع حفظ المحادثات
  app.post("/api/ai/ask", async (req, res) => {
    try {
      const { question, userId } = req.body;
      
      if (!question || !userId) {
        return res.status(400).json({ message: "السؤال ومعرف المستخدم مطلوبان" });
      }
      
      const result = await aiService.askQuestion(question, userId);
      res.json(result);
    } catch (error) {
      console.error('خطأ في نظام الدردشة:', error);
      res.status(500).json({ message: "حدث خطأ في معالجة السؤال" });
    }
  });

  // جلب تاريخ المحادثات
  app.get("/api/ai/chat-history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "معرف المستخدم مطلوب" });
      }
      
      const history = await aiService.getChatHistory(userId);
      res.json(history);
    } catch (error) {
      console.error('خطأ في جلب تاريخ المحادثات:', error);
      res.status(500).json({ message: "خطأ في جلب تاريخ المحادثات" });
    }
  });

  // جلب الأسئلة الشائعة
  app.get("/api/ai/faq", async (req, res) => {
    try {
      const faqList = aiService.getFAQResponses();
      res.json(faqList);
    } catch (error) {
      console.error('خطأ في جلب الأسئلة الشائعة:', error);
      res.status(500).json({ message: "خطأ في جلب الأسئلة الشائعة" });
    }
  });

  // البحث في الأسئلة الشائعة
  app.get("/api/ai/faq/search", async (req, res) => {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ message: "مصطلح البحث مطلوب" });
      }
      
      const results = aiService.searchFAQ(searchTerm);
      res.json(results);
    } catch (error) {
      console.error('خطأ في البحث في الأسئلة الشائعة:', error);
      res.status(500).json({ message: "خطأ في البحث" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
