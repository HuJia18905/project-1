import React, { useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../lib/types';

interface ProductGridProps {
  selectedIndex?: number;
  onProductSelect?: (product: Product) => void;
}

export default function ProductGrid({ selectedIndex = -1, onProductSelect }: ProductGridProps) {
  const { products, loading, error } = useProducts();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedIndex >= 0 && gridRef.current) {
      const productElements = gridRef.current.children;
      if (productElements[selectedIndex]) {
        productElements[selectedIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [selectedIndex]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load products. Please try again later.</p>
      </div>
    );
  }

  return (
    <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={`transition-all duration-300 ${
            selectedIndex === index ? 'ring-4 ring-blue-500 rounded-lg' : ''
          }`}
        >
          <ProductCard
            id={product.id}
            image={product.image_url}
            name={product.name}
            price={product.price}
            category={product.category}
            isSelected={selectedIndex === index}
            onClick={() => onProductSelect?.(product)}
          />
        </div>
      ))}
    </div>
  );
}