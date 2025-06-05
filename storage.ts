import fs from 'fs';
import path from 'path';
import { 
  users, categories, products, customers, orders, orderItems,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Product, type InsertProduct, type ProductWithCategory,
  type Customer, type InsertCustomer,
  type Order, type InsertOrder, type OrderWithCustomer,
  type OrderItem, type InsertOrderItem, type OrderWithItems
} from "@shared/schema";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Products
  getProducts(): Promise<ProductWithCategory[]>;
  getProduct(id: number): Promise<ProductWithCategory | undefined>;
  getProductsByCategoryId(categoryId: number): Promise<ProductWithCategory[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  updateProductStock(id: number, stock: number): Promise<Product | undefined>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;

  // Orders
  getOrders(): Promise<OrderWithCustomer[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  getOrdersByCustomerId(customerId: number): Promise<OrderWithCustomer[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Analytics
  getStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: OrderWithCustomer[];
  }>;

  // Cart functions
  getCartItems(): Promise<any[]>;
  addToCart(productId: number, quantity: number): Promise<any>;
  removeFromCart(productId: number): Promise<boolean>;
  updateCartQuantity(productId: number, quantity: number): Promise<any>;

  // Saved Products
  getSavedProducts(): Promise<any[]>;
  addToSavedProducts(productId: number): Promise<any>;
  removeFromSavedProducts(productId: number): Promise<boolean>;

  // Banners
  getBanners(): Promise<any[]>;
  createBanner(banner: any): Promise<any>;
  updateBanner(id: number, banner: any): Promise<any>;
  deleteBanner(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private customers: Map<number, Customer>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentCustomerId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private usersFilePath: string;

  // حفظ المستخدمين في ملف
  private saveUsersToFile() {
    try {
      const usersArray = Array.from(this.users.values()).map(user => ({
        ...user,
        createdAt: user.createdAt?.toISOString()
      }));
      fs.writeFileSync(this.usersFilePath, JSON.stringify(usersArray, null, 2));
    } catch (error) {
      console.log("خطأ في حفظ المستخدمين:", error);
    }
  }

  // استرجاع المستخدمين من الملف
  private loadStoredUsers() {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const data = fs.readFileSync(this.usersFilePath, 'utf8');
        const usersArray = JSON.parse(data);
        
        for (const userData of usersArray) {
          const user: User = {
            ...userData,
            createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date()
          };
          this.users.set(user.id, user);
        }
        
        console.log(`📚 تم استرجاع ${usersArray.length} مستخدم محفوظ`);
      }
    } catch (error) {
      console.log("خطأ في استرجاع المستخدمين:", error);
    }
  }

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentCustomerId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;

    // تحديد مسار ملف المستخدمين
    this.usersFilePath = path.join(process.cwd(), 'users-data.json');

    // استرجاع المستخدمين المحفوظين (إن وجدوا)
    this.loadStoredUsers();
    
    // إنشاء حساب الإدارة إذا لم يكن موجوداً
    if (!this.users.has(1)) {
      const adminUser: User = {
        id: 1,
        phone: "07801258110",
        email: "ggkipogo@gmail.com", 
        password: "salah5",
        role: "admin",
        fullName: "المدير",
        address: null,
        createdAt: new Date()
      };
      this.users.set(1, adminUser);
      
      console.log("✅ تم إنشاء حساب الإدارة:");
      console.log("🔹 الإيميل:", adminUser.email);
      console.log("🔹 كلمة المرور:", adminUser.password);
      console.log("🔹 الدور:", adminUser.role);
    }
    
    // تحديث currentUserId ليكون أكبر من أكبر ID موجود
    if (this.users.size > 0) {
      this.currentUserId = Math.max(...Array.from(this.users.keys())) + 1;
    } else {
      this.currentUserId = 2;
    }

    // Create sample categories
    this.createCategory({ name: "إلكترونيات", description: "أجهزة إلكترونية ومعدات تقنية" });
    this.createCategory({ name: "ملابس", description: "ملابس رجالية ونسائية" });
    this.createCategory({ name: "كتب", description: "كتب ومراجع متنوعة" });
    
    // مسح المنتجات القديمة
    this.products.clear();
    this.currentProductId = 1;
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "customer",
      email: insertUser.email || null,
      fullName: insertUser.fullName || null,
      address: insertUser.address || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    
    // حفظ المستخدمين الجدد في الملف
    this.saveUsersToFile();
    console.log(`✅ تم حفظ مستخدم جديد: ${user.fullName || user.phone}`);
    
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date()
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updated = { ...category, ...updateData };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Products
  async getProducts(): Promise<ProductWithCategory[]> {
    const products = Array.from(this.products.values());
    return products.map(product => ({
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) : undefined
    }));
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    return {
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) : undefined
    };
  }

  async getProductsByCategoryId(categoryId: number): Promise<ProductWithCategory[]> {
    const products = Array.from(this.products.values()).filter(p => p.categoryId === categoryId);
    return products.map(product => ({
      ...product,
      category: this.categories.get(categoryId)
    }));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updated = { 
      ...product, 
      ...updateData,
      updatedAt: new Date()
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async updateProductStock(id: number, stock: number): Promise<Product | undefined> {
    return this.updateProduct(id, { stock });
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updated = { ...customer, ...updateData };
    this.customers.set(id, updated);
    return updated;
  }

  // Orders
  async getOrders(): Promise<OrderWithCustomer[]> {
    const orders = Array.from(this.orders.values());
    return orders.map(order => ({
      ...order,
      customer: order.customerId ? this.customers.get(order.customerId) : undefined
    }));
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const orderItems = Array.from(this.orderItems.values()).filter(item => item.orderId === id);
    const items = orderItems.map(item => ({
      ...item,
      product: item.productId ? this.products.get(item.productId) : undefined
    }));
    
    return {
      ...order,
      customer: order.customerId ? this.customers.get(order.customerId) : undefined,
      items
    };
  }

  async getOrdersByCustomerId(customerId: number): Promise<OrderWithCustomer[]> {
    const orders = Array.from(this.orders.values()).filter(o => o.customerId === customerId);
    return orders.map(order => ({
      ...order,
      customer: this.customers.get(customerId)
    }));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updated = { 
      ...order, 
      status,
      updatedAt: new Date()
    };
    this.orders.set(id, updated);
    return updated;
  }

  async addOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Analytics
  async getStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: OrderWithCustomer[];
  }> {
    const orders = Array.from(this.orders.values());
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalOrders = orders.length;
    const totalProducts = this.products.size;
    const totalCustomers = this.customers.size;
    
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5)
      .map(order => ({
        ...order,
        customer: order.customerId ? this.customers.get(order.customerId) : undefined
      }));

    return {
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders
    };
  }

  // Cart functions - placeholder implementations
  async getCartItems(): Promise<any[]> {
    return [];
  }

  async addToCart(productId: number, quantity: number): Promise<any> {
    return { productId, quantity };
  }

  async removeFromCart(productId: number): Promise<boolean> {
    return true;
  }

  async updateCartQuantity(productId: number, quantity: number): Promise<any> {
    return { productId, quantity };
  }

  // Saved Products functions
  async getSavedProducts(): Promise<any[]> {
    return [];
  }

  async addToSavedProducts(productId: number): Promise<any> {
    return { productId, savedAt: new Date().toISOString() };
  }

  async removeFromSavedProducts(productId: number): Promise<boolean> {
    return true;
  }

  // Banners functions
  async getBanners(): Promise<any[]> {
    return [];
  }

  async createBanner(banner: any): Promise<any> {
    return { id: 1, ...banner, createdAt: new Date().toISOString() };
  }

  async updateBanner(id: number, banner: any): Promise<any> {
    return { id, ...banner, updatedAt: new Date().toISOString() };
  }

  async deleteBanner(id: number): Promise<boolean> {
    return true;
  }
}

import { firebaseService } from './firebaseService.js';

// Use Firebase for permanent data storage
export const storage = firebaseService;
