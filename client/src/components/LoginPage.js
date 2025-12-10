import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, AtSign, ArrowRight, Loader2, Github, Chrome, AlertCircle, KeyRound, ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility Components ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

const InputField = ({ icon: Icon, type, placeholder, value, onChange, autoFocus }) => (
  <div className="group relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-blue-400">
      <Icon size={18} />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
      className="w-full rounded-xl border border-white/5 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-blue-500/50 focus:bg-blue-500/5 focus:ring-1 focus:ring-blue-500/20"
    />
  </div>
);

const SocialButton = ({ icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-neutral-300 transition-all hover:bg-white/10 hover:text-white active:scale-95"
  >
    <Icon size={18} />
    {label}
  </button>
);

// --- MAIN COMPONENT ---
const LoginPage = () => {
  // UI State
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Verification State
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // Form Data (Added Username)
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    name: "", 
    username: "" 
  });

  // Clerk Hooks
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  // --- SOCIAL LOGIN ---
  const handleOAuth = async (strategy) => {
    if (!isSignInLoaded) return;
    try {
        await signIn.authenticateWithRedirect({
            strategy: strategy,
            redirectUrl: "/sso-callback",
            redirectUrlComplete: "/"
        });
    } catch (err) {
        setError("Social login failed. Please try email.");
    }
  };

  // --- SUBMIT: LOGIN OR SIGNUP ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isSignInLoaded || !isSignUpLoaded) return;
    
    // Basic Validation
    if (!formData.email || !formData.password) {
        setError("Please fill in all required fields.");
        return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // --- LOG IN FLOW ---
        const result = await signIn.create({
          identifier: formData.email,
          password: formData.password,
        });

        if (result.status === "complete") {
          await setSignInActive({ session: result.createdSessionId });
        } else {
          // If login requires MFA or other steps
          console.log("Login Step:", result);
          setError("Additional verification required.");
        }
      } else {
        // --- SIGN UP FLOW ---
        // 1. Split Name safely
        const nameParts = formData.name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        // 2. Create Account with ALL fields to prevent "Missing Requirements" error
        await signUp.create({
          emailAddress: formData.email,
          password: formData.password,
          username: formData.username.replace(/\s/g, "").toLowerCase(), // Sanitize username
          firstName: firstName,
          lastName: lastName,
        });

        // 3. Send Email Code
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setPendingVerification(true);
      }
    } catch (err) {
      console.error(err);
      // Clerk errors are an array, take the first one
      const msg = err.errors?.[0]?.message || "Authentication failed.";
      setError(msg.replace("identifier", "Email or Username")); 
    } finally {
      setIsLoading(false);
    }
  };

  // --- VERIFY CODE ---
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) return;
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
      } else if (result.status === "missing_requirements") {
        // This handles the edge case if requirements changed mid-flow
        console.error("Missing:", result.missingFields);
        setError("Account created but data missing. Please try signing up again.");
      } else {
        setError("Verification failed. Code might be expired.");
      }
    } catch (err) {
      console.error(err);
      setError(err.errors?.[0]?.message || "Invalid code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black px-4 font-sans text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-8 backdrop-blur-xl shadow-2xl"
      >
        <AnimatePresence mode="wait">
          
          {/* --- VIEW 1: VERIFICATION CODE --- */}
          {pendingVerification ? (
             <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
             >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                    <Mail size={32} />
                </div>
                <h2 className="text-2xl font-bold">Check your inbox</h2>
                <p className="mt-2 text-sm text-neutral-400">
                    Enter the code sent to <span className="text-white font-medium">{formData.email}</span>
                </p>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-200 flex items-center justify-center gap-2">
                         <AlertCircle size={14} /> {error}
                    </div>
                )}

                <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-4">
                    <InputField
                        icon={KeyRound}
                        type="text"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        autoFocus
                    />
                    <button
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Verify Account"}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => setPendingVerification(false)}
                        className="flex items-center justify-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={12} /> Back
                    </button>
                </form>
             </motion.div>
          ) : (
            
          /* --- VIEW 2: LOGIN / SIGNUP --- */
          <motion.div
            key="auth"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                {isLogin ? "Enter your credentials to access the studio." : "Join the elite prompt engineering community."}
              </p>
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-4">
                    <InputField
                      icon={User}
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {/* NEW USERNAME FIELD - Solves the "Missing Requirements" Error */}
                    <InputField
                      icon={AtSign}
                      type="text"
                      placeholder="Username (e.g., prompt_wizard)"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <InputField
                icon={Lock}
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <button
                disabled={isLoading}
                className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white py-3 text-sm font-bold text-black transition-all hover:bg-neutral-200 active:scale-95 disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Get Started"}</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4 text-xs uppercase text-neutral-600">
              <div className="h-px flex-1 bg-white/10" />
              <span>Or continue with</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SocialButton icon={Github} label="GitHub" onClick={() => handleOAuth('oauth_github')} />
              <SocialButton icon={Chrome} label="Google" onClick={() => handleOAuth('oauth_google')} />
            </div>

            <div className="mt-8 text-center text-sm text-neutral-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginPage;