import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, InventoryItem, OrderStatus } from '../types';
import { ordersAPI, inventoryAPI, menuAPI } from '../services/api';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
}

interface DataContextType {
  orders: Order[];
  inventory: InventoryItem[];
  menuItems: MenuItem[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshMenuItems: () => Promise<void>;
  addOrder: (order: any) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateInventoryItem: (item: InventoryItem) => Promise<void>;
  getLowStockItems: () => InventoryItem[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();

      // Transformar datos del backend al formato del frontend
      const transformedOrders = response.orders.map((order: any) => ({
        id: order.id.toString(),
        tableNumber: order.table_number,
        items: order.items.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        })),
        status: order.status,
        total: order.total,
        createdAt: new Date(order.created_at),
        createdBy: order.created_by_name,
        updatedAt: new Date(order.updated_at)
      }));

      setOrders(transformedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll();

      const transformedInventory = response.items.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        minStock: item.min_stock,
        price: item.price,
        supplier: item.supplier,
        lastUpdated: new Date(item.updated_at)
      }));

      setInventory(transformedInventory);
    } catch (error: any) {
      console.error('Error fetching inventory:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.items);
    } catch (error: any) {
      console.error('Error fetching menu:', error.response?.data || error.message);
    }
  };

  const addOrder = async (orderData: any) => {
    try {
      await ordersAPI.create(orderData);
      await refreshOrders();
    } catch (error: any) {
      console.error('Error creating order:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      await refreshOrders();
    } catch (error: any) {
      console.error('Error updating order:', error.response?.data || error.message);
      throw error;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await ordersAPI.delete(orderId);
      await refreshOrders();
    } catch (error: any) {
      console.error('Error deleting order:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    try {
      await inventoryAPI.update(item.id, {
        quantity: item.quantity,
        price: item.price,
        min_stock: item.minStock,
        supplier: item.supplier
      });
      await refreshInventory();
    } catch (error: any) {
      console.error('Error updating inventory:', error.response?.data || error.message);
      throw error;
    }
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity < item.minStock);
  };

  return (
    <DataContext.Provider
      value={{
        orders,
        inventory,
        menuItems,
        loading,
        refreshOrders,
        refreshInventory,
        refreshMenuItems,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        updateInventoryItem,
        getLowStockItems,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
