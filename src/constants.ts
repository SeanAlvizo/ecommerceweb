import { Product, Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'lighting',
    name: 'Lighting',
    description: 'Precision-engineered illumination for architectural spaces.',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Sculptural forms meeting ergonomic excellence.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'objects',
    name: 'Objects',
    description: 'Curated artifacts for the modern collector.',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=800',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'luna-pendant',
    name: 'Luna Pendant',
    description: 'A hand-blown glass sphere that mimics the soft glow of the moon. Features a precision-machined brass fitting.',
    price: 1250,
    category: 'lighting',
    images: [
      'https://images.unsplash.com/photo-1543198126-a8ad8e47fb21?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=1200',
    ],
    specs: {
      Material: 'Hand-blown Glass, Brass',
      Dimensions: '30cm Diameter',
      Bulb: 'Integrated LED 2700K',
      Voltage: '110-240V',
    },
    featured: true,
  },
  {
    id: 'axis-chair',
    name: 'Axis Lounge Chair',
    description: 'An exploration of geometric balance. The Axis chair features a cantilevered steel frame and premium Italian leather.',
    price: 3400,
    category: 'furniture',
    images: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200',
    ],
    specs: {
      Material: 'Stainless Steel, Full-grain Leather',
      Dimensions: '80cm x 75cm x 70cm',
      Origin: 'Italy',
    },
    featured: true,
  },
  {
    id: 'monolith-vase',
    name: 'Monolith Vase',
    description: 'Carved from a single block of Nero Marquina marble. Each piece features unique veining patterns.',
    price: 850,
    category: 'objects',
    images: [
      'https://images.unsplash.com/photo-1612115539052-fc604433d7b8?auto=format&fit=crop&q=80&w=1200',
    ],
    specs: {
      Material: 'Nero Marquina Marble',
      Dimensions: '15cm x 15cm x 40cm',
      Weight: '12kg',
    },
  },
  {
    id: 'vector-desk-lamp',
    name: 'Vector Desk Lamp',
    description: 'A minimalist task light with a counterweighted arm for effortless adjustment.',
    price: 580,
    category: 'lighting',
    images: [
      'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=1200',
    ],
    specs: {
      Material: 'Anodized Aluminum',
      Dimensions: '60cm Height',
      Features: 'Dimmable Touch Sensor',
    },
  },
];
