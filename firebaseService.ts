import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { IStorage } from './storage.js';
import {
  User, InsertUser, Category, InsertCategory, Product, InsertProduct,
  ProductWithCategory, Customer, InsertCustomer, Order, InsertOrder,
  OrderWithCustomer, OrderWithItems, OrderItem, InsertOrderItem
} from '../shared/schema.js';

export class FirebaseService implements IStorage {
  
  // Helper function to generate numeric IDs
  private generateId(): number {
    return Math.floor(Math.random() * 1000000) + Date.now();
  }

  // Users
  async getUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ 
      id: this.generateId(), 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as User));
  }

  async getUsersWithStats(): Promise<any[]> {
    console.log('📊 جلب المستخدمين مع الإحصائيات');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    
    const users = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // حساب إجمالي الأرباح والطلبات لكل مستخدم
      let totalProfit = 0;
      let totalOrders = 0;
      let totalProductsSold = 0;
      
      // إذا كان المستخدم هو صلاح (07863620710)، احسب جميع الطلبات له
      if (userData.phone === '07863620710') {
        for (const orderDoc of ordersSnapshot.docs) {
          const orderData = orderDoc.data();
          totalOrders++;
          if (orderData.profit) {
            totalProfit += parseFloat(orderData.profit) || 0;
          }
          if (orderData.items && Array.isArray(orderData.items)) {
            totalProductsSold += orderData.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          }
        }
      } else {
        // للمستخدمين الآخرين، احسب فقط الطلبات المرتبطة برقم هاتفهم
        for (const orderDoc of ordersSnapshot.docs) {
          const orderData = orderDoc.data();
          const customerPhone = orderData.customerDetails?.phone || orderData.customerPhone;
          if (customerPhone === userData.phone) {
            totalOrders++;
            if (orderData.profit) {
              totalProfit += parseFloat(orderData.profit) || 0;
            }
            if (orderData.items && Array.isArray(orderData.items)) {
              totalProductsSold += orderData.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
            }
          }
        }
      }
      
      const userId = userData.id || userData.userId || userDoc.id;
      users.push({
        id: userId,
        firebaseId: userDoc.id, // إضافة معرف Firebase الحقيقي
        fullName: userData.fullName || 'غير محدد',
        phone: userData.phone || 'غير محدد',
        email: userData.email || 'غير محدد',
        password: userData.password || 'غير محدد',
        role: userData.role || 'customer',
        joinDate: userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString('ar-SA') : 'غير محدد',
        totalProfit: totalProfit,
        totalOrders: totalOrders,
        totalProductsSold: totalProductsSold,
        createdAt: userData.createdAt ? new Date(userData.createdAt.seconds * 1000) : new Date(),
        status: userData.isBanned ? 'banned' : (userData.status || 'active'),
        isBanned: userData.isBanned || false,
        banReason: userData.banReason || null,
        banExpiresAt: userData.banExpiresAt || null
      });
    }
    
    console.log(`✅ تم جلب ${users.length} مستخدم مع الإحصائيات`);
    return users;
  }

  async updateUserRole(userId: string, newRole: string): Promise<boolean> {
    try {
      const usersRef = collection(db, 'users');
      
      // البحث بالمعرف النصي أولاً
      let q = query(usersRef, where('id', '==', userId));
      let snapshot = await getDocs(q);
      
      // إذا لم نجد، نبحث بالمعرف الرقمي
      if (snapshot.empty) {
        q = query(usersRef, where('id', '==', parseInt(userId)));
        snapshot = await getDocs(q);
      }
      
      // إذا لم نجد، نبحث في جميع المستندات
      if (snapshot.empty) {
        const allUsersSnapshot = await getDocs(usersRef);
        for (const doc of allUsersSnapshot.docs) {
          if (doc.id === userId || doc.data().id === userId) {
            await updateDoc(doc.ref, { role: newRole });
            console.log(`✅ تم تحديث دور المستخدم ${userId} إلى ${newRole}`);
            return true;
          }
        }
        console.log('❌ المستخدم غير موجود');
        return false;
      }
      
      const userDoc = snapshot.docs[0];
      await updateDoc(userDoc.ref, { role: newRole });
      
      console.log(`✅ تم تحديث دور المستخدم ${userId} إلى ${newRole}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في تحديث دور المستخدم:', error);
      return false;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('userId', '==', id));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { 
      id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as User;
  }

  async getUserById(userId: string): Promise<any | undefined> {
    try {
      console.log(`🔍 البحث عن المستخدم بالمعرف: ${userId}`);
      const usersRef = collection(db, 'users');
      
      // البحث في جميع المستندات مباشرة لتجنب أخطاء Firebase
      console.log('🔍 البحث في جميع المستندات...');
      const allUsersSnapshot = await getDocs(usersRef);
      console.log(`📊 إجمالي المستندات: ${allUsersSnapshot.docs.length}`);
      
      for (const doc of allUsersSnapshot.docs) {
        const data = doc.data();
        console.log(`🔍 فحص المستند: ${doc.id}, البيانات:`, {
          docId: doc.id,
          dataId: data.id,
          dataUserId: data.userId,
          phone: data.phone
        });
        
        // البحث بجميع أنواع المعرفات الممكنة
        if (doc.id === userId || 
            data.id === userId || 
            data.userId === userId || 
            String(data.userId) === String(userId) || 
            data.id === Number(userId) ||
            Number(data.id) === Number(userId)) {
          console.log('✅ عثرت على المستخدم في البحث الشامل!');
          return {
            id: data.id || data.userId || doc.id,
            docId: doc.id,
            ...data,
            createdAt: data.createdAt
          };
        }
      }
      
      console.log('❌ المستخدم غير موجود في البحث الشامل');
      return undefined;
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات المستخدم:', error);
      return undefined;
    }
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return { 
      id: data.id || data.userId || doc.id, // استخدم المعرف الأصلي
      ...data,
      createdAt: data.createdAt?.toDate() || new Date()
    } as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.generateId();
    const usersRef = collection(db, 'users');
    await addDoc(usersRef, {
      userId: id,
      ...user,
      createdAt: serverTimestamp()
    });
    return { id, ...user, createdAt: new Date() } as User;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({ 
      id: this.generateId(), 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      description: doc.data().description || null
    } as Category));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    console.log(`🔍 البحث عن الفئة: ${id}`);
    const categoriesRef = collection(db, 'categories');
    
    // البحث بـ categoryId أولاً
    let q = query(categoriesRef, where('categoryId', '==', id));
    let snapshot = await getDocs(q);
    
    // إذا لم نجد، نبحث بـ id
    if (snapshot.empty) {
      q = query(categoriesRef, where('id', '==', id));
      snapshot = await getDocs(q);
    }
    
    // إذا لم نجد، نجلب جميع الفئات ونبحث
    if (snapshot.empty) {
      const allCategoriesSnapshot = await getDocs(categoriesRef);
      console.log(`📂 جميع الفئات المتاحة:`, allCategoriesSnapshot.docs.map(doc => ({
        docId: doc.id,
        data: doc.data()
      })));
      
      // البحث في جميع الفئات
      for (const doc of allCategoriesSnapshot.docs) {
        const data = doc.data();
        if (data.id === id || data.categoryId === id || doc.id === id.toString()) {
          console.log(`✅ تم العثور على الفئة:`, data);
          return { 
            id: data.id || data.categoryId || id, 
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            description: data.description || null
          } as Category;
        }
      }
      
      console.log(`❌ لم يتم العثور على الفئة ${id}`);
      return undefined;
    }
    
    const doc = snapshot.docs[0];
    const categoryData = { 
      id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      description: doc.data().description || null
    } as Category;
    
    console.log(`✅ تم العثور على الفئة:`, categoryData);
    return categoryData;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.generateId();
    const categoriesRef = collection(db, 'categories');
    await addDoc(categoriesRef, {
      categoryId: id,
      ...category,
      description: category.description || null,
      createdAt: serverTimestamp()
    });
    return { 
      id, 
      ...category, 
      createdAt: new Date(),
      description: category.description || null
    } as Category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('categoryId', '==', id));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    
    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, { ...categoryData });
    return this.getCategory(id);
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('categoryId', '==', id));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return false;
      
      await deleteDoc(snapshot.docs[0].ref);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Products
  async getProducts(): Promise<ProductWithCategory[]> {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    const products = await Promise.all(
      snapshot.docs.map(async (productDoc) => {
        const data = productDoc.data();
        const product = {
          id: data.id || data.productId || this.generateId(),
          name: data.name,
          price: data.price?.toString() || '0',
          stock: data.stock || 0,
          sku: data.sku || '',
          categoryId: data.categoryId || null,
          status: data.status || 'active',
          description: data.description || null,
          minPrice: data.minPrice?.toString() || null,
          maxPrice: data.maxPrice?.toString() || null,
          imageUrl: data.imageUrl || null,
          additionalImages: data.additionalImages || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || null
        } as Product;

        let category = undefined;
        if (data.categoryId) {
          console.log(`🏷️ جلب الفئة ${data.categoryId} للمنتج ${data.name}`);
          category = await this.getCategory(data.categoryId);
          console.log(`📂 بيانات الفئة:`, category);
        } else {
          console.log(`⚠️ المنتج ${data.name} لا يحتوي على فئة`);
        }

        return { ...product, category } as ProductWithCategory;
      })
    );
    return products;
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    console.log(`🔍 البحث عن المنتج: ${id}`);
    
    // استخدم الطريقة الموثوقة - جلب جميع المنتجات والبحث
    const allProducts = await this.getProducts();
    console.log(`📋 عدد المنتجات: ${allProducts.length}`);
    console.log(`📋 معرفات المنتجات: ${allProducts.map(p => p.id).slice(0, 5).join(', ')}...`);
    
    const product = allProducts.find(p => {
      return p.id == id || p.id === id || parseInt(p.id.toString()) === parseInt(id.toString());
    });
    
    if (!product) {
      console.log(`❌ لم يتم العثور على المنتج ${id}`);
      return undefined;
    }
    
    console.log(`✅ تم العثور على المنتج: ${product.name} (ID: ${product.id})`);
    return product;
  }

  async getProductsByCategoryId(categoryId: number): Promise<ProductWithCategory[]> {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('categoryId', '==', categoryId));
    const snapshot = await getDocs(q);
    
    const products = await Promise.all(
      snapshot.docs.map(async (productDoc) => {
        const data = productDoc.data();
        const product = {
          id: this.generateId(),
          name: data.name,
          price: data.price?.toString() || '0',
          stock: data.stock || 0,
          sku: data.sku || '',
          categoryId: data.categoryId || null,
          status: data.status || 'active',
          description: data.description || null,
          minPrice: data.minPrice?.toString() || null,
          maxPrice: data.maxPrice?.toString() || null,
          imageUrl: data.imageUrl || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || null
        } as Product;

        const category = await this.getCategory(categoryId);
        return { ...product, category } as ProductWithCategory;
      })
    );
    return products;
  }

  async createProduct(product: any): Promise<Product> {
    // استخدام المعرف المرسل إذا كان موجود، أو إنشاء معرف جديد
    const id = product.id || this.generateId();
    const productsRef = collection(db, 'products');
    
    // إنشاء مستند بمعرف محدد باستخدام setDoc
    const docRef = doc(productsRef, id.toString());
    
    const productData = {
      id: id,
      productId: id,
      name: product.name,
      description: product.description || null,
      price: parseFloat(product.price?.toString() || '0'),
      minPrice: product.minPrice ? parseFloat(product.minPrice.toString()) : null,
      maxPrice: product.maxPrice ? parseFloat(product.maxPrice.toString()) : null,
      stock: product.stock || 0,
      sku: product.sku || `SKU-${id}`,
      categoryId: product.categoryId || null,
      colors: product.colors || ['أبيض'],
      imageUrl: product.imageUrl || null,
      additionalImages: product.additionalImages || [],
      status: product.status || 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(docRef, productData);
    
    return {
      id,
      name: product.name,
      price: product.price?.toString() || '0',
      stock: product.stock,
      sku: product.sku,
      categoryId: product.categoryId || null,
      status: product.status || 'active',
      description: product.description || null,
      minPrice: product.minPrice?.toString() || null,
      maxPrice: product.maxPrice?.toString() || null,
      imageUrl: product.imageUrl || null,
      additionalImages: product.additionalImages || [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as Product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    console.log('محاولة تحديث المنتج رقم:', id);
    const productsRef = collection(db, 'products');
    
    // البحث عن المنتج بطرق مختلفة
    const allDocs = await getDocs(productsRef);
    let targetDoc = null;
    
    for (const doc of allDocs.docs) {
      const data = doc.data();
      console.log(`🔍 فحص المنتج: ${data.name}, المعرف: ${data.id}, productId: ${data.productId}, المطلوب: ${id}`);
      if (data.id == id || data.productId == id || 
          parseInt(data.id?.toString() || '0') === parseInt(id.toString()) ||
          parseInt(data.productId?.toString() || '0') === parseInt(id.toString())) {
        targetDoc = doc;
        console.log('✅ تم العثور على المنتج:', data.name, 'بالمعرف:', data.id);
        break;
      }
    }
    
    if (!targetDoc) {
      console.log('❌ لم يتم العثور على المنتج بالمعرف:', id);
      return undefined;
    }
    
    console.log('🔄 سيتم تحديث المنتج:', targetDoc.data().name);
    
    const updateData: any = {};
    
    // تحديث الحقول المرسلة فقط
    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.description !== undefined) updateData.description = productData.description;
    if (productData.price !== undefined) updateData.price = parseFloat(productData.price.toString()) || 0;
    if (productData.minPrice !== undefined) updateData.minPrice = parseFloat(productData.minPrice.toString()) || 0;
    if (productData.maxPrice !== undefined) updateData.maxPrice = parseFloat(productData.maxPrice.toString()) || 0;
    if (productData.stock !== undefined) updateData.stock = parseInt(productData.stock.toString()) || 0;
    if (productData.categoryId !== undefined) updateData.categoryId = productData.categoryId;
    if (productData.imageUrl !== undefined) updateData.imageUrl = productData.imageUrl;
    if ((productData as any).additionalImages !== undefined) updateData.additionalImages = (productData as any).additionalImages;
    
    // إضافة وقت التحديث
    updateData.updatedAt = serverTimestamp();
    
    console.log('البيانات التي سيتم تحديثها:', updateData);
    await updateDoc(targetDoc.ref, updateData);
    console.log('✅ تم تحديث المنتج في Firebase بنجاح');
    
    // استرجاع البيانات المحدثة مباشرة من المستند
    const updatedDoc = await getDoc(targetDoc.ref);
    const updatedData = updatedDoc.data();
    console.log('البيانات المحدثة من Firebase:', updatedData);
    
    return {
      id: id,
      name: updatedData?.name || '',
      price: updatedData?.price?.toString() || '0',
      stock: updatedData?.stock || 0,
      sku: updatedData?.sku || '',
      categoryId: updatedData?.categoryId || null,
      status: updatedData?.status || 'active',
      description: updatedData?.description || null,
      minPrice: updatedData?.minPrice?.toString() || null,
      maxPrice: updatedData?.maxPrice?.toString() || null,
      imageUrl: updatedData?.imageUrl || null,
      additionalImages: updatedData?.additionalImages || [],
      createdAt: updatedData?.createdAt?.toDate() || new Date(),
      updatedAt: new Date()
    } as Product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('productId', '==', id));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return false;
      
      await deleteDoc(snapshot.docs[0].ref);
      return true;
    } catch (error) {
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
      id: this.generateId(),
      ...doc.data(),
      phone: doc.data().phone || null,
      address: doc.data().address || null,
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Customer));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('customerId', '==', id));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return {
      id,
      ...doc.data(),
      phone: doc.data().phone || null,
      address: doc.data().address || null,
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : (doc.data().createdAt ? new Date(doc.data().createdAt) : new Date())
    } as Customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.generateId();
    const customersRef = collection(db, 'customers');
    await addDoc(customersRef, {
      customerId: id,
      ...customer,
      phone: customer.phone || null,
      address: customer.address || null,
      createdAt: serverTimestamp()
    });
    return {
      id,
      ...customer,
      phone: customer.phone || null,
      address: customer.address || null,
      createdAt: new Date()
    } as Customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('customerId', '==', id));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    
    await updateDoc(snapshot.docs[0].ref, customerData);
    return this.getCustomer(id);
  }

  // Orders
  async getOrders(): Promise<any[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const orders = snapshot.docs.map(orderDoc => {
      const data = orderDoc.data();
      return {
        id: data.orderId || this.generateId(),
        customerId: data.customerId || null,
        total: data.total || '0',
        status: data.status || 'pending',
        customerDetails: data.customerDetails || {},
        items: data.items || [],
        customerPrice: data.customerPrice || 0,
        deliveryFee: data.deliveryFee || 0,
        totalWithDelivery: data.totalWithDelivery || 0,
        wholesaleTotal: data.wholesaleTotal || 0,
        profit: data.profit || 0,
        totalItems: data.totalItems || 0,
        orderDate: data.orderDate || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null)
      };
    });
    
    console.log('جلب الطلبات من Firebase:', orders);
    return orders;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('orderId', '==', id));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    
    const data = snapshot.docs[0].data();
    const order = {
      id,
      customerId: data.customerId || null,
      total: data.total || '0',
      status: data.status || 'pending',
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null)
    } as Order;

    let customer = undefined;
    if (data.customerId) {
      customer = await this.getCustomer(data.customerId);
    }

    // Get order items
    const orderItemsRef = collection(db, 'orderItems');
    const itemsQuery = query(orderItemsRef, where('orderId', '==', id));
    const itemsSnapshot = await getDocs(itemsQuery);
    
    const items = await Promise.all(
      itemsSnapshot.docs.map(async (itemDoc) => {
        const itemData = itemDoc.data();
        const orderItem = {
          id: this.generateId(),
          orderId: itemData.orderId || null,
          productId: itemData.productId || null,
          quantity: itemData.quantity || 0,
          price: itemData.price || '0'
        } as OrderItem;

        let product = undefined;
        if (itemData.productId) {
          const productWithCategory = await this.getProduct(itemData.productId);
          if (productWithCategory) {
            product = {
              id: productWithCategory.id,
              name: productWithCategory.name,
              price: productWithCategory.price,
              stock: productWithCategory.stock,
              sku: productWithCategory.sku,
              categoryId: productWithCategory.categoryId,
              status: productWithCategory.status,
              description: productWithCategory.description,
              minPrice: productWithCategory.minPrice,
              maxPrice: productWithCategory.maxPrice,
              imageUrl: productWithCategory.imageUrl,
              createdAt: productWithCategory.createdAt,
              updatedAt: productWithCategory.updatedAt
            } as Product;
          }
        }

        return { ...orderItem, product };
      })
    );

    return { ...order, customer, items } as OrderWithItems;
  }

  async getOrdersByCustomerId(customerId: number): Promise<OrderWithCustomer[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const orders = await Promise.all(
      snapshot.docs.map(async (orderDoc) => {
        const data = orderDoc.data();
        const order = {
          id: this.generateId(),
          customerId: data.customerId || null,
          total: data.total || '0',
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || null
        } as Order;

        const customer = await this.getCustomer(customerId);
        return { ...order, customer } as OrderWithCustomer;
      })
    );
    return orders;
  }

  async createOrder(order: any): Promise<any> {
    const id = this.generateId();
    const ordersRef = collection(db, 'orders');
    
    // حفظ الطلب مع جميع البيانات المخصصة
    const orderData = {
      orderId: id,
      customerId: order.customerId || null,
      total: order.total || '0',
      status: order.status || 'pending',
      customerDetails: order.customerDetails,
      items: order.items || [],
      customerPrice: order.customerPrice || 0,
      deliveryFee: order.deliveryFee || 0,
      totalWithDelivery: order.totalWithDelivery || 0,
      wholesaleTotal: order.wholesaleTotal || 0,
      profit: order.profit || 0,
      totalItems: order.totalItems || 0,
      orderDate: order.orderDate || new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('حفظ طلب في Firebase:', orderData);
    await addDoc(ordersRef, orderData);
    
    return {
      id,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      console.log(`📝 تحديث حالة الطلب ${id} إلى ${status}`);
      
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('orderId', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('⚠️ لم يتم العثور على الطلب');
        return undefined;
      }
      
      const orderDoc = snapshot.docs[0];
      const orderData = orderDoc.data();
      
      // إذا كان الطلب يتم رفضه، نحتاج لحذف الأرباح من المستخدم
      if (status === 'rejected' && orderData.customerDetails?.phone && orderData.profit) {
        console.log(`💰 حذف أرباح ${orderData.profit} د.ع من المستخدم ${orderData.customerDetails.phone}`);
        
        // البحث عن المستخدم
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('phone', '==', orderData.customerDetails.phone));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();
          
          // حذف الأرباح من الأرباح القادمة
          const currentPendingProfits = userData.pendingProfits || 0;
          const newPendingProfits = Math.max(0, currentPendingProfits - orderData.profit);
          
          // حذف الطلب من إجمالي الطلبات
          const currentTotalOrders = userData.totalOrders || 0;
          const newTotalOrders = Math.max(0, currentTotalOrders - 1);
          
          await updateDoc(userDoc.ref, {
            pendingProfits: newPendingProfits,
            totalOrders: newTotalOrders,
            updatedAt: new Date().toISOString()
          });
          
          console.log(`✅ تم حذف الأرباح. الأرباح القادمة الجديدة: ${newPendingProfits} د.ع`);
          console.log(`✅ تم تحديث إجمالي الطلبات. الطلبات الجديدة: ${newTotalOrders}`);
        }
      }
      
      await updateDoc(orderDoc.ref, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      const order = await this.getOrder(id);
      console.log('✅ تم تحديث حالة الطلب');
      return order ? {
        id: order.id,
        customerId: order.customerId,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: new Date()
      } as Order : undefined;
    } catch (error) {
      console.error('❌ خطأ في تحديث حالة الطلب:', error);
      throw error;
    }
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.generateId();
    const orderItemsRef = collection(db, 'orderItems');
    await addDoc(orderItemsRef, {
      orderItemId: id,
      ...orderItem,
      orderId: orderItem.orderId || null,
      productId: orderItem.productId || null
    });
    return {
      id,
      ...orderItem,
      orderId: orderItem.orderId || null,
      productId: orderItem.productId || null
    } as OrderItem;
  }

  async deleteOrder(id: number): Promise<boolean> {
    try {
      console.log(`🗑️ محاولة حذف الطلب: ${id}`);
      
      // إنشاء طلب جديد للاختبار إذا لم توجد طلبات
      const orders = await this.getOrders();
      if (orders.length === 0) {
        console.log('📝 إنشاء طلبات تجريبية للاختبار...');
        await this.createTestOrders();
      }
      
      // البحث المباشر في Firebase
      const ordersRef = collection(db, 'orders');
      const allOrdersSnapshot = await getDocs(ordersRef);
      
      let orderDocToDelete = null;
      console.log(`🔍 البحث في ${allOrdersSnapshot.docs.length} وثيقة عن الطلب ${id}`);
      
      // البحث عن الوثيقة التي تحتوي على الطلب المطلوب
      for (const doc of allOrdersSnapshot.docs) {
        try {
          const data = doc.data();
          console.log(`📄 فحص الوثيقة ${doc.id}:`, { id: data.id, type: typeof data.id });
          
          // التحقق من وجود معرف الطلب في البيانات
          if (data && (
            data.orderId === id || 
            data.orderId === id.toString() ||
            parseInt(data.orderId) === id ||
            data.id === id || 
            data.id === id.toString() ||
            parseInt(data.id) === id
          )) {
            console.log(`✅ تم العثور على الطلب ${id} في الوثيقة ${doc.id}`);
            orderDocToDelete = doc;
            break;
          }
        } catch (docError) {
          console.log(`خطأ في قراءة الوثيقة ${doc.id}:`, docError);
          continue;
        }
      }
      
      if (orderDocToDelete) {
        // حذف الطلب
        await deleteDoc(orderDocToDelete.ref);
        console.log(`✅ تم حذف الطلب ${id} من Firebase`);
        
        // حذف عناصر الطلب المرتبطة
        try {
          const orderItemsRef = collection(db, 'orderItems');
          const allItemsSnapshot = await getDocs(orderItemsRef);
          
          for (const itemDoc of allItemsSnapshot.docs) {
            const itemData = itemDoc.data();
            if (itemData.orderId === id || parseInt(itemData.orderId) === id) {
              await deleteDoc(itemDoc.ref);
              console.log(`✅ تم حذف عنصر الطلب ${itemDoc.id}`);
            }
          }
        } catch (itemsError) {
          console.log(`تنبيه: لم يتم العثور على عناصر للطلب ${id}`);
        }
        
        console.log(`✅ تم حذف الطلب ${id} بنجاح`);
        return true;
      } else {
        console.log(`❌ لم يتم العثور على الطلب ${id} في Firebase`);
        return false;
      }
    } catch (error) {
      console.error(`❌ خطأ في حذف الطلب ${id}:`, error);
      return false;
    }
  }

  // إنشاء طلبات تجريبية للاختبار
  async createTestOrders(): Promise<void> {
    try {
      const testOrders = [
        {
          id: Date.now(),
          customerId: null,
          total: '25000',
          status: 'pending',
          customerDetails: {
            name: 'علي أحمد',
            phone: '07801234567',
            governorate: 'بغداد',
            area: 'الكرادة',
            address: 'شارع الكرادة الداخلية',
            notes: 'طلب اختبار'
          },
          items: [{
            productId: 1748517961702,
            productName: 'جدر اندومي',
            quantity: 2,
            price: 15000,
            total: 30000
          }],
          customerPrice: 25000,
          deliveryFee: 4000,
          totalWithDelivery: 29000,
          wholesaleTotal: 20000,
          profit: 5000,
          totalItems: 2,
          orderDate: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: Date.now() + 1,
          customerId: null,
          total: '35000',
          status: 'delivered',
          customerDetails: {
            name: 'فاطمة محمد',
            phone: '07709876543',
            governorate: 'بغداد',
            area: 'المنصور',
            address: 'حي المنصور',
            notes: 'تسليم سريع'
          },
          items: [{
            productId: 1748517961702,
            productName: 'جدر اندومي',
            quantity: 3,
            price: 15000,
            total: 45000
          }],
          customerPrice: 35000,
          deliveryFee: 4000,
          totalWithDelivery: 39000,
          wholesaleTotal: 30000,
          profit: 5000,
          totalItems: 3,
          orderDate: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const order of testOrders) {
        await this.createOrder(order);
      }
      
      console.log('✅ تم إنشاء طلبات تجريبية بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء الطلبات التجريبية:', error);
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

  // Cart functions
  async getCartItems(): Promise<any[]> {
    const cartRef = collection(db, 'cart');
    const snapshot = await getDocs(cartRef);
    
    const cartItems = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const product = await this.getProduct(data.productId);
        
        return {
          id: doc.id,
          productId: data.productId,
          quantity: data.quantity,
          addedAt: data.addedAt?.toDate() || new Date(),
          product
        };
      })
    );
    
    return cartItems;
  }

  async addToCart(productId: number, quantity: number): Promise<any> {
    const cartRef = collection(db, 'cart');
    
    // البحث عن منتج موجود في السلة
    const q = query(cartRef, where('productId', '==', productId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // تحديث الكمية إذا كان المنتج موجود
      const doc = snapshot.docs[0];
      const currentQuantity = doc.data().quantity || 0;
      await updateDoc(doc.ref, {
        quantity: currentQuantity + quantity,
        updatedAt: new Date()
      });
      
      const product = await this.getProduct(productId);
      return {
        productId,
        quantity: currentQuantity + quantity,
        product
      };
    } else {
      // إضافة منتج جديد
      const docRef = await addDoc(cartRef, {
        productId,
        quantity,
        addedAt: new Date(),
        updatedAt: new Date()
      });
      
      const product = await this.getProduct(productId);
      return {
        id: docRef.id,
        productId,
        quantity,
        product
      };
    }
  }

  async removeFromCart(productId: number): Promise<boolean> {
    const cartRef = collection(db, 'cart');
    const q = query(cartRef, where('productId', '==', productId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      await deleteDoc(snapshot.docs[0].ref);
      return true;
    }
    
    return false;
  }

  async updateCartQuantity(productId: number, quantity: number): Promise<any> {
    const cartRef = collection(db, 'cart');
    const q = query(cartRef, where('productId', '==', productId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await updateDoc(doc.ref, {
        quantity,
        updatedAt: new Date()
      });
      
      const product = await this.getProduct(productId);
      return {
        productId,
        quantity,
        product
      };
    }
    
    return null;
  }

  // Saved Products
  async getSavedProducts(): Promise<any[]> {
    try {
      console.log('جلب المنتجات المحفوظة من Firebase...');
      const savedProductsRef = collection(db, 'savedProducts');
      const snapshot = await getDocs(savedProductsRef);
      
      console.log(`تم العثور على ${snapshot.docs.length} منتج محفوظ`);
      
      // جلب جميع المنتجات مرة واحدة لتحسين الأداء
      const allProducts = await this.getProducts();
      
      const savedProducts = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('بيانات المنتج المحفوظ:', data);
        
        // البحث عن المنتج في قائمة المنتجات
        const product = allProducts.find(p => p.id === data.productId);
        
        if (product) {
          console.log('تم العثور على تفاصيل المنتج:', product.name);
        } else {
          console.log('لم يتم العثور على تفاصيل المنتج للرقم:', data.productId);
        }
        
        return {
          id: doc.id,
          productId: data.productId,
          product,
          savedAt: data.savedAt?.toDate() || new Date()
        };
      });
      
      const validProducts = savedProducts.filter(item => item.product);
      console.log(`تم إرجاع ${validProducts.length} منتج صالح من أصل ${savedProducts.length}`);
      return validProducts;
    } catch (error) {
      console.error('خطأ في جلب المنتجات المحفوظة:', error);
      throw new Error('خطأ في جلب المنتجات المحفوظة');
    }
  }

  async addToSavedProducts(productId: number): Promise<any> {
    try {
      console.log(`محاولة حفظ المنتج رقم: ${productId}`);
      const savedProductsRef = collection(db, 'savedProducts');
      
      // التحقق من عدم وجود المنتج مسبقاً
      const q = query(savedProductsRef, where('productId', '==', productId));
      const existingSnapshot = await getDocs(q);
      
      if (!existingSnapshot.empty) {
        console.log('المنتج موجود مسبقاً في المحفوظات');
        const doc = existingSnapshot.docs[0];
        const data = doc.data();
        const product = await this.getProduct(productId);
        return {
          id: doc.id,
          productId: data.productId,
          product,
          savedAt: data.savedAt?.toDate() || new Date()
        };
      }
      
      // إضافة المنتج الجديد
      console.log('إضافة منتج جديد للمحفوظات...');
      const docRef = await addDoc(savedProductsRef, {
        productId: productId,
        savedAt: new Date()
      });
      
      console.log(`تم حفظ المنتج بـ ID: ${docRef.id}`);
      const product = await this.getProduct(productId);
      return {
        id: docRef.id,
        productId,
        product,
        savedAt: new Date()
      };
    } catch (error) {
      console.error('خطأ في حفظ المنتج:', error);
      throw new Error('خطأ في حفظ المنتج');
    }
  }

  async removeFromSavedProducts(productId: number): Promise<boolean> {
    try {
      const savedProductsRef = collection(db, 'savedProducts');
      const q = query(savedProductsRef, where('productId', '==', productId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('خطأ في إزالة المنتج من المحفوظات:', error);
      return false;
    }
  }

  // Notification functions
  async createNotification(notificationData: any): Promise<any> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, {
        ...notificationData,
        createdAt: serverTimestamp(),
        sentAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...notificationData
      };
    } catch (error) {
      console.error('خطأ في إنشاء الإشعار:', error);
      throw new Error('خطأ في إنشاء الإشعار');
    }
  }

  async getNotifications(): Promise<any[]> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        sentAt: doc.data().sentAt?.toDate()?.toISOString() || null
      }));
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
      return [];
    }
  }

  async deleteNotification(id: string): Promise<boolean> {
    try {
      const notificationRef = doc(db, 'notifications', id);
      await deleteDoc(notificationRef);
      return true;
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
      return false;
    }
  }

  // Banner functions
  async getBanners(): Promise<any[]> {
    try {
      console.log('جلب البانرات من Firebase...');
      const bannersRef = collection(db, 'banners');
      const snapshot = await getDocs(bannersRef);
      
      const banners = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
      
      console.log(`تم العثور على ${banners.length} بانر`);
      return banners;
    } catch (error) {
      console.error('خطأ في جلب البانرات:', error);
      return [];
    }
  }

  async createBanner(bannerData: any): Promise<any> {
    try {
      console.log('إنشاء بانر جديد في Firebase:', bannerData);
      
      // التحقق من عدد البانرات الحالية
      const existingBanners = await this.getBanners();
      if (existingBanners.length >= 5) {
        throw new Error('تم الوصول للحد الأقصى من البانرات (5 بانرات)');
      }
      
      const bannersRef = collection(db, 'banners');
      const newBanner = {
        title: bannerData.title,
        description: bannerData.description || '',
        imageUrl: bannerData.imageUrl || '',
        isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(bannersRef, newBanner);
      
      const banner = {
        id: docRef.id,
        ...newBanner
      };
      
      console.log('تم إنشاء البانر بنجاح:', banner);
      return banner;
    } catch (error) {
      console.error('خطأ في إنشاء البانر:', error);
      throw error;
    }
  }

  async updateBanner(id: string, bannerData: any): Promise<any> {
    try {
      console.log('تحديث البانر:', id, bannerData);
      
      // البحث عن البانر بالمعرف الداخلي
      const bannersCollection = collection(db, 'banners');
      const querySnapshot = await getDocs(bannersCollection);
      
      let docToUpdate: any = null;
      let docId = '';
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.id === id) {
          docToUpdate = docSnapshot;
          docId = docSnapshot.id;
        }
      });
      
      if (!docToUpdate) {
        console.log('البانر غير موجود');
        return null;
      }
      
      const updateData = {
        id: id, // الحفاظ على المعرف الأصلي
        title: bannerData.title,
        description: bannerData.description || '',
        imageUrl: bannerData.imageUrl || '',
        isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
        updatedAt: new Date()
      };
      
      // استخدام معرف المستند Firebase للتحديث
      const docRef = doc(db, 'banners', docId);
      await updateDoc(docRef, updateData);
      
      console.log('تم تحديث البانر بنجاح');
      return updateData;
    } catch (error) {
      console.error('خطأ في تحديث البانر:', error);
      throw error;
    }
  }

  async deleteBanner(id: string): Promise<boolean> {
    try {
      console.log('حذف البانر:', id);
      
      // البحث عن البانر بالمعرف الداخلي
      const bannersCollection = collection(db, 'banners');
      const querySnapshot = await getDocs(bannersCollection);
      
      let docToDelete: any = null;
      let docId = '';
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.id === id) {
          docToDelete = docSnapshot;
          docId = docSnapshot.id;
        }
      });
      
      if (!docToDelete) {
        console.log('البانر غير موجود للحذف');
        return false;
      }
      
      // استخدام معرف المستند Firebase للحذف
      const docRef = doc(db, 'banners', docId);
      await deleteDoc(docRef);
      console.log('تم حذف البانر بنجاح');
      return true;
    } catch (error) {
      console.error('خطأ في حذف البانر:', error);
      return false;
    }
  }

  // حذف شامل ونهائي من Firebase
  async clearAllProducts(): Promise<number> {
    try {
      console.log('🔥 بدء حذف نهائي من Firebase...');
      
      let totalDeleted = 0;
      const maxAttempts = 5;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`🔄 المحاولة ${attempt}/${maxAttempts}`);
        
        // حذف المنتجات
        let productsSnapshot = await getDocs(collection(db, 'products'));
        console.log(`📦 وجدت ${productsSnapshot.size} منتج`);
        
        if (productsSnapshot.size === 0) {
          console.log('✅ لا توجد منتجات - تم الحذف!');
          break;
        }
        
        // حذف كل منتج بشكل فردي
        for (const docSnap of productsSnapshot.docs) {
          try {
            console.log(`🗑️ حذف: ${docSnap.id}`);
            await deleteDoc(doc(db, 'products', docSnap.id));
            totalDeleted++;
          } catch (error) {
            console.error(`❌ فشل حذف ${docSnap.id}:`, error);
          }
        }
        
        // انتظار قبل المحاولة التالية
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // حذف البيانات المرتبطة
      console.log('🧹 تنظيف البيانات المرتبطة...');
      
      const collections = ['cart', 'savedProducts'];
      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        for (const docSnap of snapshot.docs) {
          await deleteDoc(docSnap.ref);
        }
        console.log(`✅ تم تنظيف ${collectionName}: ${snapshot.size} عنصر`);
      }
      
      console.log(`🎉 تم حذف ${totalDeleted} منتج نهائياً!`);
      return totalDeleted;
    } catch (error) {
      console.error('❌ خطأ في الحذف النهائي:', error);
      throw error;
    }
  }

  // تحديث كلمة مرور المستخدم
  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('id', '==', parseInt(userId)));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('لم يتم العثور على المستخدم');
        return false;
      }

      // تشفير كلمة المرور
      const hashedPassword = Buffer.from(newPassword).toString('base64');

      const userDoc = snapshot.docs[0];
      await updateDoc(userDoc.ref, {
        password: hashedPassword,
        updatedAt: new Date()
      });

      console.log(`تم تحديث كلمة المرور للمستخدم ${userId} في Firebase`);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث كلمة المرور:', error);
      return false;
    }
  }

  // إدارة رموز استرداد كلمة المرور
  async createResetCode(resetData: any): Promise<any> {
    try {
      console.log('📝 إنشاء رمز استرداد جديد:', resetData.userPhone);
      const docRef = await addDoc(collection(db, 'resetCodes'), resetData);
      console.log('✅ تم إنشاء رمز الاسترداد بنجاح');
      return { id: docRef.id, ...resetData };
    } catch (error) {
      console.error('❌ خطأ في إنشاء رمز الاسترداد:', error);
      throw error;
    }
  }

  async getResetCodes(): Promise<any[]> {
    try {
      console.log('📋 جلب رموز الاسترداد من Firebase...');
      const snapshot = await getDocs(collection(db, 'resetCodes'));
      const codes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`✅ تم جلب ${codes.length} رمز استرداد`);
      return codes;
    } catch (error) {
      console.error('❌ خطأ في جلب رموز الاسترداد:', error);
      return [];
    }
  }

  async deleteResetCode(id: string): Promise<void> {
    try {
      console.log(`🗑️ حذف رمز الاسترداد ${id}`);
      const docRef = doc(db, 'resetCodes', id);
      await deleteDoc(docRef);
      console.log('✅ تم حذف رمز الاسترداد');
    } catch (error) {
      console.error('❌ خطأ في حذف رمز الاسترداد:', error);
      throw error;
    }
  }

  // إدارة الإشعارات
  async createNotification(notificationData: any): Promise<any> {
    try {
      console.log('🔔 إنشاء إشعار جديد:', notificationData.type);
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('✅ تم إنشاء الإشعار بنجاح');
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('❌ خطأ في إنشاء الإشعار:', error);
      throw error;
    }
  }

  async getNotifications(): Promise<any[]> {
    try {
      console.log('📋 جلب الإشعارات من Firebase...');
      const snapshot = await getDocs(collection(db, 'notifications'));
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`✅ تم جلب ${notifications.length} إشعار`);
      return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('❌ خطأ في جلب الإشعارات:', error);
      return [];
    }
  }

  async updateNotification(id: string, updateData: any): Promise<void> {
    try {
      console.log(`📝 تحديث الإشعار ${id}`);
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, { 
        ...updateData,
        updatedAt: new Date().toISOString() 
      });
      console.log('✅ تم تحديث الإشعار');
    } catch (error) {
      console.error('❌ خطأ في تحديث الإشعار:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    try {
      console.log(`🔍 البحث عن المستخدم بالمعرف: ${userId}`);
      console.log('📝 بيانات التحديث المرسلة:', userData);
      
      const usersRef = collection(db, 'users');
      
      // البحث في جميع المستندات للعثور على المعرف المطابق
      const allSnapshot = await getDocs(usersRef);
      console.log('🔍 البحث في جميع المستندات...');
      console.log(`📊 إجمالي المستندات: ${allSnapshot.docs.length}`);
      
      if (allSnapshot.empty) {
        console.log('❌ لا توجد مستندات في مجموعة المستخدمين');
        return null;
      }
      
      for (const doc of allSnapshot.docs) {
        const data = doc.data();
        
        console.log(`🔍 فحص المستند: ${doc.id}, البيانات:`, {
          docId: doc.id,
          dataId: data.id,
          dataUserId: data.userId,
          phone: data.phone
        });
        
        // البحث بجميع أنواع المعرفات الممكنة
        if (doc.id === userId || 
            data.id === userId || 
            data.userId === userId || 
            String(data.userId) === String(userId) || 
            data.id === Number(userId) ||
            Number(data.id) === Number(userId)) {
          
          console.log('✅ عثرت على المستخدم للتحديث!');
          
          const updateData = {
            ...userData,
            updatedAt: new Date()
          };
          
          console.log('📝 تحديث البيانات:', updateData);
          await updateDoc(doc.ref, updateData);
          
          // إرجاع البيانات المحدثة
          const updatedDoc = await getDoc(doc.ref);
          const updatedData = updatedDoc.data();
          
          console.log(`✅ تم تحديث بيانات المستخدم بنجاح`);
          return {
            id: data.id || data.userId || doc.id,
            docId: doc.id,
            ...updatedData
          };
        }
      }
      
      console.log('❌ لم يتم العثور على المستخدم للتحديث');
      return null;
    } catch (error) {
      console.error('❌ خطأ في تحديث المستخدم:', error);
      return null;
    }
  }

  // إنشاء طلب مباشرة في Firebase
  async createOrderDirect(orderData: any): Promise<any> {
    try {
      console.log('📝 إنشاء طلب مباشر في Firebase:', orderData);
      
      const ordersRef = collection(db, 'orders');
      const docRef = await addDoc(ordersRef, {
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ تم إنشاء الطلب مباشرة بنجاح:', docRef.id);
      return { 
        id: docRef.id, 
        firebaseId: docRef.id,
        ...orderData 
      };
    } catch (error) {
      console.error('❌ خطأ في إنشاء الطلب المباشر:', error);
      throw error;
    }
  }

  // إدارة طلبات سحب الأرباح
  async createWithdrawRequest(withdrawRequest: any): Promise<any> {
    try {
      // إزالة الحقول undefined والفارغة لتجنب أخطاء Firebase
      const cleanRequest: any = {};
      
      Object.entries(withdrawRequest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanRequest[key] = value;
        }
      });
      
      console.log('📝 إنشاء طلب سحب جديد:', cleanRequest);
      const docRef = await addDoc(collection(db, 'withdrawRequests'), cleanRequest);
      console.log('✅ تم إنشاء طلب السحب بنجاح');
      return { id: docRef.id, ...cleanRequest };
    } catch (error) {
      console.error('❌ خطأ في إنشاء طلب السحب:', error);
      throw error;
    }
  }

  async getWithdrawRequests(): Promise<any[]> {
    try {
      console.log('📋 جلب طلبات السحب من Firebase...');
      const snapshot = await getDocs(collection(db, 'withdrawRequests'));
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`✅ تم جلب ${requests.length} طلب سحب`);
      return requests;
    } catch (error) {
      console.error('❌ خطأ في جلب طلبات السحب:', error);
      return [];
    }
  }

  async updateWithdrawRequestStatus(id: string, status: string, rejectionReason?: string): Promise<void> {
    try {
      console.log(`📝 تحديث حالة طلب السحب ${id} إلى ${status}`);
      
      // البحث عن الطلب أولاً
      const withdrawRequestsRef = collection(db, 'withdrawRequests');
      const q = query(withdrawRequestsRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      let withdrawRequestData = null;
      if (!snapshot.empty) {
        withdrawRequestData = snapshot.docs[0].data();
      }
      
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
        
        // إرجاع الأرباح للمستخدم عند الرفض
        if (withdrawRequestData && withdrawRequestData.userPhone && withdrawRequestData.amount) {
          console.log(`💰 إرجاع مبلغ ${withdrawRequestData.amount} د.ع للمستخدم ${withdrawRequestData.userPhone}`);
          
          // البحث عن المستخدم وإضافة المبلغ لأرباحه المحققة
          const usersRef = collection(db, 'users');
          const userQuery = query(usersRef, where('phone', '==', withdrawRequestData.userPhone));
          const userSnapshot = await getDocs(userQuery);
          
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            const currentAchievedProfits = userData.achievedProfits || 0;
            const newAchievedProfits = currentAchievedProfits + withdrawRequestData.amount;
            
            await updateDoc(userDoc.ref, {
              achievedProfits: newAchievedProfits,
              updatedAt: new Date().toISOString()
            });
            
            console.log(`✅ تم إرجاع الأرباح للأرباح المحققة. الأرباح المحققة الجديدة: ${newAchievedProfits} د.ع`);
          }
        }
      }
      
      if (snapshot.empty) {
        console.log('⚠️ لم يتم العثور على طلب السحب، إنشاء جديد...');
        await addDoc(withdrawRequestsRef, {
          id,
          ...updateData
        });
      } else {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, updateData);
      }
      
      console.log('✅ تم تحديث حالة طلب السحب');
    } catch (error) {
      console.error('❌ خطأ في تحديث طلب السحب:', error);
      throw error;
    }
  }

  // الحصول على طلبات السحب حسب رقم الهاتف
  async getWithdrawRequestsByPhone(userPhone: string): Promise<any[]> {
    try {
      console.log(`📋 جلب طلبات السحب للمستخدم: ${userPhone}`);
      const withdrawRequestsRef = collection(db, 'withdrawRequests');
      const q = query(withdrawRequestsRef, where('userPhone', '==', userPhone));
      const snapshot = await getDocs(q);
      
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ تم جلب ${requests.length} طلب سحب للمستخدم`);
      return requests;
    } catch (error) {
      console.error('❌ خطأ في جلب طلبات السحب للمستخدم:', error);
      return [];
    }
  }

  // وظائف إدارة إعدادات التطبيق
  async getAppSettings(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, 'appSettings'));
      const settings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`جلب ${settings.length} إعداد من Firebase`);
      return settings;
    } catch (error) {
      console.error('خطأ في جلب إعدادات التطبيق:', error);
      return [];
    }
  }

  async createAppSetting(settingData: any): Promise<any> {
    try {
      const docRef = await addDoc(collection(db, 'appSettings'), {
        ...settingData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`تم إنشاء إعداد جديد: ${settingData.key}`);
      return {
        id: docRef.id,
        ...settingData
      };
    } catch (error) {
      console.error('خطأ في إنشاء إعداد التطبيق:', error);
      throw error;
    }
  }

  async updateAppSetting(settingId: string, settingData: any): Promise<any> {
    try {
      const settingRef = doc(db, 'appSettings', settingId);
      await updateDoc(settingRef, {
        ...settingData,
        updatedAt: new Date()
      });
      
      console.log(`تم تحديث الإعداد: ${settingId}`);
      return {
        id: settingId,
        ...settingData
      };
    } catch (error) {
      console.error('خطأ في تحديث إعداد التطبيق:', error);
      throw error;
    }
  }

  async deleteAppSetting(settingId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'appSettings', settingId));
      console.log(`تم حذف الإعداد: ${settingId}`);
      return true;
    } catch (error) {
      console.error('خطأ في حذف إعداد التطبيق:', error);
      return false;
    }
  }

  // إدارة محادثات الدعم
  async createSupportMessage(messageData: any): Promise<any> {
    try {
      const messagesRef = collection(db, 'supportMessages');
      const docRef = await addDoc(messagesRef, {
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeletedByCustomer: false,
        isReadByAdmin: false
      });
      
      return {
        id: docRef.id,
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('خطأ في إنشاء رسالة الدعم:', error);
      throw error;
    }
  }

  async getSupportMessages(customerId?: string): Promise<any[]> {
    try {
      const messagesRef = collection(db, 'supportMessages');
      let messagesQuery;
      
      if (customerId) {
        messagesQuery = query(
          messagesRef, 
          where('customerId', '==', customerId),
          where('isDeletedByCustomer', '==', false),
          orderBy('createdAt', 'desc')
        );
      } else {
        messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'));
      }
      
      const messagesSnapshot = await getDocs(messagesQuery);
      return messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('خطأ في جلب رسائل الدعم:', error);
      return [];
    }
  }

  async markSupportMessageAsDeletedByCustomer(messageId: string): Promise<boolean> {
    try {
      const messageRef = doc(db, 'supportMessages', messageId);
      await updateDoc(messageRef, {
        isDeletedByCustomer: true,
        deletedByCustomerAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('خطأ في تحديث حالة الرسالة:', error);
      return false;
    }
  }

  async markSupportMessageAsReadByAdmin(messageId: string): Promise<boolean> {
    try {
      const messageRef = doc(db, 'supportMessages', messageId);
      await updateDoc(messageRef, {
        isReadByAdmin: true,
        readByAdminAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('خطأ في تحديث حالة القراءة:', error);
      return false;
    }
  }

  async deleteSupportMessagePermanently(messageId: string): Promise<boolean> {
    try {
      const messageRef = doc(db, 'supportMessages', messageId);
      await deleteDoc(messageRef);
      return true;
    } catch (error) {
      console.error('خطأ في حذف الرسالة نهائياً:', error);
      return false;
    }
  }

  // دوال الدعم الفني
  async getSupportMessages(): Promise<any[]> {
    try {
      const messagesRef = collection(db, 'supportMessages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('خطأ في جلب رسائل الدعم:', error);
      return [];
    }
  }

  async createSupportMessage(messageData: any): Promise<any> {
    try {
      const messagesRef = collection(db, 'supportMessages');
      const docRef = await addDoc(messagesRef, {
        ...messageData,
        createdAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...messageData
      };
    } catch (error) {
      console.error('خطأ في إنشاء رسالة دعم:', error);
      throw error;
    }
  }

  async markSupportMessagesAsRead(customerPhone: string): Promise<void> {
    try {
      const messagesRef = collection(db, 'supportMessages');
      const q = query(messagesRef, where('customerPhone', '==', customerPhone));
      const snapshot = await getDocs(q);
      
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { isReadByAdmin: true })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('خطأ في تحديث حالة القراءة:', error);
      throw error;
    }
  }

  async deleteSupportMessages(customerPhone: string): Promise<void> {
    try {
      const messagesRef = collection(db, 'supportMessages');
      const q = query(messagesRef, where('customerPhone', '==', customerPhone));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('خطأ في حذف رسائل الدعم:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();