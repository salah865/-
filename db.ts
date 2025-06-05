import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { 
  users, categories, products, customers, orders, orderItems,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Product, type InsertProduct, type ProductWithCategory,
  type Customer, type InsertCustomer,
  type Order, type InsertOrder, type OrderWithCustomer,
  type OrderItem, type InsertOrderItem, type OrderWithItems
} from "@shared/schema";
import { eq, desc } from 'drizzle-orm';
import type { IStorage } from './storage';

// تم إلغاء الاتصال بقاعدة البيانات القديمة - نستخدم Firebase الآن
const DATABASE_URL = process.env.DATABASE_URL;

// لا نحتاج لقاعدة بيانات SQL مع Firebase
const sql = null;
const db = null;

export class DatabaseStorage implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    // Firebase يتولى الآن إدارة المستخدمين
    throw new Error('استخدم Firebase بدلاً من قاعدة البيانات القديمة');
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(desc(categories.createdAt));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  // Products
  async getProducts(): Promise<ProductWithCategory[]> {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        sku: products.sku,
        categoryId: products.categoryId,
        imageUrl: products.imageUrl,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt));

    return result.map(row => ({
      ...row,
      category: row.category && row.category.id ? row.category : undefined
    }));
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        sku: products.sku,
        categoryId: products.categoryId,
        imageUrl: products.imageUrl,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row,
      category: row.category.id ? row.category : undefined
    };
  }

  async getProductsByCategoryId(categoryId: number): Promise<ProductWithCategory[]> {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        sku: products.sku,
        categoryId: products.categoryId,
        imageUrl: products.imageUrl,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.categoryId, categoryId))
      .orderBy(desc(products.createdAt));

    return result.map(row => ({
      ...row,
      category: row.category.id ? row.category : undefined
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set({ ...product, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async updateProductStock(id: number, stock: number): Promise<Product | undefined> {
    return this.updateProduct(id, { stock });
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(customer).returning();
    return result[0];
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return result[0];
  }

  // Orders
  async getOrders(): Promise<OrderWithCustomer[]> {
    const result = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          address: customers.address,
          createdAt: customers.createdAt,
        }
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(orders.createdAt));

    return result.map(row => ({
      ...row,
      customer: row.customer.id ? row.customer : undefined
    }));
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    // Get order with customer
    const orderResult = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          address: customers.address,
          createdAt: customers.createdAt,
        }
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (orderResult.length === 0) return undefined;

    const order = orderResult[0];

    // Get order items with products
    const itemsResult = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          stock: products.stock,
          sku: products.sku,
          categoryId: products.categoryId,
          imageUrl: products.imageUrl,
          status: products.status,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        }
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    const items = itemsResult.map(row => ({
      ...row,
      product: row.product.id ? row.product : undefined
    }));

    return {
      ...order,
      customer: order.customer.id ? order.customer : undefined,
      items
    };
  }

  async getOrdersByCustomerId(customerId: number): Promise<OrderWithCustomer[]> {
    const result = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          address: customers.address,
          createdAt: customers.createdAt,
        }
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));

    return result.map(row => ({
      ...row,
      customer: row.customer.id ? row.customer : undefined
    }));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const result = await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(orderItem).returning();
    return result[0];
  }

  // Analytics
  async getStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: OrderWithCustomer[];
  }> {
    // Get total sales
    const salesResult = await db
      .select()
      .from(orders);
    
    const totalSales = salesResult.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalOrders = salesResult.length;

    // Get total products
    const productsResult = await db.select().from(products);
    const totalProducts = productsResult.length;

    // Get total customers
    const customersResult = await db.select().from(customers);
    const totalCustomers = customersResult.length;

    // Get recent orders
    const recentOrdersResult = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          address: customers.address,
          createdAt: customers.createdAt,
        }
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(orders.createdAt))
      .limit(5);

    const recentOrders = recentOrdersResult.map(row => ({
      ...row,
      customer: row.customer.id ? row.customer : undefined
    }));

    return {
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders
    };
  }
}

export const dbStorage = new DatabaseStorage();