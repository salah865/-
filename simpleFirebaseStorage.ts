import { IStorage } from './storage.js';
import {
  User, InsertUser, Category, InsertCategory, Product, InsertProduct,
  ProductWithCategory, Customer, InsertCustomer, Order, InsertOrder,
  OrderWithCustomer, OrderWithItems, OrderItem, InsertOrderItem
} from '../shared/schema.js';

// تطبيق مبسط لـ Firebase مع بيانات أساسية
export class SimpleFirebaseStorage implements IStorage {
  private users: User[] = [
    {
      id: 1,
      email: 'ggkipogo@gmail.com',
      password: 'salah5',
      phone: '+966500000001',
      role: 'admin',
      fullName: 'المدير العام',
      address: 'المملكة العربية السعودية',
      createdAt: new Date()
    }
  ];

  private categories: Category[] = [
    { id: 1, name: 'إلكترونيات', description: 'أجهزة إلكترونية ومعدات تقنية', createdAt: new Date() },
    { id: 2, name: 'ملابس', description: 'ملابس رجالية ونسائية', createdAt: new Date() },
    { id: 3, name: 'كتب', description: 'كتب ومراجع متنوعة', createdAt: new Date() }
  ];

  private products: Product[] = [
    {
      id: 1,
      name: 'هاتف ذكي سامسونج',
      description: 'هاتف ذكي متطور',
      price: '2500',
      stock: 15,
      sku: 'PHONE001',
      categoryId: 1,
      status: 'active',
      imageUrl: null,
      minPrice: null,
      maxPrice: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: 'لابتوب ديل',
      description: 'جهاز لابتوب عالي الأداء',
      price: '4200',
      stock: 8,
      sku: 'LAPTOP001',
      categoryId: 1,
      status: 'active',
      imageUrl: null,
      minPrice: null,
      maxPrice: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private customers: Customer[] = [];
  private orders: Order[] = [];
  private orderItems: OrderItem[] = [];

  // Users
  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return this.users.find(u => u.phone === phone);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.users.length + 1,
      ...user,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.find(c => c.id === id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = {
      id: this.categories.length + 1,
      ...category,
      description: category.description || null,
      createdAt: new Date()
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    this.categories[index] = { ...this.categories[index], ...categoryData };
    return this.categories[index];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.categories.splice(index, 1);
    return true;
  }

  // Products
  async getProducts(): Promise<ProductWithCategory[]> {
    return this.products.map(product => ({
      ...product,
      category: this.categories.find(c => c.id === product.categoryId)
    }));
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    const product = this.products.find(p => p.id === id);
    if (!product) return undefined;
    
    return {
      ...product,
      category: this.categories.find(c => c.id === product.categoryId)
    };
  }

  async getProductsByCategoryId(categoryId: number): Promise<ProductWithCategory[]> {
    const products = this.products.filter(p => p.categoryId === categoryId);
    return products.map(product => ({
      ...product,
      category: this.categories.find(c => c.id === categoryId)
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: this.products.length + 1,
      ...product,
      status: product.status || 'active',
      description: product.description || null,
      minPrice: product.minPrice?.toString() || null,
      maxPrice: product.maxPrice?.toString() || null,
      imageUrl: product.imageUrl || null,
      categoryId: product.categoryId || null,
      price: product.price?.toString() || '0',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.products[index] = { 
      ...this.products[index], 
      ...productData,
      price: productData.price?.toString() || this.products[index].price,
      updatedAt: new Date()
    };
    return this.products[index];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    return true;
  }

  async updateProductStock(id: number, stock: number): Promise<Product | undefined> {
    return this.updateProduct(id, { stock });
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.customers;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.find(c => c.id === id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const newCustomer: Customer = {
      id: this.customers.length + 1,
      ...customer,
      phone: customer.phone || null,
      address: customer.address || null,
      createdAt: new Date()
    };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    this.customers[index] = { ...this.customers[index], ...customerData };
    return this.customers[index];
  }

  // Orders
  async getOrders(): Promise<OrderWithCustomer[]> {
    return this.orders.map(order => ({
      ...order,
      customer: this.customers.find(c => c.id === order.customerId)
    }));
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.find(o => o.id === id);
    if (!order) return undefined;
    
    const items = this.orderItems
      .filter(item => item.orderId === id)
      .map(item => ({
        ...item,
        product: this.products.find(p => p.id === item.productId)
      }));
    
    return {
      ...order,
      customer: this.customers.find(c => c.id === order.customerId),
      items
    };
  }

  async getOrdersByCustomerId(customerId: number): Promise<OrderWithCustomer[]> {
    const orders = this.orders.filter(o => o.customerId === customerId);
    return orders.map(order => ({
      ...order,
      customer: this.customers.find(c => c.id === customerId)
    }));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder: Order = {
      id: this.orders.length + 1,
      ...order,
      status: order.status || 'pending',
      customerId: order.customerId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    
    this.orders[index] = { 
      ...this.orders[index], 
      status,
      updatedAt: new Date()
    };
    return this.orders[index];
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const newOrderItem: OrderItem = {
      id: this.orderItems.length + 1,
      ...orderItem,
      orderId: orderItem.orderId || null,
      productId: orderItem.productId || null
    };
    this.orderItems.push(newOrderItem);
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
    const totalSales = this.orders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
    const recentOrders = (await this.getOrders()).slice(0, 5);

    return {
      totalSales,
      totalOrders: this.orders.length,
      totalProducts: this.products.length,
      totalCustomers: this.customers.length,
      recentOrders
    };
  }
}

export const simpleFirebaseStorage = new SimpleFirebaseStorage();