
import { MenuItem, Order, MealType, CanteenConfig, OrderStatus, Feedback } from '../types';
import { dbService } from './dbService';

const T_MENU = 'canteen_menu';
const T_ORDERS = 'canteen_orders';
const T_FEEDBACK = 'canteen_feedback';
const K_CONFIG = 'canteen_config';

export const canteenService = {
  getConfig: (): CanteenConfig => {
    const saved = localStorage.getItem(K_CONFIG);
    const menu = dbService.getTable<MenuItem>(T_MENU);
    if (saved) {
      const config = JSON.parse(saved);
      return { ...config, menu };
    }
    return {
      isOrderingOpen: { Breakfast: true, Lunch: true, Dinner: true },
      menu
    };
  },

  saveConfig: (config: Omit<CanteenConfig, 'menu'>) => {
    localStorage.setItem(K_CONFIG, JSON.stringify(config));
  },

  getOrders: (): Order[] => dbService.getTable<Order>(T_ORDERS),

  hasOrderedForSlot: (userEmail: string, type: MealType): boolean => {
    const orders = canteenService.getOrders();
    const today = new Date().toDateString();
    return orders.some(o => 
      o.studentEmail === userEmail && 
      o.type === type && 
      o.status === 'Pending' &&
      new Date(o.timestamp).toDateString() === today
    );
  },

  placeOrder: (studentId: string, userEmail: string, items: { name: string; quantity: number }[], type: MealType): Order => {
    if (canteenService.hasOrderedForSlot(userEmail, type)) {
      throw new Error(`Slot Restricted: Active order for ${type} already exists.`);
    }

    const orderId = `${type.charAt(0)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      studentId,
      studentEmail: userEmail,
      studentName: userEmail.split('@')[0],
      items,
      total: items.reduce((acc, curr) => acc + (curr.quantity * 50), 0),
      status: 'Pending',
      timestamp: Date.now(),
      type,
      feedbackSubmitted: false
    };

    dbService.addRow(T_ORDERS, newOrder);
    return newOrder;
  },

  cancelOrder: (orderId: string, reason: string) => {
    dbService.updateRow<Order>(T_ORDERS, orderId, { status: 'Cancelled', cancelReason: reason });
  },

  updateOrderItems: (orderId: string, items: { name: string; quantity: number }[]) => {
    const total = items.reduce((acc, curr) => acc + (curr.quantity * 50), 0);
    dbService.updateRow<Order>(T_ORDERS, orderId, { items, total });
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const updates: Partial<Order> = { status };
    if (status === 'Served') {
      updates.servedTimestamp = Date.now();
    }
    dbService.updateRow<Order>(T_ORDERS, orderId, updates);
  },

  submitFeedback: (feedback: Feedback) => {
    dbService.addRow(T_FEEDBACK, feedback);
    dbService.updateRow<Order>(T_ORDERS, feedback.orderId, { feedbackSubmitted: true });
  },

  getAllFeedback: (): Feedback[] => dbService.getTable<Feedback>(T_FEEDBACK)
};
