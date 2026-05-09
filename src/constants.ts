import { MaterialCost } from './types';

export const RAB_DATA: MaterialCost[] = [
  // PEKERJAAN PERSIAPAN & TANAH
  { category: 'Pekerjaan Persiapan', item: 'Pembersihan Lahan', unit: 'm2', pricePerUnit: { economical: 15000, standard: 20000, premium: 30000 }, quantityPerM2: 1.1 },
  { category: 'Pekerjaan Persiapan', item: 'Bouwplank', unit: 'm1', pricePerUnit: { economical: 35000, standard: 45000, premium: 65000 }, quantityPerM2: 0.8 },
  
  // STRUKTUR
  { category: 'Struktur', item: 'Galian Tanah Pondasi', unit: 'm3', pricePerUnit: { economical: 85000, standard: 100000, premium: 120000 }, quantityPerM2: 0.5 },
  { category: 'Struktur', item: 'Beton Bertulang K-225', unit: 'm3', pricePerUnit: { economical: 4500000, standard: 5500000, premium: 7500000 }, quantityPerM2: 0.35 },
  { category: 'Struktur', item: 'Besi Tulangan', unit: 'kg', pricePerUnit: { economical: 14000, standard: 17000, premium: 22000 }, quantityPerM2: 65 },
  
  // DINDING & KUSEN
  { category: 'Dinding & Kusen', item: 'Pasangan Dinding Bata/Hebel', unit: 'm2', pricePerUnit: { economical: 110000, standard: 150000, premium: 250000 }, quantityPerM2: 2.2 },
  { category: 'Dinding & Kusen', item: 'Pleser & Aci', unit: 'm2', pricePerUnit: { economical: 65000, standard: 85000, premium: 115000 }, quantityPerM2: 4.4 },
  { category: 'Dinding & Kusen', item: 'Kusen Pintu & Jendela Aluminium', unit: 'm1', pricePerUnit: { economical: 125000, standard: 250000, premium: 650000 }, quantityPerM2: 1.5 },
  
  // FINISHING LANTAI & ATAP
  { category: 'Finishing', item: 'Lantai Utama (Keramik/Granit/Marmer)', unit: 'm2', pricePerUnit: { economical: 120000, standard: 350000, premium: 1200000 }, quantityPerM2: 1.05 },
  { category: 'Finishing', item: 'Rangka Atap Baja Ringan', unit: 'm2', pricePerUnit: { economical: 145000, standard: 185000, premium: 250000 }, quantityPerM2: 1.3 },
  { category: 'Finishing', item: 'Penutup Atap (Genteng/Bitumen)', unit: 'm2', pricePerUnit: { economical: 85000, standard: 180000, premium: 450000 }, quantityPerM2: 1.35 },
  
  // PLUMBING & ELEKTRIKAL
  { category: 'MEP', item: 'Titik Lampu & Saklar', unit: 'titik', pricePerUnit: { economical: 150000, standard: 250000, premium: 450000 }, quantityPerM2: 0.4 },
  { category: 'MEP', item: 'Sanitary (Closet, Shower, Sink)', unit: 'set', pricePerUnit: { economical: 2500000, standard: 7500000, premium: 25000000 }, quantityPerM2: 0.05 },
  
  // INTERIOR & FURNITURE
  { category: 'Interior', item: 'Plafon Gypsum & Drop Ceiling', unit: 'm2', pricePerUnit: { economical: 95000, standard: 135000, premium: 220000 }, quantityPerM2: 1 },
  { category: 'Interior', item: 'Pengecatan Interior (Dulux/Setara)', unit: 'm2', pricePerUnit: { economical: 35000, standard: 55000, premium: 95000 }, quantityPerM2: 3.5 },
  { category: 'Interior', item: 'Built-in Kitchen Set', unit: 'm1', pricePerUnit: { economical: 1800000, standard: 3500000, premium: 8500000 }, quantityPerM2: 0.08 },
  { category: 'Interior', item: 'Wallpaper / Wall Panel Accent', unit: 'm2', pricePerUnit: { economical: 50000, standard: 150000, premium: 450000 }, quantityPerM2: 0.2 },
];

export const DESIGN_STYLES = [
  { id: 'modern', name: 'Modern Minimalist', description: 'Garis bersih, bentuk geometris, dan palet warna netral.' },
  { id: 'scandinavian', name: 'Scandinavian', description: 'Fokus pada fungsi, kesederhanaan, dan elemen kayu alami.' },
  { id: 'tropical', name: 'Modern Tropical', description: 'Ventilasi udara maksimal dengan integrasi elemen hijau.' },
  { id: 'industrial', name: 'Industrial Loft', description: 'Eksposur material mentah seperti bata, beton, dan besi.' },
];
