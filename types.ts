export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'customer';
  avatar_url?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'payment_pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: 'upi' | 'cod';
  shipping_address: string;
  utr_reference: string;
  payment_screenshot_url?: string;
  created_at: string;
  items: OrderItem[];
  coupon_code?: string;
  discount_amount?: number;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  alternate_phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  is_active: boolean;
  expires_at?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'Inventory' | 'Packaging' | 'Logistics' | 'Marketing' | 'Operations' | 'Salary' | 'Other';
  date: string;
  created_at: string;
}