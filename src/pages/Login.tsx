import React, { useState, useRef, useEffect } from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';
import { FiLock } from "react-icons/fi";

const TARGET_TEXT = "SIGN IN";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const ENCRYPTION_DURATION = 3000;
const CHARS = "!@#$%^&*():{};|,.<>/?";

const EncryptButton = ({ submitting, isAnimating, text, onClick }: { submitting: boolean, isAnimating: boolean, text: string, onClick: () => void }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{
        scale: 0.975,
      }}
      disabled={submitting}
      className={`group relative overflow-hidden rounded-md border-[1px] border-gray-300 bg-gray-100 px-3 py-1 font-mono font-medium uppercase text-gray-700 transition-colors hover:bg-gray-200 hover:text-indigo-600 ${submitting ? 'opacity-70 cursor-wait' : ''}`}
    >
      <div className="relative z-10 flex items-center gap-2">
        <FiLock className="h-4 w-4" />
        <span className="text-sm">{text}</span>
      </div>
      <motion.span
        initial={{
          y: "100%",
        }}
        animate={{
          y: isAnimating ? "-100%" : "100%",
        }}
        transition={{
          repeat: Infinity,
          repeatType: "mirror",
          duration: 1,
          ease: "linear",
        }}
        className="duration-300 absolute inset-0 z-0 scale-125 bg-gradient-to-t from-indigo-400/0 from-40% via-indigo-400/100 to-indigo-400/0 to-60% opacity-0 transition-opacity group-hover:opacity-100"
      />
    </motion.button>
  );
};

const SkeletonLoginForm = () => (
  <div className="max-w-md w-full space-y-8 p-4 sm:p-8 bg-white rounded-lg shadow-md animate-pulse">
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full"></div>
      <h2 className="mt-4 text-2xl font-bold text-gray-400">
        Loading...
      </h2>
    </div>
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded-md"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);

export default function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const intervalRef = useRef<any>(null);
  const [text, setText] = useState(TARGET_TEXT);
  const [isEncrypting, setIsAnimating] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
    setAuthError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
    setAuthError(null);
  };

  const scramble = () => {
    let pos = 0;

    intervalRef.current = setInterval(() => {
      const scrambled = TARGET_TEXT.split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }

          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          const randomChar = CHARS[randomCharIndex];

          return randomChar;
        })
        .join("");

      setText(scrambled);
      pos++;

      if (pos >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
        pos = 0;
      }
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setText(TARGET_TEXT);
  };

  const handleEmailAuth = async () => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    setAuthError(null);
    setIsAnimating(true);
    scramble();
    try {
      await new Promise((resolve) => setTimeout(resolve, ENCRYPTION_DURATION));
      await signInWithEmail(email, password);
    } catch (error: any) {
      setAuthError(error.message || 'Invalid email or password');
    } finally {
      setIsAnimating(false);
      stopScramble();
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
  };

  return (
    <div className={`min-h-[80vh] flex items-center justify-center bg-gray-50 ${loading ? 'login-loading' : ''}`}>
      
        <div className="max-w-md w-full space-y-8 p-4 sm:p-8 bg-white rounded-lg shadow-md">
          <Toaster position="top-center" />
          <div className="text-center">
            <LogIn className="mx-auto h-12 w-12 text-indigo-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.form
              key="signin"
              className="space-y-4"
              onSubmit={(e) => e.preventDefault()}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {authError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{authError}</span>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className={`input-field ${emailError ? 'border-red-500' : ''}`}
                  placeholder="Email address"
                  autoComplete="username"
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={`input-field ${passwordError ? 'border-red-500' : ''}`}
                  placeholder="Password"
                  minLength={6}
                  autoComplete="current-password"
                />
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>
              <div>
                <EncryptButton submitting={loading} isAnimating={isEncrypting} text={text} onClick={handleEmailAuth} />
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
    </div>
  );
}
