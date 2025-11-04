import React from 'react';
import { User, Role } from '../types';
import { ArchiveBoxIcon, HomeIcon, ReportIcon, UsersIcon } from './Icons';

type View = 'dashboard' | 'inventory' | 'reports' | 'users';

type HeaderProps = {
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

const Header: React.FC<HeaderProps> = ({ onNavigate, activeView, currentUser, onLogout }) => {
  const availableNavItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20 no-print">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ArchiveBoxIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Ringkas Aset</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Inventaris Cepat, Laporan Tepat.</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-4">
              {availableNavItems.map(item => (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === item.view
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
              </div>
              <button onClick={onLogout} title="Logout" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
