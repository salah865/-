import fs from 'fs';
import path from 'path';

// نظام تخزين بسيط وموثوق للمنتجات
const PRODUCTS_FILE = path.join(process.cwd(), 'products-data.json');

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId?: number;
  createdAt: Date;
  updatedAt: Date;
}

class SimpleStorage {
  private products: Map<number, Product> = new Map();

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(PRODUCTS_FILE)) {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const productsArray = JSON.parse(data);
        this.products.clear();
        productsArray.forEach((product: Product) => {
          this.products.set(product.id, {
            ...product,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt)
          });
        });
        console.log(`📂 تم تحميل ${this.products.size} منتج من الملف`);
      }
    } catch (error) {
      console.log('خطأ في تحميل البيانات من الملف:', error);
      this.products.clear();
    }
  }

  private saveToFile() {
    try {
      const productsArray = Array.from(this.products.values());
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsArray, null, 2));
      console.log(`💾 تم حفظ ${productsArray.length} منتج في الملف`);
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    
    if (existingProduct) {
      const updatedProduct = {
        ...existingProduct,
        ...data,
        id: id, // التأكد من بقاء المعرف كما هو
        updatedAt: new Date()
      };
      
      this.products.set(id, updatedProduct);
      this.saveToFile();
      console.log(`✅ تم تحديث المنتج ${id}: ${updatedProduct.name}`);
      return updatedProduct;
    }
    
    return undefined;
  }

  async createProduct(data: Partial<Product> & { id: number }): Promise<Product> {
    const product = {
      id: data.id,
      name: data.name || '',
      description: data.description || '',
      price: data.price || 0,
      stock: data.stock || 0,
      imageUrl: data.imageUrl || '',
      categoryId: data.categoryId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.products.set(product.id, product);
    this.saveToFile();
    console.log(`✅ تم إنشاء منتج جديد ${product.id}: ${product.name}`);
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
}

export const simpleStorage = new SimpleStorage();