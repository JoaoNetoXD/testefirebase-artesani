
// Este arquivo foi removido - todos os dados agora vêm do Supabase
// Use os serviços em /lib/services/ para acessar dados reais
import type { Product, Category } from './types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Medicamentos', slug: 'medicamentos' },
  { id: '2', name: 'Cosméticos', slug: 'cosmeticos' },
  { id: '3', name: 'Suplementos', slug: 'suplementos' },
  { id: '4', name: 'Manipulados', slug: 'manipulados' },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Analgésico Potente',
    description: 'Alívio rápido para dores intensas. Fórmula especializada para conforto imediato. Consulte seu médico.',
    price: 25.99,
    stock: 100,
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    category_name: 'Medicamentos', // Alterado de category para category_name
    slug: 'analgesico-potente',
    ingredients: 'Paracetamol, Cafeína',
    intendedUses: 'Alívio de dores de cabeça, dores musculares',
  },
  {
    id: '2',
    name: 'Creme Hidratante Facial',
    description: 'Pele macia e hidratada por 24 horas. Enriquecido com vitaminas e extratos naturais.',
    price: 59.90,
    stock: 50,
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    category_name: 'Cosméticos', // Alterado de category para category_name
    slug: 'creme-hidratante-facial',
    ingredients: 'Ácido Hialurônico, Vitamina E, Aloe Vera',
    intendedUses: 'Hidratação profunda da pele do rosto, prevenção de rugas',
  },
  {
    id: '3',
    name: 'Vitamina C Efervescente',
    description: 'Reforce sua imunidade com Vitamina C de alta absorção. Sabor laranja.',
    price: 32.50,
    stock: 200,
    images: ['https://placehold.co/600x400.png'],
    category_name: 'Suplementos', // Alterado de category para category_name
    slug: 'vitamina-c-efervescente',
    ingredients: 'Ácido Ascórbico (Vitamina C)',
    intendedUses: 'Suplementação de Vitamina C, fortalecimento do sistema imunológico',
  },
  {
    id: '4',
    name: 'Shampoo Antiqueda Manipulado',
    description: 'Fórmula exclusiva para fortalecimento capilar e combate à queda. Personalizado para você.',
    price: 75.00,
    stock: 30,
    images: ['https://placehold.co/600x400.png'],
    category_name: 'Manipulados', // Alterado de category para category_name
    slug: 'shampoo-antiqueda-manipulado',
    ingredients: 'Minoxidil, Biotina, Extratos Vegetais',
    intendedUses: 'Tratamento da queda de cabelo, estímulo ao crescimento capilar',
  },
  {
    id: '5',
    name: 'Protetor Solar FPS 50',
    description: 'Alta proteção contra raios UVA/UVB. Toque seco e rápida absorção. Ideal para pele oleosa.',
    price: 45.00,
    stock: 80,
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    category_name: 'Cosméticos', // Alterado de category para category_name
    slug: 'protetor-solar-fps-50',
    ingredients: 'Dióxido de Titânio, Óxido de Zinco, Vitamina E',
    intendedUses: 'Proteção solar diária, prevenção de queimaduras e envelhecimento precoce',
  },
];

// Esta função não é mais necessária, pois os dados vêm do Supabase
// export const getProductBySlug = (slug: string): Product | undefined => {
//   return mockProducts.find(p => p.slug === slug);
// };

