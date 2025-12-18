import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, ArrowRight, Github, Chrome, 
  AlertCircle, Sparkles, Command, Cpu 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Configuration ---
const BACKEND_URL = "http://localhost:5000";

// --- Utility ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

// --- 1. Elite Input Component ---
const InputField = ({ icon: Icon, type, placeholder, value, onChange }) => (
  <div className="group relative">
    {/* Icon */}
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors duration-300 group-focus-within:text-blue-400">
      <Icon size={18} />
    </div>
    
    {/* Input */}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-white/10 bg-neutral-900/50 py-3.5 pl-12 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-blue-500/5 focus:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] hover:border-white/20"
    />
    
    {/* Focus Glow Line (Bottom) */}
    <div className="absolute bottom-0 left-4 right-4 h-[1px] scale-x-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-transform duration-500 group-focus-within:scale-x-100" />
  </div>
);

// --- 2. Social Button ---
const SocialButton = ({ icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] py-3 text-sm font-medium text-neutral-400 transition-all hover:border-white/20 hover:bg-white/[0.05] hover:text-white active:scale-95"
  >
    <Icon size={18} className="transition-transform group-hover:scale-110" />
    <span>{label}</span>
  </button>
);

// --- 3. Visual Side Component (Fixed Height) ---
const BrandPanel = () => (
  <div className="relative hidden h-full w-1/2 flex-col justify-between overflow-hidden border-r border-white/5 bg-[#0A0A0A] p-12 lg:flex">
    {/* Ambient Background */}
    <div className="absolute inset-0 z-0">
      <div className="absolute -top-[20%] -left-[20%] h-[800px] w-[800px] rounded-full bg-blue-600/5 blur-[120px]" />
      <div className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/5 blur-[100px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
    </div>

    {/* Brand Logo */}
    <div className="relative z-10 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
        <Sparkles size={20} className="text-white" />
      </div>
      <span className="text-xl font-bold tracking-tight text-white">Prompt Studio X</span>
    </div>

    {/* Central Visual */}
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
      <div className="relative h-64 w-64">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-20 blur-3xl animate-pulse" />
        
        <div className="absolute inset-0 flex items-center justify-center">
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1 }}
               className="relative h-32 w-32 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
             >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                    <Command size={40} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
             </motion.div>
        </div>
        
        {/* Floating Badges */}
        <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-8 top-10 rounded-xl border border-white/10 bg-neutral-900/90 p-3 shadow-xl backdrop-blur-md"
        >
            <div className="flex items-center gap-2 text-xs font-medium text-blue-300">
                <Sparkles size={12} />
                <span>AI Enhanced</span>
            </div>
        </motion.div>
        
        <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-8 bottom-10 rounded-xl border border-white/10 bg-neutral-900/90 p-3 shadow-xl backdrop-blur-md"
        >
            <div className="flex items-center gap-2 text-xs font-medium text-purple-300">
                <Cpu size={12} />
                <span>Optimized</span>
            </div>
        </motion.div>
      </div>
    </div>

    {/* Footer Text */}
    <div className="relative z-10 max-w-md">
      <p className="text-2xl font-medium leading-tight text-white">
        "The interface between human creativity and artificial intelligence."
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
        <span>v2.0 Neural Engine Online</span>
      </div>
    </div>
  </div>
);

// --- MAIN PAGE ---
const LoginPage = () => {
  // Logic from New Code
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    // Simplified Logic as requested
    setError("Email OTP temporarily disabled. Use Google or GitHub.");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black font-sans text-white">
      
      {/* LEFT: BRAND PANEL (Design from Old Code) */}
      <BrandPanel />

      {/* RIGHT: FORM AREA */}
      <div className="flex h-full w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600">
                <Sparkles size={24} className="text-white" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Choose your preferred sign-in method.
            </p>
          </div>

          {/* Error Display (Adapted for New Logic) */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200"
            >
                <AlertCircle size={16} className="shrink-0" />
                {error}
            </motion.div>
          )}

          {/* Social Buttons (Connected to New Logic) */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <SocialButton icon={Github} label="GitHub" onClick={handleGithubLogin} />
            <SocialButton icon={Chrome} label="Google" onClick={handleGoogleLogin} />
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-medium uppercase text-neutral-500">Or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Email Form (Design from Old Code, Logic from New Code) */}
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
            <InputField
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="mt-4">
                <button
                    type="submit"
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white py-3.5 text-sm font-bold text-black transition-all hover:bg-neutral-200 active:scale-95"
                >
                  <span>Send Login Code</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
            </div>
          </form>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;