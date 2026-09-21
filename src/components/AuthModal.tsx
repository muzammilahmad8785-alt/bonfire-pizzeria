import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onAdminLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'login',
  onAdminLoginSuccess
}) => {
  const { loginWithEmail, registerWithEmail, signInWithGoogle, loginAsDedicatedAdmin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const cleanInput = email.trim().toLowerCase();
        // Check for the user requested admin login
        if (cleanInput === 'muzammil@1234' || cleanInput === 'muzammil@1234.com') {
          const success = await loginAsDedicatedAdmin(email, password);
          if (success) {
            soundFx.playOrderSuccess();
            onClose();
            if (onAdminLoginSuccess) onAdminLoginSuccess();
            return;
          } else {
            throw new Error('Incorrect admin credentials. Use pass: Malik@1234');
          }
        }

        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name');
        await registerWithEmail(name, email, password, phone);
      }
      soundFx.playOrderSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Authentication failed. Please try again.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        msg = 'Please use Google Sign-in above or verify your credentials.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    soundFx.playClick();
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      soundFx.playOrderSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in was closed or failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick auto-fill button for admin
  const fillAdminCredentials = () => {
    soundFx.playClick();
    setEmail('Muzammil@1234');
    setPassword('Malik@1234');
    setMode('login');
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn flex items-center justify-center touch-scroll"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundFx.playClick();
          onClose();
        }
      }}
    >
      <div 
        id="auth-modal" 
        className="relative w-full max-w-md max-h-[92dvh] sm:max-h-[88vh] my-auto bg-[#121216] border border-zinc-800 rounded-3xl shadow-2xl overflow-y-auto overscroll-y-contain p-6 sm:p-8 space-y-5 animate-scaleUp touch-scroll"
      >
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <span className="inline-block text-amber-500 font-['Teko'] text-3xl font-bold tracking-wider uppercase leading-none">
            BONFIRE PIZZERIA
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            {mode === 'login' ? 'Sign In' : 'Create Customer Account'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login' 
              ? 'Customer orders & Staff Admin Console login.' 
              : 'Join Bonfire Pizzeria to track orders in real time.'}
          </p>
        </div>

        {/* Dedicated Admin Quick-Fill Banner */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] text-zinc-300">
              Admin Login: <strong className="text-amber-400">Muzammil@1234</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase text-[10px] tracking-wider transition-colors shrink-0"
          >
            Auto-Fill
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Quick Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-white text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center">
          <div className="flex-1 border-t border-zinc-800"></div>
          <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500">OR EMAIL / USER</span>
          <div className="flex-1 border-t border-zinc-800"></div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Muzammil Ahmad"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Multan Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              {mode === 'login' ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'login' ? 'Muzammil@1234 or email' : 'youremail@example.com'}
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl font-['Teko'] text-xl font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="text-sm normal-case font-semibold">Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-5 h-5" />
                SIGN IN
              </>
            ) : (
              'CREATE ACCOUNT'
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/80">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMode('register');
                }}
                className="text-amber-400 font-bold hover:underline ml-1"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMode('login');
                }}
                className="text-amber-400 font-bold hover:underline ml-1"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
