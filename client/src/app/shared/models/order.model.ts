export interface Order {
  orderId: number;
  userId: number;
  productIds: string[];
  totalAmount: number;
  createdAt: string;
}
