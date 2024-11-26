export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product: Product;
  created_at?: string;
  updated_at?: string;
}