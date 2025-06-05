import fs from 'fs';
import path from 'path';
import { IStorage } from './storage.js';
import {
  User, InsertUser, Category, InsertCategory, Product, InsertProduct,
  ProductWithCategory, Customer, InsertCustomer, Order, InsertOrder,
  OrderWithCustomer, OrderWithItems, OrderItem, InsertOrderItem
} from '../shared/schema.js';

export class PermanentStorage implements IStorage {
  private dataDir: string;
  private usersFile: string;
  private categoriesFile: string;
  private productsFile: string;
  private customersFile: string;
  private ordersFile: string;
  private orderItemsFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'permanent_data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.categoriesFile = path.join(this.dataDir, 'categories.json');
    this.productsFile = path.join(this.dataDir, 'products.json');
    this.customersFile = path.join(this.dataDir, 'customers.json');
    this.ordersFile = path.join(this.dataDir, 'orders.json');
    this.orderItemsFile = path.join(this.dataDir, 'orderItems.json');

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log('✅ تم إنشاء مجلد البيانات الدائمة');
    }

    // تهيئة البيانات الأولية
    this.initializeData();
  }

  private async initializeData() {
    // إنشاء مستخدم الإدارة إذا لم يكن موجوداً
    const users = await this.getUsers();
    if (users.length === 0) {
      await this.createUser({
        phone: '07801258110',
        email: 'ggkipogo@gmail.com',
        password: 'salah5',
        role: 'admin',
        fullName: 'المدير العام',
        address: 'المملكة العربية السعودية'
      });
      console.log('✅ تم إنشاء حساب المدير في النظام الدائم');
    }

    // إنشاء الفئات الأساسية إذا لم تكن موجودة
    const categories = await this.getCategories();
    if (categories.length === 0) {
      await this.createCategory({ name: 'إلكترونيات', description: 'أجهزة إلكترونية ومعدات تقنية' });
      await this.createCategory({ name: 'ملابس', description: 'ملابس رجالية ونسائية' });
      await this.createCategory({ name: 'كتب', description: 'كتب ومراجع متنوعة' });
      console.log('✅ تم إنشاء الفئات الأساسية في النظام الدائم');
    }
  }

  private readJsonFile<T>(filePath: string, defaultValue: T[] = []): T[] {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.map((item: any) => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
        }));
      }
    } catch (error) {
      console.log(`خطأ في قراءة الملف ${filePath}:`, error);
    }
    return defaultValue;
  }

  private writeJsonFile<T>(filePath: string, data: T[]): void {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.log(`خطأ في كتابة الملف ${filePath}:`, error);
    }
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.readJsonFile<User>(this.usersFile);
  }

  async getUser(id: number): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(user => user.id === id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const users = await this.getUsers();
    // البحث برقم الهاتف أولاً
    let user = users.find(u => u.phone === phone);
    if (!user) {
      // البحث بالبريد الإلكتروني كبديل
      user = users.find(u => u.email === phone);
    }
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      id: this.generateId(),
      phone: user.phone,
      email: user.email || null,
      password: user.password,
      role: user.role || 'customer',
      fullName: user.fullName || null,
      address: user.address || null,
      createdAt: new Date()
    };
    
    users.push(newUser);
    this.writeJsonFile(this.usersFile, users);
    console.log('✅ تم حفظ مستخدم جديد بشكل دائم:', newUser.fullName || newUser.phone);
    return newUser;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.readJsonFile<Category>(this.categoriesFile);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find(cat => cat.id === id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const categories = await this.getCategories();
    const newCategory: Category = {
      id: this.generateId(),
      name: category.name,
      description: category.description || null,
      createdAt: new Date()
    };
    
    categories.push(newCategory);
    this.writeJsonFile(this.categoriesFile, categories);
    console.log('✅ تم حفظ فئة جديدة بشكل دائم:', newCategory.name);
    return newCategory;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const categories = await this.getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) return undefined;
    
    categories[index] = { ...categories[index], ...categoryData };
    this.writeJsonFile(this.categoriesFile, categories);
    console.log('✅ تم تحديث الفئة بشكل دائم:', categories[index].name);
    return categories[index];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const categories = await this.getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) return false;
    
    categories.splice(index, 1);
    this.writeJsonFile(this.categoriesFile, categories);
    console.log('✅ تم حذف الفئة بشكل دائم');
    return true;
  }

  // Products
  async getProducts(): Promise<ProductWithCategory[]> {
    const products = this.readJsonFile<Product>(this.productsFile);
    const categories = await this.getCategories();
    
    return products.map(product => ({
      ...product,
      category: categories.find(cat => cat.id === product.categoryId)
    }));
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    const products = await this.getProducts();
    return products.find(product => product.id === id);
  }

  async getProductsByCategoryId(categoryId: number): Promise<ProductWithCategory[]> {
    const products = await this.getProducts();
    return products.filter(product => product.categoryId === categoryId);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const products = this.readJsonFile<Product>(this.productsFile);
    const newProduct: Product = {
      id: this.generateId(),
      name: product.name,
      description: product.description || null,
      price: typeof product.price === 'string' ? product.price : product.price?.toString() || '0',
      minPrice: product.minPrice?.toString() || null,
      maxPrice: product.maxPrice?.toString() || null,
      stock: product.stock || 0,
      sku: product.sku,
      categoryId: product.categoryId || null,
      status: product.status || 'active',
      imageUrl: product.imageUrl || null,
      colors: product.colors || null,
      orderCount: 0, // عدد الطلبات الأولي
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    products.push(newProduct);
    this.writeJsonFile(this.productsFile, products);
    console.log('✅ تم حفظ منتج جديد بشكل دائم:', newProduct.name);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const products = this.readJsonFile<Product>(this.productsFile);
    const index = products.findIndex(product => product.id === id);
    if (index === -1) return undefined;
    
    const updateData = { ...productData };
    if (updateData.price !== undefined) {
      updateData.price = typeof updateData.price === 'string' ? updateData.price : updateData.price?.toString() || '0';
    }
    
    products[index] = { 
      ...products[index], 
      ...updateData,
      updatedAt: new Date()
    };
    this.writeJsonFile(this.productsFile, products);
    console.log('✅ تم تحديث المنتج بشكل دائم:', products[index].name);
    return products[index];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const products = this.readJsonFile<Product>(this.productsFile);
    const index = products.findIndex(product => product.id === id);
    if (index === -1) return false;
    
    products.splice(index, 1);
    this.writeJsonFile(this.productsFile, products);
    console.log('✅ تم حذف المنتج بشكل دائم');
    return true;
  }

  async updateProductStock(id: number, stock: number): Promise<Product | undefined> {
    return this.updateProduct(id, { stock });
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.readJsonFile<Customer>(this.customersFile);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const customers = await this.getCustomers();
    return customers.find(customer => customer.id === id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const customers = await this.getCustomers();
    const newCustomer: Customer = {
      id: this.generateId(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone || null,
      address: customer.address || null,
      createdAt: new Date()
    };
    
    customers.push(newCustomer);
    this.writeJsonFile(this.customersFile, customers);
    console.log('✅ تم حفظ عميل جديد بشكل دائم:', newCustomer.name);
    return newCustomer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customers = await this.getCustomers();
    const index = customers.findIndex(customer => customer.id === id);
    if (index === -1) return undefined;
    
    customers[index] = { ...customers[index], ...customerData };
    this.writeJsonFile(this.customersFile, customers);
    console.log('✅ تم تحديث العميل بشكل دائم:', customers[index].name);
    return customers[index];
  }

  // Orders
  async getOrders(): Promise<OrderWithCustomer[]> {
    const orders = this.readJsonFile<Order>(this.ordersFile);
    const customers = await this.getCustomers();
    
    return orders.map(order => ({
      ...order,
      customer: customers.find(customer => customer.id === order.customerId)
    }));
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const orders = this.readJsonFile<Order>(this.ordersFile);
    const order = orders.find(o => o.id === id);
    if (!order) return undefined;
    
    const customers = await this.getCustomers();
    const orderItems = this.readJsonFile<OrderItem>(this.orderItemsFile);
    const products = await this.getProducts();
    
    const items = orderItems
      .filter(item => item.orderId === id)
      .map(item => ({
        ...item,
        product: products.find(product => product.id === item.productId)
      }));
    
    return {
      ...order,
      customer: customers.find(customer => customer.id === order.customerId),
      items
    };
  }

  async getOrdersByCustomerId(customerId: number): Promise<OrderWithCustomer[]> {
    const orders = await this.getOrders();
    return orders.filter(order => order.customerId === customerId);
  }

  async createOrder(order: any): Promise<any> {
    const orders = this.readJsonFile<any>(this.ordersFile);
    const newOrder = {
      id: this.generateId(),
      customerId: order.customerId || null,
      total: order.total || '0',
      status: order.status || 'pending',
      customerDetails: order.customerDetails || {},
      items: order.items || [],
      customerPrice: order.customerPrice || 0,
      deliveryFee: order.deliveryFee || 0,
      totalWithDelivery: order.totalWithDelivery || 0,
      wholesaleTotal: order.wholesaleTotal || 0,
      profit: order.profit || 0,
      totalItems: order.totalItems || 0,
      orderDate: order.orderDate || new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    orders.push(newOrder);
    this.writeJsonFile(this.ordersFile, orders);
    
    // تحديث عدد الطلبات للمنتجات
    if (order.items && Array.isArray(order.items)) {
      await this.updateProductOrderCounts(order.items);
      
      // حفظ في Firebase أيضاً
      try {
        const { firebaseService } = await import('./firebaseService.js');
        await firebaseService.updateProductOrderCounts?.(order.items);
        console.log('✅ تم حفظ بيانات عدد الطلبات في Firebase');
      } catch (error) {
        console.log('⚠️ تعذر الحفظ في Firebase:', error);
      }
    }
    
    console.log('✅ تم حفظ طلب جديد بشكل دائم:', newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const orders = this.readJsonFile<Order>(this.ordersFile);
    const index = orders.findIndex(order => order.id === id);
    if (index === -1) return undefined;
    
    orders[index] = { 
      ...orders[index], 
      status,
      updatedAt: new Date()
    };
    this.writeJsonFile(this.ordersFile, orders);
    console.log('✅ تم تحديث حالة الطلب بشكل دائم');
    return orders[index];
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const orderItems = this.readJsonFile<OrderItem>(this.orderItemsFile);
    const newOrderItem: OrderItem = {
      id: this.generateId(),
      orderId: orderItem.orderId || null,
      productId: orderItem.productId || null,
      quantity: orderItem.quantity || 0,
      price: orderItem.price || '0'
    };
    
    orderItems.push(newOrderItem);
    this.writeJsonFile(this.orderItemsFile, orderItems);
    console.log('✅ تم حفظ عنصر طلب جديد بشكل دائم');
    return newOrderItem;
  }

  // Analytics
  async getStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: OrderWithCustomer[];
  }> {
    const [orders, products, customers] = await Promise.all([
      this.getOrders(),
      this.getProducts(),
      this.getCustomers()
    ]);

    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
    const recentOrders = orders.slice(-5).reverse();

    return {
      totalSales,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      recentOrders
    };
  }

  // Cart functions
  async getCartItems(): Promise<any[]> {
    const cartFile = path.join(this.dataDir, 'cart.json');
    const cartItems = this.readJsonFile(cartFile, []);
    
    // ربط كل عنصر في السلة بتفاصيل المنتج
    const products = await this.getProducts();
    return cartItems.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product
      };
    });
  }

  async addToCart(productId: number, quantity: number): Promise<any> {
    const cartFile = path.join(this.dataDir, 'cart.json');
    const cartItems = this.readJsonFile(cartFile, []);
    
    const existingItem = cartItems.find((item: any) => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({
        id: this.generateId(),
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }
    
    this.writeJsonFile(cartFile, cartItems);
    
    // إرجاع العنصر مع تفاصيل المنتج
    const product = await this.getProduct(productId);
    return {
      productId,
      quantity: existingItem ? existingItem.quantity : quantity,
      product
    };
  }

  async removeFromCart(productId: number): Promise<boolean> {
    const cartFile = path.join(this.dataDir, 'cart.json');
    const cartItems = this.readJsonFile(cartFile, []);
    
    const filteredItems = cartItems.filter((item: any) => item.productId !== productId);
    this.writeJsonFile(cartFile, filteredItems);
    
    return true;
  }

  async updateCartQuantity(productId: number, quantity: number): Promise<any> {
    const cartFile = path.join(this.dataDir, 'cart.json');
    const cartItems = this.readJsonFile(cartFile, []);
    
    const item = cartItems.find((item: any) => item.productId === productId);
    if (item) {
      item.quantity = quantity;
      this.writeJsonFile(cartFile, cartItems);
      
      const product = await this.getProduct(productId);
      return {
        productId,
        quantity,
        product
      };
    }
    
    return null;
  }

  // Saved Products functions
  async getSavedProducts(): Promise<any[]> {
    const savedFile = path.join(this.dataDir, 'saved.json');
    const savedItems = this.readJsonFile(savedFile, []);
    
    // ربط كل منتج محفوظ بتفاصيله
    const products = await this.getProducts();
    return savedItems.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product
      };
    });
  }

  async addToSavedProducts(productId: number): Promise<any> {
    const savedFile = path.join(this.dataDir, 'saved.json');
    const savedItems = this.readJsonFile(savedFile, []);
    
    // التحقق من عدم وجود المنتج مسبقاً
    const existingItem = savedItems.find((item: any) => item.productId === productId);
    if (existingItem) {
      return existingItem;
    }
    
    const newSavedItem = {
      id: this.generateId(),
      productId,
      savedAt: new Date().toISOString()
    };
    
    savedItems.push(newSavedItem);
    this.writeJsonFile(savedFile, savedItems);
    
    // إرجاع العنصر مع تفاصيل المنتج
    const products = await this.getProducts();
    const product = products.find(p => p.id === productId);
    return {
      ...newSavedItem,
      product
    };
  }

  async removeFromSavedProducts(productId: number): Promise<boolean> {
    const savedFile = path.join(this.dataDir, 'saved.json');
    const savedItems = this.readJsonFile(savedFile, []);
    
    const initialLength = savedItems.length;
    const filteredItems = savedItems.filter((item: any) => item.productId !== productId);
    
    if (filteredItems.length < initialLength) {
      this.writeJsonFile(savedFile, filteredItems);
      return true;
    }
    return false;
  }

  // ==================== PRODUCT ORDER COUNT METHODS ====================
  
  async updateProductOrderCounts(orderItems: any[]): Promise<void> {
    const products = this.readJsonFile<any>(this.productsFile);
    
    // تحديث عدد الطلبات لكل منتج
    for (const item of orderItems) {
      const productIndex = products.findIndex((p: any) => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].orderCount = (products[productIndex].orderCount || 0) + item.quantity;
        console.log(`✅ تم تحديث عدد طلبات المنتج ${products[productIndex].name} إلى ${products[productIndex].orderCount}`);
      }
    }
    
    this.writeJsonFile(this.productsFile, products);
  }

  // ==================== BANNERS METHODS ====================
  
  async getBanners(): Promise<any[]> {
    const bannersFile = path.join(this.dataDir, 'banners.json');
    return this.readJsonFile(bannersFile, []);
  }

  async createBanner(banner: any): Promise<any> {
    const bannersFile = path.join(this.dataDir, 'banners.json');
    const banners = this.readJsonFile(bannersFile, []);
    
    const newBanner = {
      id: this.generateId(),
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      isActive: banner.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    banners.push(newBanner);
    this.writeJsonFile(bannersFile, banners);
    
    return newBanner;
  }

  async updateBanner(id: number, bannerData: any): Promise<any> {
    const bannersFile = path.join(this.dataDir, 'banners.json');
    const banners = this.readJsonFile(bannersFile, []);
    
    const bannerIndex = banners.findIndex((banner: any) => banner.id === id);
    if (bannerIndex === -1) {
      return null;
    }
    
    banners[bannerIndex] = {
      ...banners[bannerIndex],
      ...bannerData,
      updatedAt: new Date().toISOString()
    };
    
    this.writeJsonFile(bannersFile, banners);
    return banners[bannerIndex];
  }

  async deleteBanner(id: number): Promise<boolean> {
    const bannersFile = path.join(this.dataDir, 'banners.json');
    const banners = this.readJsonFile(bannersFile, []);
    
    const initialLength = banners.length;
    const filteredBanners = banners.filter((banner: any) => banner.id !== id);
    
    if (filteredBanners.length < initialLength) {
      this.writeJsonFile(bannersFile, filteredBanners);
      return true;
    }
    return false;
  }
}

export const permanentStorage = new PermanentStorage();