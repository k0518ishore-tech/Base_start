import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Landmark,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await login(email, password);
      showToast(`Welcome back, ${data.user.fullName}!`, 'success');

      if (data.user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        const destination = from === '/admin' ? '/dashboard' : from;
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gov-border p-8 shadow-card space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-gov-primary flex items-center justify-center text-white mx-auto mb-2 shadow-sm">
            <Landmark className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-xl font-extrabold text-gov-primary tracking-tight">
            Citizen & Admin Login
          </h2>
          <p className="text-xs text-gov-muted">
            Sign in to access your scheme engine dashboard and modules
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. citizen@schemegov.in"
            icon={Mail}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password <span className="text-gov-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full rounded-lg border border-gov-border bg-white text-xs text-gov-text px-3.5 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gov-secondary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full shadow-sm mt-2 text-xs font-bold"
          >
            Sign In to Portal
          </Button>
        </form>

        {/* Toggle to Sign Up */}
        <div className="text-center pt-2 text-xs text-gov-muted border-t border-slate-100 flex items-center justify-center gap-1.5">
          <span>New user?</span>
          <Link to="/register" className="font-bold text-gov-secondary hover:underline">
            Create Free Citizen Account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
