import React, { useEffect, useState } from 'react';
import { User, ShoppingBag, Key, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = React.useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: user?.email || '',
    phone: '',
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        full_name: user.user_metadata.full_name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name }
      });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;
      toast.success('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4">
            <div className="p-6 border-r border-gray-200">
              <div className="space-y-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg ${
                    activeTab === 'profile' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg ${
                    activeTab === 'orders' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg ${
                    activeTab === 'password' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <Key className="h-5 w-5" />
                  <span>Password</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            <div className="col-span-3 p-6">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <h2 className="text-2xl font-bold">Profile Information</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <h2 className="text-2xl font-bold">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Order History</h2>
                  <div className="space-y-4">
                    {/* Order history will be implemented later */}
                    <p className="text-gray-500">No orders found.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}