import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Archive, 
  Cog, 
  FolderKanban,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { useTheme } from '@/context/ThemeContext';
import toast from 'react-hot-toast';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

interface DashboardNavbarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onCollapsedChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  const navItems: NavItem[] = [
    { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders' },
    { name: 'Items', icon: <Package size={20} />, path: '/items' },
    { name: 'Storage', icon: <Archive size={20} />, path: '/storage' },
    { name: 'Machine', icon: <Cog size={20} />, path: '/machine' },
    { name: 'Project', icon: <FolderKanban size={20} />, path: '/project' },
    { name: 'Management', icon: <Settings size={20} />, path: '/management' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login2');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`h-screen bg-brand-secondary dark:bg-[hsl(var(--nav-background))] dark:border-r dark:border-border flex flex-col fixed left-0 top-0 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white dark:bg-brand-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="w-6 h-6 bg-brand-primary rounded"></div>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-white dark:text-foreground text-xl font-bold whitespace-nowrap">ERP Solution</h1>
            </div>
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <button
        onClick={handleToggleCollapse}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-white hover:bg-brand-primary-hover transition-colors z-10"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-muted hover:text-white dark:hover:text-foreground'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : ''}
              >
                {item.icon}
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile, Theme Toggle & Logout */}
      <div className="p-4 border-t border-white/10 dark:border-border">
        {/* User Profile Section */}
        {user && !isCollapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-3 text-muted-foreground">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white dark:text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        {user && isCollapsed && (
          <div className="flex justify-center mb-3">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center" title={user.name}>
              <User size={16} className="text-white" />
            </div>
          </div>
        )}
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 px-4 py-2 w-full rounded-lg text-muted-foreground hover:bg-brand-primary/10 hover:text-brand-primary transition-all mb-2 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? (theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode') : ''}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          {!isCollapsed && (
            <span className="font-medium">
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-2 w-full rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Log out' : ''}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Log out</span>}
        </button>
      </div>
    </div>
  );
};

export default DashboardNavbar;
