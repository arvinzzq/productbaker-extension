import { v4 as uuidv4 } from 'uuid';
import type { Product, CreateProductInput, UpdateProductInput } from '../types/product';
import { storage } from './storage';

export class ProductManager {
  async getProducts(): Promise<Product[]> {
    try {
      return await storage.getProducts();
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Failed to load products');
    }
  }

  async addProduct(input: CreateProductInput): Promise<Product> {
    try {
      const products = await this.getProducts();
      const now = new Date();
      
      const newProduct: Product = {
        id: uuidv4(),
        ...input,
        createdAt: now,
        updatedAt: now
      };

      const updatedProducts = [...products, newProduct];
      await storage.saveProducts(updatedProducts);
      
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('Failed to add product');
    }
  }

  async updateProduct(id: string, updates: UpdateProductInput): Promise<Product> {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        throw new Error('Product not found');
      }

      const updatedProduct: Product = {
        ...products[productIndex],
        ...updates,
        updatedAt: new Date()
      };

      const updatedProducts = [...products];
      updatedProducts[productIndex] = updatedProduct;
      
      await storage.saveProducts(updatedProducts);
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const products = await this.getProducts();
      const updatedProducts = products.filter(p => p.id !== id);
      
      if (updatedProducts.length === products.length) {
        throw new Error('Product not found');
      }

      await storage.saveProducts(updatedProducts);
      
      // Clear selected product if it was deleted
      const selectedId = await storage.getSelectedProductId();
      if (selectedId === id) {
        await storage.saveSelectedProductId(null);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const products = await this.getProducts();
      return products.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error getting product by id:', error);
      return null;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const products = await this.getProducts();
      if (!query.trim()) return products;

      const lowercaseQuery = query.toLowerCase();
      return products.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.title.toLowerCase().includes(lowercaseQuery) ||
        product.shortDescription.toLowerCase().includes(lowercaseQuery) ||
        product.longDescription.toLowerCase().includes(lowercaseQuery) ||
        product.categories?.some(category => category.toLowerCase().includes(lowercaseQuery)) ||
        product.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const products = await this.getProducts();
      return products.filter(p => p.categories.includes(category));
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  async getAllCategories(): Promise<string[]> {
    try {
      const products = await this.getProducts();
      const categories = new Set(products.flatMap(p => p.categories));
      return Array.from(categories).sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async exportProducts(): Promise<string> {
    try {
      const products = await this.getProducts();
      return JSON.stringify(products, null, 2);
    } catch (error) {
      console.error('Error exporting products:', error);
      throw new Error('Failed to export products');
    }
  }

  async importProducts(data: string, merge: boolean = false): Promise<void> {
    try {
      const importedProducts: Product[] = JSON.parse(data);
      
      // Validate the imported data
      if (!Array.isArray(importedProducts)) {
        throw new Error('Invalid data format');
      }

      // Convert date strings to Date objects
      const validatedProducts = importedProducts.map(product => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }));

      if (merge) {
        const existingProducts = await this.getProducts();
        const mergedProducts = [...existingProducts, ...validatedProducts];
        await storage.saveProducts(mergedProducts);
      } else {
        await storage.saveProducts(validatedProducts);
      }
    } catch (error) {
      console.error('Error importing products:', error);
      throw new Error('Failed to import products');
    }
  }

  async getSelectedProduct(): Promise<Product | null> {
    try {
      const selectedId = await storage.getSelectedProductId();
      if (!selectedId) return null;
      return await this.getProductById(selectedId);
    } catch (error) {
      console.error('Error getting selected product:', error);
      return null;
    }
  }

  async setSelectedProduct(productId: string | null): Promise<void> {
    try {
      await storage.saveSelectedProductId(productId);
    } catch (error) {
      console.error('Error setting selected product:', error);
      throw new Error('Failed to set selected product');
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await storage.clear();
    } catch (error) {
      console.error('Error clearing all product data:', error);
      throw new Error('Failed to clear all product data');
    }
  }
}

export const productManager = new ProductManager();