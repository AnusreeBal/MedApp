export interface Seller {
  id: string;
  name: string;
  email: string;
  pharmacyName: string;
  address: string;
  licenseNumber: string;
  licenseUrl: string;
  approved: boolean;
  createdAt: Date;
}

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image?: string;
  sellerId: string;
  createdAt: Date;
}

// Add empty export to make it a module
export {};