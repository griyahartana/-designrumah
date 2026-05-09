export type MaterialTier = 'economical' | 'standard' | 'premium';

export interface MaterialCost {
  category: string;
  item: string;
  unit: string;
  pricePerUnit: {
    economical: number;
    standard: number;
    premium: number;
  };
  quantityPerM2: number;
}

export interface DesignChoice {
  style: 'modern' | 'scandinavian' | 'tropical' | 'industrial';
  houseSize: number; // in m2
  tier: MaterialTier;
  rooms: {
    bedroom: number;
    bathroom: number;
    livingRoom: boolean;
    kitchen: boolean;
    garden: boolean;
  };
}

export interface RABItem {
  category: string;
  item: string;
  unit: string;
  quantity: number;
  priceUnit: number;
  total: number;
}

export interface RABSection {
  title: string;
  items: RABItem[];
}
