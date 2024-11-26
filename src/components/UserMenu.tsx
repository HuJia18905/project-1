import React, { useEffect, useRef } from 'react';
import { LogIn, UserPlus, User, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  onClose: () => void;
}

export default function UserMenu({ onClose }: UserMenuProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  return (
    <div ref={menuRef} className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
      <button
        onClick={() => handleNavigation('/')}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Home className="h-4 w-4 mr-2" />
        Home
      </button>
      {!user ? (
        <>
          <button
            onClick={() => handleNavigation('/login')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </button>
          <button
            onClick={() => handleNavigation('/register')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Register
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => handleNavigation('/profile')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </>
      )}
    </div>
  );
}