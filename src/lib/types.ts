export type Product = {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  image_url?: string | null;
  stock?: number | null;
  description?: string | null;
  created_at?: string;
};

export type OrderItem = {
  id?: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  whatsapp: string;
  student_id?: string | null;
  major: string;
  gender: string;
  notes?: string | null;
  subtotal: number;
  service_fee: number;
  total: number;
  status: string;
  payment_proof_url?: string | null;
  payment_proof_name?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Settings = {
  id: string;
  whatsapp_number: string;
  bca_account_number: string;
  bca_account_name: string;
  qris_image_url?: string | null;
  service_fee: number;
  ordering_enabled?: boolean;
  order_open_date?: string | null;
  order_close_date?: string | null;
};
