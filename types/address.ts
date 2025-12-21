// Address entity types
export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressesResponse {
  data: Address[];
  total: number;
}

