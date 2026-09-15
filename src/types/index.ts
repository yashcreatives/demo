export type FoodCategory =
  | 'Starters'
  | 'South Indian Signature'
  | 'North Indian'
  | 'Biryani'
  | 'Seafood'
  | 'Continental'
  | 'Desserts'
  | 'Beverages';

export type DietType = 'veg' | 'non-veg';

export interface MenuItem {
  id: string;
  name: string;
  category: FoodCategory;
  price: number;
  description: string;
  imageUrl: string;
  dietType: DietType;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  isBestseller?: boolean;
  isChefsSpecial?: boolean;
  isNew?: boolean;
  preparationTimeMinutes?: number;
  calories?: number;
  spiceLevel?: 'Mild' | 'Medium' | 'Spicy' | 'Extra Spicy';
}

export type OrderStatus = 'Confirmed' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  dietType: DietType;
  imageUrl: string;
  customization?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  username?: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  tableNumber?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #AG1024
  customer: {
    id: string;
    name: string;
    mobile: string;
    address?: string;
    tableNumber?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number; // 5% GST
  grandTotal: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  specialInstructions?: string;
  estimatedTimeMinutes?: number;
}

export interface RestaurantStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  todayRevenue: number;
  totalCustomers: number;
  popularItems: { name: string; count: number; revenue: number }[];
}

export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  gstRate: number; // e.g., 0.05 (5%)
  openingHours: string;
  contactNumber: string;
  contactEmail: string;
  address: string;
  isOnlineOrderingOpen: boolean;
  soundAlertsEnabled: boolean;
}
