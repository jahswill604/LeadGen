import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './components/dashboard/Dashboard';
import { PublicLayout, HomePage, AboutPage, ServicesPage, ContactPage, AuthPage } from './components/public/PublicPages';
import { User } from './types';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for stored session on mount and listen for changes
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Redirect to dashboard if logged in and on home/login/signup
  useEffect(() => {
    if (!isLoading && user) {
      if (['/', '/login', '/signup'].includes(location.pathname)) {
        navigate('/dashboard');
      }
    }
  }, [user, isLoading, location.pathname, navigate]);

  const handleAuth = (newUser: User) => {
    setUser(newUser);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-100 border-t-gold-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><AuthPage type="login" onAuth={handleAuth} /></PublicLayout>} />
        <Route path="/signup" element={<PublicLayout><AuthPage type="signup" onAuth={handleAuth} /></PublicLayout>} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
