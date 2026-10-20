import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: 'Weak', color: 'bg-rose-500 text-rose-700' };
    if (score <= 3) return { label: 'Moderate', color: 'bg-amber-500 text-amber-700' };
    return { label: 'Strong', color: 'bg-emerald-500 text-emerald-700' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName,
        email,
        phone,
        password,
        confirmPassword,
      });

      showToast('Account created successfully! All modules are now unlocked.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
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
            Register Citizen Account
          </h2>
          <p className="text-xs text-gov-muted">
            Create your account to unlock all government scheme modules and rule evaluations
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
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
            icon={User}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. rajesh@example.com"
            icon={Mail}
            required
          />

          <Input
            label="Mobile Phone (Optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 9876543210"
            icon={Phone}
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
                placeholder="At least 6 characters"
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
            {password && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      strength.label === 'Weak'
                        ? 'w-1/3 bg-rose-500'
                        : strength.label === 'Moderate'
                        ? 'w-2/3 bg-amber-500'
                        : 'w-full bg-emerald-500'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">
                  Strength: {strength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm Password <span className="text-gov-error">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full rounded-lg border border-gov-border bg-white text-xs text-gov-text px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full shadow-sm mt-2 text-xs font-bold"
          >
            Create Citizen Account & Unlock Modules
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-gov-muted border-t border-slate-100 flex items-center justify-center gap-1.5">
          <span>Already have an account?</span>
          <Link to="/login" className="font-bold text-gov-secondary hover:underline">
            Sign In Here &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
