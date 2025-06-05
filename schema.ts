import { pgTable, text, serial, integer, boolean, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // admin أو customer
  email: text("email"),
  fullName: text("full_name"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  minPrice: decimal("min_price", { precision: 10, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  sku: text("sku").notNull().unique(),
  categoryId: integer("category_id").references(() => categories.id),
  imageUrl: text("image_url"),
  additionalImages: text("additional_images").array().default([]), // صور إضافية للمنتج
  colors: text("colors").array().default([]), // الألوان المتاحة
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull().default("0"), // تكلفة المنتجات
  profit: decimal("profit", { precision: 10, scale: 2 }).notNull().default("0"), // الربح المحقق
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  deliveryStatus: text("delivery_status").notNull().default("not_shipped"), // not_shipped, shipped, delivered, failed
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed
  notes: text("notes"), // ملاحظات إضافية
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull().default("0"), // تكلفة المنتج الواحد
});

// جدول صور البانر
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول المنتجات المحفوظة
export const savedProducts = pgTable("saved_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// إحصائيات المبيعات للمنتجات
export const productStats = pgTable("product_stats", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  totalSold: integer("total_sold").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// جدول عناصر السلة
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  selectedColor: text("selected_color"),
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول أكواد استعادة كلمة المرور
export const passwordResetCodes = pgTable("password_reset_codes", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول محاولات تسجيل الدخول
export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  attempts: integer("attempts").notNull().default(0),
  blockedUntil: timestamp("blocked_until"),
  lastAttempt: timestamp("last_attempt").defaultNow(),
});

// جدول إعدادات التطبيق
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull().default("general"), // general, contact, delivery, etc
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// نموذج تسجيل الدخول
export const loginSchema = z.object({
  phoneOrEmail: z.string().min(1, 'رقم الهاتف أو البريد الإلكتروني مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// نموذج التسجيل
export const registerSchema = z.object({
  phone: z.string()
    .length(11, 'رقم الهاتف يجب أن يكون 11 رقم')
    .refine((phone) => phone.startsWith('078') || phone.startsWith('077') || phone.startsWith('075'), {
      message: 'رقم الهاتف يجب أن يبدأ بـ 078 أو 077 أو 075'
    }),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أرقام أو أحرف أو أكثر'),
  fullName: z.string().min(1, 'الاسم الكامل مطلوب'),
  email: z.string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صحيح')
    .refine((email) => email.endsWith('@gmail.com'), {
      message: 'البريد الإلكتروني يجب أن ينتهي بـ @gmail.com'
    }),
  address: z.string().optional(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  categoryId: z.coerce.number(),
  price: z.coerce.number(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  stock: z.coerce.number(),
  colors: z.array(z.string()).optional().default([]),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
  createdAt: true,
});

export const insertSavedProductSchema = createInsertSchema(savedProducts).omit({
  id: true,
  createdAt: true,
});

export const insertProductStatsSchema = createInsertSchema(productStats).omit({
  id: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
}).extend({
  userId: z.coerce.number(),
  productId: z.coerce.number(),
  quantity: z.coerce.number().min(1),
  customPrice: z.coerce.number().optional(),
});

export const insertPasswordResetCodeSchema = createInsertSchema(passwordResetCodes).omit({
  id: true,
  createdAt: true,
});

export const insertLoginAttemptSchema = createInsertSchema(loginAttempts).omit({
  id: true,
  lastAttempt: true,
});

export const insertAppSettingSchema = createInsertSchema(appSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// مخططات استعادة كلمة المرور
export const forgotPasswordSchema = z.object({
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام'),
});

export const verifyResetCodeSchema = z.object({
  phone: z.string().min(10, 'رقم الهاتف مطلوب'),
  code: z.string().min(4, 'الكود يجب أن يكون على الأقل 4 أرقام'),
});

export const resetPasswordSchema = z.object({
  phone: z.string().min(10, 'رقم الهاتف مطلوب'),
  code: z.string().min(4, 'الكود مطلوب'),
  newPassword: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'),
  confirmPassword: z.string().min(6, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمة المرور وتأكيدها غير متطابقتين",
  path: ["confirmPassword"],
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;

export type SavedProduct = typeof savedProducts.$inferSelect;
export type InsertSavedProduct = z.infer<typeof insertSavedProductSchema>;

export type ProductStats = typeof productStats.$inferSelect;
export type InsertProductStats = z.infer<typeof insertProductStatsSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type PasswordResetCode = typeof passwordResetCodes.$inferSelect;
export type InsertPasswordResetCode = z.infer<typeof insertPasswordResetCodeSchema>;

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = z.infer<typeof insertLoginAttemptSchema>;

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = z.infer<typeof insertAppSettingSchema>;

// Extended types for joins
export type ProductWithCategory = Product & {
  category?: Category;
  stats?: ProductStats;
};

export type OrderWithCustomer = Order & {
  customer?: Customer;
};

export type OrderWithItems = Order & {
  customer?: Customer;
  items?: (OrderItem & { product?: Product })[];
};

// نوع البيانات لإحصائيات المستخدمين
export type UserWithStats = User & {
  totalProfit?: number;
  totalProductsSold?: number;
  totalOrders?: number;
  joinDate?: string;
};
