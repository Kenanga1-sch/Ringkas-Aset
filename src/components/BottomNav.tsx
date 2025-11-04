import React from 'react';
import { User, Role } from '../types';
import { ArchiveBoxIcon, HomeIcon, ReportIcon, UsersIcon } from './Icons';

type View = 'dashboard' | 'inventory' | 'reports' | 'users';

type BottomNavProps = {
  onNavigate: (view: View) => void;
  activeView: View;
  currentUser: User;
  onLogout: () => void;
};

const NAV_ITEMS: { view: View; label: string; icon: React.ReactElement; roles: Role[] }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="w-6 h-6" />, roles: [Role.Admin, Role.Guru, Role.PenjagaSekolah] },
  { view: 'inventory', label: 'Inventaris', icon: <ArchiveBoxIcon className="w-6 h-6" />, roles: [Role.Admin, Role.Guru, Role.PenjagaSekolah] },
  { view: 'reports', label: 'Laporan', icon: <ReportIcon className="w-6 h-6" />, roles: [Role.Admin, Role.Guru, Role.PenjagaSekolah] },
  { view: 'users', label: 'Pengguna', icon: <UsersIcon className="w-6 h-6" />, roles: [Role.Admin] },
];

const BottomNav: React.FC<BottomNavProps> = ({ onNavigate, activeView, currentUser }) => {
  const availableNavItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-20 flex justify-around">
      {availableNavItems.map(item => (
        <button
          key={item.view}
          onClick={() => onNavigate(item.view)}
          className={`flex flex-col items-center justify-center pt-2 pb-1 w-full text-xs font-medium transition-colors ${
            activeView === item.view
              ? 'text-blue-600'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
