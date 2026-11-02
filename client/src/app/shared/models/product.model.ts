export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  ownerId: number;
}

export type ProductInput = Pick<Product, 'name' | 'price' | 'description'>;
