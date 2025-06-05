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
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { IStorage } from './storage.js';
import {
  User, InsertUser, Category, InsertCategory, Product, InsertProduct,
  ProductWithCategory, Customer, InsertCustomer, Order, InsertOrder,
  OrderWithCustomer, OrderWithItems, OrderItem, InsertOrderItem
} from '../shared/schema.js';

export class PersistentFirebaseStorage implements IStorage {
  
  private generateId(): number {
    return Math.floor(Math.random() * 1000000) + Date.now();
  }

  // Users
  async getUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id || this.generateId(),
          phone: data.phone || null,
          email: data.email || null,
          password: data.password || '',
          role: data.role || 'customer',
          fullName: data.fullName || null,
          address: data.address || null,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        } as User;
      });
    } catch (error) {
      console.log('خطأ في جلب المستخدمين:', error);
      return [];
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return undefined;
      
      const data = snapshot.docs[0].data();
      return {
        id: data.id,
        phone: data.phone || null,
        email: data.email || null,
        password: data.password || '',
        role: data.role || 'customer',
        fullName: data.fullName || null,
        address: data.address || null,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      } as User;
    } catch (error) {
      console.log('خطأ في جلب المستخدم:', error);
      return undefined;
    }
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    try {
      console.log('البحث عن المستخدم برقم الهاتف:', phone);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('لم يوجد مستخدم برقم الهاتف:', phone);
        // البحث بالبريد الإلكتروني كبديل
        const emailQuery = query(usersRef, where('email', '==', phone));
        const emailSnapshot = await getDocs(emailQuery);
        
        if (emailSnapshot.empty) {
          console.log('لم يوجد مستخدم بالبريد الإلكتروني:', phone);
          return undefined;
        }
        
        const emailData = emailSnapshot.docs[0].data();
        console.log('تم العثور على المستخدم بالبريد الإلكتروني');
        return {
          id: emailData.id,
          phone: emailData.phone || null,
          email: emailData.email || null,
          password: emailData.password || '',
          role: emailData.role || 'customer',
          fullName: emailData.fullName || null,
          address: emailData.address || null,
          createdAt: emailData.createdAt?.toDate ? emailData.createdAt.toDate() : new Date()
        } as User;
      }
      
      const data = snapshot.docs[0].data();
      console.log('تم العثور على المستخدم برقم الهاتف');
      return {
        id: data.id,
        phone: data.phone || null,
        email: data.email || null,
        password: data.password || '',
        role: data.role || 'customer',
        fullName: data.fullName || null,
        address: data.address || null,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      } as User;
    } catch (error) {
      console.log('خطأ في البحث عن المستخدم:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const id = this.generateId();
      const newUser = {
        id,
        phone: user.phone,
        email: user.email || null,
        password: user.password,
        role: user.role || 'customer',
        fullName: user.fullName || null,
        address: user.address || null,
        createdAt: serverTimestamp()
      };

      const usersRef = collection(db, 'users');
      await addDoc(usersRef, newUser);
      
      console.log('✅ تم حفظ مستخدم جديد في Firebase:', user.fullName || user.phone);
      
      return {
        ...newUser,
        createdAt: new Date()
      } as User;
    } catch (error) {
      console.log('خطأ في إنشاء المستخدم:', error);
      throw error;
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id || this.generateId(),
          name: data.name,
          description: data.description || null,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        } as Category;
      });
    } catch (error) {
      console.log('خطأ في جلب الفئات:', error);
      return [];
    }
  }

  async getCategory(id: number): Promise<Category | undefined> {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return undefined;
      
      const data = snapshot.docs[0].data();
      return {
        id: data.id,
        name: data.name,
        description: data.description || null,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      } as Category;
    } catch (error) {
      console.log('خطأ في جلب الفئة:', error);
      return undefined;
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const id = this.generateId();
      const newCategory = {
        id,
        name: category.name,
        description: category.description || null,
        createdAt: serverTimestamp()
      };

      const categoriesRef = collection(db, 'categories');
      await addDoc(categoriesRef, newCategory);
      
      console.log('✅ تم حفظ فئة جديدة في Firebase:', category.name);
      
      return {
        ...newCategory,
        createdAt: new Date()
      } as Category;
    } catch (error) {
      console.log('خطأ في إنشاء الفئة:', error);
      throw error;
    }
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return undefined;
      
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...categoryData,
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data();
      
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description || null,
        createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      } as Category;
    } catch (error) {
      console.log('خطأ في تحديث الفئة:', error);
      return undefined;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return false;
      
      await deleteDoc(snapshot.docs[0].ref);
      console.log('✅ تم حذف الفئة من Firebase');
      return true;
    } catch (error) {
      console.log('خطأ في حذف الفئة:', error);
      return false;
    }
  }

  // Products
  async getProducts(): Promise<ProductWithCategory[]> {
    try {
      console.log('🔍 جلب جميع المنتجات من Firebase...');
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const categories = await this.getCategories();
      
      console.log(`📦 تم العثور على ${snapshot.docs.length} منتج في Firebase`);
      
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        const category = categories.find(c => c.id === data.categoryId);
        
        console.log(`✅ جلب منتج: ${data.name} (ID: ${data.id})`);
        
        return {
          id: data.id || this.generateId(),
          name: data.name,
          description: data.description || null,
          price: data.price?.toString() || '0',
          minPrice: data.minPrice?.toString() || null,
          maxPrice: data.maxPrice?.toString() || null,
          stock: data.stock || 0,
          sku: data.sku,
          categoryId: data.categoryId || null,
          status: data.status || 'active',
          imageUrl: data.imageUrl || null,
          additionalImages: data.additionalImages || [],
          colors: data.colors || [],
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          category
        } as ProductWithCategory;
      });
      
      console.log(`🎯 إرجاع ${products.length} منتج للواجهة`);
      return products;
    } catch (error) {
      console.log('خطأ في جلب المنتجات:', error);
      return [];
    }
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return undefined;
      
      const data = snapshot.docs[0].data();
      const category = data.categoryId ? await this.getCategory(data.categoryId) : undefined;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || null,
        price: data.price?.toString() || '0',
        minPrice: data.minPrice?.toString() || null,
        maxPrice: data.maxPrice?.toString() || null,
        stock: data.stock || 0,
        sku: data.sku,
        categoryId: data.categoryId || null,
        status: data.status || 'active',
        imageUrl: data.imageUrl || null,
        additionalImages: data.additionalImages || [],
        colors: data.colors || [],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        category
      } as ProductWithCategory;
    } catch (error) {
      console.log('خطأ في جلب المنتج:', error);
      return undefined;
    }
  }

  async getProductsByCategoryId(categoryId: number): Promise<ProductWithCategory[]> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('categoryId', '==', categoryId));
      const snapshot = await getDocs(q);
      const category = await this.getCategory(categoryId);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          name: data.name,
          description: data.description || null,
          price: data.price?.toString() || '0',
          minPrice: data.minPrice?.toString() || null,
          maxPrice: data.maxPrice?.toString() || null,
          stock: data.stock || 0,
          sku: data.sku,
          colors: data.colors || [],
          categoryId: data.categoryId || null,
          status: data.status || 'active',
          imageUrl: data.imageUrl || null,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          category
        } as ProductWithCategory;
      });
    } catch (error) {
      console.log('خطأ في جلب منتجات الفئة:', error);
      return [];
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      const id = this.generateId();
      const newProduct = {
        id,
        name: product.name,
        description: product.description || null,
        price: typeof product.price === 'string' ? product.price : product.price?.toString() || '0',
        minPrice: product.minPrice ? (typeof product.minPrice === 'string' ? product.minPrice : product.minPrice.toString()) : null,
        maxPrice: product.maxPrice ? (typeof product.maxPrice === 'string' ? product.maxPrice : product.maxPrice.toString()) : null,
        stock: product.stock || 0,
        sku: product.sku,
        categoryId: product.categoryId || null,
        status: product.status || 'active',
        imageUrl: product.imageUrl || null,
        additionalImages: (product as any).additionalImages || [],
        colors: (product as any).colors || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const productsRef = collection(db, 'products');
      await addDoc(productsRef, newProduct);
      
      console.log('✅ تم حفظ منتج جديد في Firebase:', product.name);
      
      return {
        ...newProduct,
        price: newProduct.price,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Product;
    } catch (error) {
      console.log('خطأ في إنشاء المنتج:', error);
      throw error;
    }
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return undefined;
      
      const updateData = {
        ...productData,
        updatedAt: serverTimestamp()
      };
      
      if (productData.price !== undefined) {
        updateData.price = productData.price?.toString() || '0';
      }
      
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data();
      
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description || null,
        price: data?.price?.toString() || '0',
        minPrice: data?.minPrice?.toString() || null,
        maxPrice: data?.maxPrice?.toString() || null,
        stock: data?.stock || 0,
        sku: data?.sku,
        categoryId: data?.categoryId || null,
        status: data?.status || 'active',
        imageUrl: data?.imageUrl || null,
        additionalImages: data?.additionalImages || [],
        createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
      } as Product;
    } catch (error) {
      console.log('خطأ في تحديث المنتج:', error);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return false;
      
      await deleteDoc(snapshot.docs[0].ref);
      console.log('✅ تم حذف المنتج من Firebase');
      return true;
    } catch (error) {
      console.log('خطأ في حذف المنتج:', error);
      return false;
    }
  }

  async updateProductStock(id: number, stock: number): Promise<Product | undefined> {
    return this.updateProduct(id, { stock });
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    try {
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id || this.generateId(),
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          address: data.address || null,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        } as Customer;
      });
    } catch (error) {
      console.log('خطأ في جلب العملاء:', error);
      return [];
    }
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    try {
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return undefined;
      
      const data = snapshot.docs[0].data();
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      } as Customer;
    } catch (error) {
      console.log('خطأ في جلب العميل:', error);
      return undefined;
    }
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    try {
      const id = this.generateId();
      const newCustomer = {
        id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || null,
        address: customer.address || null,
        createdAt: serverTimestamp()
      };

      const customersRef = collection(db, 'customers');
      await addDoc(customersRef, newCustomer);
      
      console.log('✅ تم حفظ عميل جديد في Firebase:', customer.name);
      
      return {
        ...newCustomer,
        createdAt: new Date()
      } as Customer;
    } catch (error) {
      console.log('خطأ في إنشاء العميل:', error);
      throw error;
    }
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    try {
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return undefined;
      
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...customerData,
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data();
      
      return {
        id: data?.id,
        name: data?.name,
        email: data?.email,
        phone: data?.phone || null,
        address: data?.address || null,
        createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      } as Customer;
    } catch (error) {
      console.log('خطأ في تحديث العميل:', error);
      return undefined;
    }
  }

  // Orders
  async getOrders(): Promise<OrderWithCustomer[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      const customers = await this.getCustomers();
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const customer = customers.find(c => c.id === data.customerId);
        
        return {
          id: data.id || this.generateId(),
          customerId: data.customerId || null,
          total: data.total || '0',
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          customer
        } as OrderWithCustomer;
      });
    } catch (error) {
      console.log('خطأ في جلب الطلبات:', error);
      return [];
    }
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return undefined;
      
      const data = snapshot.docs[0].data();
      const customer = data.customerId ? await this.getCustomer(data.customerId) : undefined;
      
      // Get order items
      const orderItemsRef = collection(db, 'orderItems');
      const itemsQuery = query(orderItemsRef, where('orderId', '==', id));
      const itemsSnapshot = await getDocs(itemsQuery);
      
      const items = await Promise.all(itemsSnapshot.docs.map(async (itemDoc) => {
        const itemData = itemDoc.data();
        const product = itemData.productId ? await this.getProduct(itemData.productId) : undefined;
        
        return {
          id: itemData.id,
          orderId: itemData.orderId || null,
          productId: itemData.productId || null,
          quantity: itemData.quantity || 0,
          price: itemData.price || '0',
          product
        };
      }));
      
      return {
        id: data.id,
        customerId: data.customerId || null,
        total: data.total || '0',
        status: data.status || 'pending',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        customer,
        items
      } as OrderWithItems;
    } catch (error) {
      console.log('خطأ في جلب الطلب:', error);
      return undefined;
    }
  }

  async getOrdersByCustomerId(customerId: number): Promise<OrderWithCustomer[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('customerId', '==', customerId));
      const snapshot = await getDocs(q);
      const customer = await this.getCustomer(customerId);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          customerId: data.customerId || null,
          total: data.total || '0',
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          customer
        } as OrderWithCustomer;
      });
    } catch (error) {
      console.log('خطأ في جلب طلبات العميل:', error);
      return [];
    }
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      const id = this.generateId();
      const newOrder = {
        id,
        customerId: order.customerId || null,
        total: order.total || '0',
        status: order.status || 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const ordersRef = collection(db, 'orders');
      await addDoc(ordersRef, newOrder);
      
      console.log('✅ تم حفظ طلب جديد في Firebase');
      
      return {
        ...newOrder,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Order;
    } catch (error) {
      console.log('خطأ في إنشاء الطلب:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return undefined;
      
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data();
      
      return {
        id: data?.id,
        customerId: data?.customerId || null,
        total: data?.total || '0',
        status: data?.status || 'pending',
        createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
      } as Order;
    } catch (error) {
      console.log('خطأ في تحديث حالة الطلب:', error);
      return undefined;
    }
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    try {
      const id = this.generateId();
      const newOrderItem = {
        id,
        orderId: orderItem.orderId || null,
        productId: orderItem.productId || null,
        quantity: orderItem.quantity || 0,
        price: orderItem.price || '0'
      };

      const orderItemsRef = collection(db, 'orderItems');
      await addDoc(orderItemsRef, newOrderItem);
      
      console.log('✅ تم حفظ عنصر طلب جديد في Firebase');
      
      return newOrderItem as OrderItem;
    } catch (error) {
      console.log('خطأ في إضافة عنصر الطلب:', error);
      throw error;
    }
  }

  // Analytics
  async getStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: OrderWithCustomer[];
  }> {
    try {
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
    } catch (error) {
      console.log('خطأ في جلب الإحصائيات:', error);
      return {
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        recentOrders: []
      };
    }
  }
}

export const persistentFirebaseStorage = new PersistentFirebaseStorage();