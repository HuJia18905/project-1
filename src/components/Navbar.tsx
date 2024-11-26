import React from 'react';
import { ShoppingCart, Search, Menu, User, Camera } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import CartDrawer from './CartDrawer';
import GestureDetector from './GestureDetector';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isGestureDetectorOpen, setIsGestureDetectorOpen] = React.useState(false);
  const { items } = useCart();

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Menu className="h-6 w-6 mr-4 cursor-pointer md:hidden" />
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
              shopify
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-gray-900">Shop</Link>
            <Link to="/categories" className="text-gray-700 hover:text-gray-900">Categories</Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900">About</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="hover:bg-gray-100 p-2 rounded-full">
              <Search className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setIsGestureDetectorOpen(!isGestureDetectorOpen)}
              className="hover:bg-gray-100 p-2 rounded-full"
            >
              <Camera className="h-6 w-6 text-gray-600" />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="hover:bg-gray-100 p-2 rounded-full relative"
            >
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="hover:bg-gray-100 p-2 rounded-full flex items-center"
              >
                <User className="h-6 w-6 text-gray-600" />
              </button>
              {isUserMenuOpen && <UserMenu onClose={() => setIsUserMenuOpen(false)} />}
            </div>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <GestureDetector isOpen={isGestureDetectorOpen} onClose={() => setIsGestureDetectorOpen(false)} />
    </nav>
  );
}