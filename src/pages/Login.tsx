import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Lock, User } from 'lucide-react';
import { storageService } from '../services/storageService';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (storageService.login(username, password)) {
      navigate('/');
    } else {
      setError('Invalid credentials. Try admin / password');
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-brand-100">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
            <Plane size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Travel Agent Portal</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Enter username" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="••••••••" required />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg shadow-lg">Sign In</button>
          <p className="text-xs text-center text-gray-400 mt-4">Demo Access: admin / password</p>
        </form>
      </div>
    </div>
  );
};
