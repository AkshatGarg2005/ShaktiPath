import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import InputField from '../components/ui/InputField';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const validateForm = () => {
    const newErrors: { 
      name?: string; 
      email?: string; 
      password?: string; 
      confirmPassword?: string;
    } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await register(name, email, password);
      showToast({
        title: 'Success',
        message: 'Your account has been created!',
        type: 'success',
      });
      navigate('/map');
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Could not create account. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strengthClass = () => {
    const score = passwordStrength();
    if (score === 0) return 'bg-gray-200';
    if (score === 1) return 'bg-red-500';
    if (score === 2) return 'bg-yellow-500';
    if (score === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join ShaktiPath and navigate safely</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <InputField 
              label="Full Name"
              type="text"
              icon={<User size={18} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="Jane Doe"
            />
            
            <InputField 
              label="Email Address"
              type="email"
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
            />
            
            <div>
              <InputField 
                label="Password"
                type="password"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••"
              />
              
              {password && (
                <div className="mt-2">
                  <div className="flex h-2 overflow-hidden bg-gray-200 rounded">
                    <div className={`${strengthClass()} h-2 transition-all duration-300`} style={{ width: `${passwordStrength() * 25}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {passwordStrength() === 0 && "Enter a password"}
                    {passwordStrength() === 1 && "Weak password"}
                    {passwordStrength() === 2 && "Fair password"}
                    {passwordStrength() === 3 && "Good password"}
                    {passwordStrength() === 4 && "Strong password"}
                  </p>
                </div>
              )}
            </div>
            
            <InputField 
              label="Confirm Password"
              type="password"
              icon={<CheckCircle size={18} />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-700 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the <a href="#" className="text-blue-700 hover:text-blue-800">Terms of Service</a> and <a href="#" className="text-blue-700 hover:text-blue-800">Privacy Policy</a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-700 hover:text-blue-800">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;