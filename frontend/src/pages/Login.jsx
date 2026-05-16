import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('username', username);
      navigate('/chat');
      window.location.reload(); // Refresh to update App.jsx state
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex justify-center">
          <div className="h-14 w-14 bg-blue-600/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/20">
            <Stethoscope className="text-blue-500 h-9 w-9" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-4xl font-bold tracking-tight text-white font-display">
          Pharma Intelligence
        </h2>
        <p className="mt-3 text-center text-sm text-slate-400">
          Sign in to your intelligent assistant
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <div className="glass-card py-10 px-4 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm backdrop-blur-md">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 ml-1">Username</label>
              <div className="mt-2">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="mt-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                Sign in
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-transparent text-slate-500">
                  New to Pharma Intelligence?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
