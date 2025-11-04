import React, { useState } from 'react';
import { ArchiveBoxIcon } from './Icons';

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string, role: string) => Promise<void>;
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Guru');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const INPUT_CLASSES = "mt-1 block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        await onSignUp(name, email, password, role);
      } else {
        await onLogin(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="flex flex-col items-center space-y-2 mb-8">
          <div className="bg-blue-600 p-3 rounded-lg">
            <ArchiveBoxIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 text-center">Ringkas Aset</h1>
            <p className="text-sm text-slate-500 text-center">Inventaris Cepat, Laporan Tepat.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
          {isSignUp && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700">Peran</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={INPUT_CLASSES}
                  disabled={isLoading}
                >
                  <option>Admin</option>
                  <option>Guru</option>
                  <option>Penjaga Sekolah</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASSES}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASSES}
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isSignUp ? 'Daftar' : 'Login'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            disabled={isLoading}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
          >
            {isSignUp ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-slate-500">
            {isSignUp
              ? 'Buat akun baru untuk menggunakan aplikasi.'
              : 'Gunakan email dan password untuk login.'}
          </p>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center py-4 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Ringkas Aset.
      </footer>
    </div>
  );
};

export default LoginPage;
