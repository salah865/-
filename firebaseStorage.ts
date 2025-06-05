import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
// import { db } from '../client/src/firebase.js'; // تم تعطيل Firebase مؤقتاً
import { IStorage } from './storage.js';
import {
  User,
  InsertUser,
  Category,
  InsertCategory,
  Product,
  InsertProduct,
  ProductWithCategory,
  Customer,
  InsertCustomer,
  Order,
  InsertOrder,
  OrderWithCustomer,
  OrderWithItems,
  OrderItem,
  InsertOrderItem
} from '../shared/schema.js';

export class FirebaseStorage implements IStorage {
  
  // Users
  async getUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: data.userId || (index + 1),
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt) || new Date()
      } as User;
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const userRef = doc(db, 'users', id.toString());
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) return undefined;
    return {
      id: parseInt(snapshot.id),
      ...snapshot.data()
    } as User;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const docData = snapshot.docs[0].data();
    return {
      id: docData.userId || 1,
      ...docData,
      createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date()
    } as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const usersRef = collection(db, 'users');
    const docRef = await addDoc(usersRef, {
      ...user,
      createdAt: serverTimestamp()
    });
    return {
      id: parseInt(docRef.id),
      ...user,
      createdAt: new Date()
    } as User;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as Category));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const categoryRef = doc(db, 'categories', id.toString());
    const snapshot = await getDoc(categoryRef);
    if (!snapshot.exists()) return undefined;
    return {
      id: parseInt(snapshot.id),
      ...snapshot.data()
    } as Category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const categoriesRef = collection(db, 'categories');
    const docRef = await addDoc(categoriesRef, {
      ...category,
      createdAt: serverTimestamp()
    });
    return {
      id: parseInt(docRef.id),
      ...category,
      createdAt: new Date()
    } as Category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const categoryRef = doc(db, 'categories', id.toString());
    await updateDoc(categoryRef, {
      ...categoryData,
      updatedAt: serverTimestamp()
    });
    return this.getCategory(id);
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const categoryRef = doc(db, 'categories', id.toString());
      await deleteDoc(categoryRef);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  // Products
  async getProducts(): Promise<ProductWithCategory[]> {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    const products = await Promise.all(
      snapshot.docs.map(async (productDoc) => {
        const productData = productDoc.data();
        const product = {
          id: parseInt(productDoc.id),
          ...productData
        } as Product;

        let category = undefined;
        if (productData.categoryId) {
          category = await this.getCategory(productData.categoryId);
        }

        return {
          ...product,
          category
        } as ProductWithCategory;
      })
    );
    return products;
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    const productRef = doc(db, 'products', id.toString());
    const snapshot = await getDoc(productRef);
    if (!snapshot.exists()) return undefined;
    
    const productData = snapshot.data();
    const product = {
      id: parseInt(snapshot.id),
      ...productData
    } as Product;

    let category = undefined;
    if (productData.categoryId) {
      category = await this.getCategory(productData.categoryId);
    }

    return {
      ...product,
      category
    } as ProductWithCategory;
  }

  async getProductsByCategoryId(categoryId: number): Promise<ProductWithCategory[]> {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('categoryId', '==', categoryId));
    const snapshot = await getDocs(q);
    
    const products = await Promise.all(
      snapshot.docs.map(async (productDoc) => {
        const productData = productDoc.data();
        const product = {
          id: parseInt(productDoc.id),
          ...productData
        } as Product;

        const category = await this.getCategory(categoryId);

        return {
          ...product,
          category
        } as ProductWithCategory;
      })
    );
    return products;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return {
      id: parseInt(docRef.id),
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: product.status || 'active',
      description: product.description || null,
      minPrice: product.minPrice || null,
      maxPrice: product.maxPrice || null,
      imageUrl: product.imageUrl || null
    } as Product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const productRef = doc(db, 'products', id.toString());
    await updateDoc(productRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
    const product = await this.getProduct(id);
    return product ? {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      status: product.status,
      sku: product.sku,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      updatedAt: new Date()
    } as Product : undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const productRef = doc(db, 'products', id.toString());
      await deleteDoc(productRef);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async updateProductStock(id: number, stock: number): Promise<Product | undefined> {
    return this.updateProduct(id, { stock });
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const customersRef = collection(db, 'customers');
    const snapshot = await getDocs(customersRef);
    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as Customer));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const customerRef = doc(db, 'customers', id.toString());
    const snapshot = await getDoc(customerRef);
    if (!snapshot.exists()) return undefined;
    return {
      id: parseInt(snapshot.id),
      ...snapshot.data()
    } as Customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const customersRef = collection(db, 'customers');
    const docRef = await addDoc(customersRef, {
      ...customer,
      createdAt: serverTimestamp()
    });
    return {
      id: parseInt(docRef.id),
      ...customer,
      createdAt: new Date()
    } as Customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customerRef = doc(db, 'customers', id.toString());
    await updateDoc(customerRef, {
      ...customerData,
      updatedAt: serverTimestamp()
    });
    return this.getCustomer(id);
  }

  // Orders
  async getOrders(): Promise<OrderWithCustomer[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const orders = await Promise.all(
      snapshot.docs.map(async (orderDoc) => {
        const orderData = orderDoc.data();
        const order = {
          id: parseInt(orderDoc.id),
          ...orderData
        } as Order;

        let customer = undefined;
        if (orderData.customerId) {
          customer = await this.getCustomer(orderData.customerId);
        }

        return {
          ...order,
          customer
        } as OrderWithCustomer;
      })
    );
    return orders;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const orderRef = doc(db, 'orders', id.toString());
    const snapshot = await getDoc(orderRef);
    if (!snapshot.exists()) return undefined;
    
    const orderData = snapshot.data();
    const order = {
      id: parseInt(snapshot.id),
      ...orderData
    } as Order;

    let customer = undefined;
    if (orderData.customerId) {
      customer = await this.getCustomer(orderData.customerId);
    }

    // Get order items
    const orderItemsRef = collection(db, 'orderItems');
    const q = query(orderItemsRef, where('orderId', '==', id));
    const itemsSnapshot = await getDocs(q);
    
    const items = await Promise.all(
      itemsSnapshot.docs.map(async (itemDoc) => {
        const itemData = itemDoc.data();
        const orderItem = {
          id: parseInt(itemDoc.id),
          ...itemData
        } as OrderItem;

        let product = undefined;
        if (itemData.productId) {
          const productWithCategory = await this.getProduct(itemData.productId);
          if (productWithCategory) {
            product = {
              id: productWithCategory.id,
              name: productWithCategory.name,
              description: productWithCategory.description,
              price: productWithCategory.price,
              stock: productWithCategory.stock,
              categoryId: productWithCategory.categoryId,
              imageUrl: productWithCategory.imageUrl,
              createdAt: productWithCategory.createdAt
            } as Product;
          }
        }

        return {
          ...orderItem,
          product
        };
      })
    );

    return {
      ...order,
      customer,
      items
    } as OrderWithItems;
  }

  async getOrdersByCustomerId(customerId: number): Promise<OrderWithCustomer[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const orders = await Promise.all(
      snapshot.docs.map(async (orderDoc) => {
        const orderData = orderDoc.data();
        const order = {
          id: parseInt(orderDoc.id),
          ...orderData
        } as Order;

        const customer = await this.getCustomer(customerId);

        return {
          ...order,
          customer
        } as OrderWithCustomer;
      })
    );
    return orders;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...order,
      createdAt: serverTimestamp()
    });
    return {
      id: parseInt(docRef.id),
      ...order,
      createdAt: new Date()
    } as Order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const orderRef = doc(db, 'orders', id.toString());
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
    const order = await this.getOrder(id);
    return order ? {
      id: order.id,
      customerId: order.customerId,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    } as Order : undefined;
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const orderItemsRef = collection(db, 'orderItems');
    const docRef = await addDoc(orderItemsRef, {
      ...orderItem,
      createdAt: serverTimestamp()
    });
    return {
      id: parseInt(docRef.id),
      ...orderItem,
      createdAt: new Date()
    } as OrderItem;
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
    const recentOrders = orders.slice(0, 5);

    return {
      totalSales,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      recentOrders
    };
  }
}

export const firebaseStorage = new FirebaseStorage();