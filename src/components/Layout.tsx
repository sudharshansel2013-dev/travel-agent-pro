import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut, Plane, Menu, X } from 'lucide-react';
import { storageService } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    storageService.logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/invoices', label: 'Invoices', icon: FileText },
    { path: '/quotes', label: 'Quotations', icon: FileText },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex print:bg-white print:block">
      <div className="lg:hidden fixed top-0 w-full bg-white z-20 border-b p-4 flex justify-between items-center print:hidden">
        <span className="font-bold text-xl flex items-center gap-2 text-brand-600">
          <Plane className="h-6 w-6" /> TravelPro
        </span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        print:hidden
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-2 font-bold text-xl">
          <Plane className="text-sky-400" />
          <span>TravelPro</span>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-brand-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-x-hidden print:p-0 print:m-0 print:w-full">
        {children}
      </main>
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-0 lg:hidden print:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};
