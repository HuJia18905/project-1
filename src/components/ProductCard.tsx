import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Product } from '../lib/types';

interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  category: string;
  id: string;
  isSelected?: boolean;
}

export default function ProductCard({ 
  image, 
  name, 
  price, 
  category, 
  id,
  isSelected 
}: ProductCardProps) {
  const { addToCart } = useCart();
  const product: Product = { id, name, price, category, image_url: image };

  return (
    <div 
      className={`product-card group relative ${
        isSelected ? 'ring-4 ring-blue-500 rounded-lg transform scale-105 transition-all duration-300' : ''
      }`}
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
        />
        <button className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white">
          <Heart className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">{name}</h3>
          <p className="mt-1 text-xs text-gray-500">{category}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">${price}</p>
      </div>
      <button
        onClick={() => addToCart(product)}
        className="mt-2 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
      </button>
    </div>
  );
}