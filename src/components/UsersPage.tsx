import React from 'react';
import { User } from '../types';
import { PlusIcon } from './Icons';

type UsersPageProps = {
  currentUser: User;
  onDataChange: () => void;
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
    {children}
  </div>
);

const UsersPage: React.FC<UsersPageProps> = ({ currentUser }) => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Pengguna</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola pengguna sistem.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-slate-600">
            <strong>Catatan:</strong> Manajemen pengguna melalui Supabase Auth. Pengguna dapat mendaftar sendiri melalui halaman login.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Peran</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-slate-900">{currentUser.name}</td>
                <td className="px-6 py-4">{currentUser.role}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default UsersPage;
