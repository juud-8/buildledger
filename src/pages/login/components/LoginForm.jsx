import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import Logo from '../../../components/ui/Logo';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Checkbox } from '../../../components/ui/Checkbox';
import { showInfoToast } from '../../../utils/toastHelper';
import { ENV_CONFIG } from '../../../lib/env';

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect when user is authenticated
  useEffect(() => {
    if (!loading && user) {
      console.log('LoginForm: User is authenticated, redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('LoginForm: Submitting login form with:', formData.email);
    setIsLoading(true);
    setErrors({});

    try {
      console.log('LoginForm: Calling signIn...');
      const result = await signIn(formData.email, formData.password);
      console.log('LoginForm: Sign in result:', result);
      // Don't navigate here - let the useEffect handle it when user state updates
    } catch (error) {
      console.error('LoginForm: Login error:', error);
      setErrors({
        general: error.message || 'Invalid email or password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Google OAuth functionality would need to be configured in Supabase
    showInfoToast('Google OAuth coming soon');
    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Logo variant="vertical" size="xl" />
        </div>
        <CardTitle className="text-2xl">Welcome to BuildLedger</CardTitle>
        <CardDescription>Sign in to manage your construction business</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors?.general && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={16} className="text-destructive mr-2" />
                <p className="text-sm text-destructive">{errors?.general}</p>
              </div>
            </div>
          )}

          <div>
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData?.email}
              onChange={handleInputChange}
              error={errors?.email}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData?.password}
                onChange={handleInputChange}
                error={errors?.password}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox
              id="remember-me"
              label="Remember me"
              checked={rememberMe}
              onCheckedChange={setRememberMe}
              disabled={isLoading}
            />
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="glow"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            className="h-12"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={isLoading}
            iconName="Chrome"
            iconPosition="left"
            className="h-12"
          >
            Continue with Google
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>

        {ENV_CONFIG.IS_DEVELOPMENT && (
          <div className="mt-6 p-4 bg-muted/50 rounded-md w-full">
            <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials:</p>
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p><strong>Email:</strong> demo@buildledger.com</p>
              <p><strong>Password:</strong> demo123456</p>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default LoginForm;