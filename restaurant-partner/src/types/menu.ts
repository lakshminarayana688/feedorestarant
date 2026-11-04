export type MenuCategory = 
  | 'Biryani' 
  | 'Starters' 
  | 'Main Course' 
  | 'Rice' 
  | 'Breads' 
  | 'Desserts' 
  | 'Beverages';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  rating: number;
  votes: number;
  isBestSeller?: boolean;
  addOns?: { id: string; name: string; price: number }[];
}
