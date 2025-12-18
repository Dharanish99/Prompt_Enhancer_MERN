import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ImageIcon, Sparkles, Loader2, ArrowRight, 
  MessageCircle, Terminal, RefreshCcw, Copy, Check, Zap,
  Cpu, Layers
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

// --- COMPONENTS ---
const GlassPanel = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className={cn(
      "relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl group",
      className
    )}
  >
    {/* Ambient Noise Texture */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    {/* Top Glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-sm" />
    
    <div className="relative z-10 flex flex-1 flex-col overflow-hidden h-full">{children}</div>
  </motion.div>
);

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button 
      onClick={handleCopy} 
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-white/5"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  );
};

const MODELS = [
  { id: 'midjourney', label: 'Midjourney V6' },
  { id: 'dalle', label: 'DALL-E 3' },
  { id: 'leonardo', label: 'Leonardo.Ai' },
  { id: 'nano-banana', label: 'Nano Banana' },
  { id: 'stable-diffusion', label: 'Stable Diffusion' }
];

const ImagePromptEnhancer = ({ initialPrompt = "", initialModel = "midjourney" }) => {
  const { user } = useAuth();
  const [step, setStep] = useState("input"); 
  
  const [imagePrompt, setImagePrompt] = useState(initialPrompt);
  const [imageModel, setImageModel] = useState(initialModel);
  const [isRefineMode, setIsRefineMode] = useState(false);
  
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [finalResult, setFinalResult] = useState("");
  
  const [loading, setLoading] = useState(false);
  const questionsEndRef = useRef(null);

  useEffect(() => {
    if (initialPrompt) {
      setImagePrompt(initialPrompt);
      setStep("input");
    }
    if (initialModel) setImageModel(initialModel);
  }, [initialPrompt, initialModel]);

  useEffect(() => {
    if (step === 'questions' && questionsEndRef.current) {
        questionsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step, generatedQuestions]);

  const handleInitialAction = async () => {
    if (!imagePrompt.trim()) return;
    setLoading(true);

    try {
      if (isRefineMode) {
        const res = await axios.post("/api/image-enhance/analyze-prompt", { 
          prompt: imagePrompt 
        }, { withCredentials: true });

        const questions = res.data.questions || ["What style?", "What lighting?", "What mood?"];
        setGeneratedQuestions(questions);
        setStep("questions");

      } else {
        const res = await axios.post("/api/image-enhance/image-enhance", { 
          prompt: imagePrompt, 
          model: imageModel 
        }, { withCredentials: true });

        setFinalResult(res.data.enhanced); 
        setStep("result");
      }
    } catch (err) {
      console.error("Enhance Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/image-enhance/finalize-prompt", {
        original: imagePrompt, 
        answers: userAnswers,
        model: imageModel
      }, { withCredentials: true });

      setFinalResult(res.data.enhanced);
      setStep("result");
    } catch (err) {
      console.error("Finalize Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setFinalResult("");
    setGeneratedQuestions([]);
    setUserAnswers({});
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full p-2">
      {/* LEFT PANEL: INPUT & CONTROLS */}
      <GlassPanel className="flex-1 p-6 flex flex-col">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between mb-8 shrink-0">
           <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-600/10 border border-white/10 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-shadow">
                <ImageIcon size={22} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A0A]" />
              </div>
              <div>
                 <h2 className="text-base font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    Visual Engine
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-neutral-400 font-mono">v2.0</span>
                 </h2>
                 <p className="text-[11px] text-neutral-500 font-medium">Generative Art Optimization</p>
              </div>
           </div>
           
           <button 
             onClick={() => setIsRefineMode(!isRefineMode)}
             className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all relative z-20",
               isRefineMode 
                 ? "bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                 : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
             )}
           >
             <MessageCircle size={14} />
             {isRefineMode ? "Interactive Mode" : "Fast Mode"}
           </button>
        </div>

        {/* --- MODEL SELECTOR (Segmented Control Look) --- */}
        <div className="relative z-10 mb-6 shrink-0">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">
             <Cpu size={12} /> Target Model
          </div>
          <div className="flex p-1 bg-black/40 border border-white/5 rounded-xl overflow-x-auto scrollbar-hide">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setImageModel(m.id)}
                className={cn(
                  "flex-1 px-3 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all whitespace-nowrap border min-w-[100px]",
                  imageModel === m.id
                    ? "bg-neutral-800 text-white border-white/10 shadow-lg" 
                    : "bg-transparent text-neutral-500 border-transparent hover:bg-white/5 hover:text-neutral-300"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 relative flex flex-col min-h-[300px]">
           <AnimatePresence mode="wait">
             
             {/* MODE 1: INPUT */}
             {(step === 'input' || step === 'result') && (
               <motion.div 
                 key="input" 
                 initial={{ opacity: 0, y: 10 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0, y: -10 }} 
                 className="flex flex-col h-full"
               >
                 {/* VISIBLE INPUT CONTAINER */}
                 <div className="flex-1 relative group/input">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl pointer-events-none" />
                    
                    <div className={cn(
                      "absolute inset-0 rounded-2xl border bg-black/20 transition-all duration-300 overflow-hidden flex flex-col",
                      imagePrompt ? "border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.05)]" : "border-white/10 hover:border-white/20"
                    )}>
                       {/* Input Label Area */}
                       <div className="h-9 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
                          <Layers size={12} className="text-neutral-600" />
                          <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Prompt Input</span>
                       </div>

                       <textarea
                         value={imagePrompt}
                         onChange={(e) => setImagePrompt(e.target.value)}
                         placeholder="Describe your vision here... (e.g. A cyberpunk samurai standing in neon rain, cinematic lighting, 8k)"
                         className="flex-1 w-full bg-transparent p-5 text-lg text-neutral-200 placeholder-neutral-700 outline-none resize-none font-medium leading-relaxed custom-scrollbar selection:bg-purple-500/30"
                       />
                       
                       {/* Character Count / Footer of Input */}
                       <div className="h-8 flex items-center justify-end px-4 text-[10px] text-neutral-600 font-mono border-t border-white/5">
                          {imagePrompt.length} chars
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-6 mt-auto shrink-0">
                    <button
                      onClick={handleInitialAction}
                      disabled={loading || !imagePrompt.trim() || !user}
                      className="relative w-full overflow-hidden rounded-xl bg-white py-4 text-sm font-bold text-black shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-white mix-blend-overlay opacity-0 group-hover:opacity-20" />
                      
                      <div className="relative flex items-center justify-center gap-2">
                          {loading ? <Loader2 className="animate-spin text-black" size={18} /> : <Zap size={18} className="fill-black" />} 
                          <span>Enhance Prompt</span>
                      </div>
                    </button>
                 </div>
               </motion.div>
             )}

             {/* MODE 2: QUESTIONS */}
             {step === 'questions' && (
               <motion.div 
                 key="questions" 
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 exit={{ opacity: 0, x: -20 }} 
                 className="flex flex-col h-full absolute inset-0"
               >
                 <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-3 shrink-0">
                       <Sparkles size={16} className="text-purple-400 shrink-0 animate-pulse" />
                       <span className="font-medium">AI requires specific details to optimize:</span>
                    </div>
                    
                    <div className="space-y-4">
                      {generatedQuestions.map((q, idx) => (
                        <div key={idx} className="space-y-2 group">
                           <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1 group-focus-within:text-purple-400 transition-colors">
                              <span className="w-4 h-4 rounded bg-white/5 flex items-center justify-center text-[9px]">{idx + 1}</span>
                              {q}
                           </div>
                           <input 
                             autoFocus={idx === 0}
                             className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-purple-500/50 focus:bg-purple-900/5 outline-none transition-all placeholder-neutral-700 shadow-inner"
                             placeholder="Type details..."
                             onChange={(e) => setUserAnswers(prev => ({...prev, [idx]: e.target.value}))}
                           />
                        </div>
                      ))}
                    </div>
                    <div ref={questionsEndRef} />
                 </div>
                 <div className="pt-6 flex gap-3 border-t border-white/5 mt-4 shrink-0 bg-[#0A0A0A]">
                    <button onClick={() => setStep('input')} className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-white transition-colors font-medium text-xs uppercase tracking-wider hover:bg-white/10">Back</button>
                    <button onClick={handleFinalize} disabled={loading} className="flex-1 py-3.5 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                       {loading ? <Loader2 className="animate-spin" /> : <>Finalize <ArrowRight size={16} /></>}
                    </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </GlassPanel>

      {/* RIGHT PANEL: TERMINAL OUTPUT */}
      <GlassPanel className="hidden md:flex w-5/12 bg-black border-l border-white/10 p-0 flex-col">
         {/* Terminal Header */}
         <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4 shrink-0">
            <div className="flex gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
               <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest opacity-60">
                <Terminal size={12} /> console.log
            </div>
         </div>
         
         {/* Terminal Body */}
         <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar relative flex flex-col bg-[#050505]">
            {!finalResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-700 gap-4 opacity-40">
                 <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                    <Terminal size={48} className="relative z-10 text-neutral-800" />
                 </div>
                 <p className="text-xs uppercase tracking-widest font-bold">Waiting for input...</p>
                 {loading && <p className="text-purple-400 mt-2 animate-pulse text-[10px]">Compiling Neural Weights...</p>}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative h-full">
                 <div className="text-neutral-500 mb-4 select-none text-[10px] uppercase tracking-wider border-b border-white/5 pb-2 flex justify-between">
                    <span>// GENERATED_OUTPUT</span>
                    <span className="text-purple-400">{imageModel}</span>
                 </div>
                 <div className="text-purple-300 leading-loose whitespace-pre-wrap selection:bg-purple-500/30">
                    <span className="text-neutral-600 mr-2">$</span>
                    {finalResult}
                    <span className="inline-block w-2.5 h-4 bg-purple-500 ml-1 animate-pulse align-middle"/>
                 </div>
                 <div className="absolute top-0 right-0">
                    <CopyButton text={finalResult} />
                 </div>
              </motion.div>
            )}
         </div>
         
         {step === 'result' && (
           <div className="p-4 border-t border-white/10 bg-white/[0.02] shrink-0">
             <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-white transition-colors py-2 group">
                <RefreshCcw size={12} className="group-hover:-rotate-180 transition-transform duration-500" /> Reset Console
             </button>
           </div>
         )}
      </GlassPanel>

      {/* MOBILE RESULT (Hidden on Desktop) */}
      <div className="md:hidden">
        {step === 'result' && (
             <GlassPanel className="p-5 border-purple-500/30 bg-purple-900/10">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Generated Output</span>
                    <CopyButton text={finalResult} />
                </div>
                <div className="p-4 bg-black/50 rounded-xl border border-white/5 font-mono text-xs text-purple-200 leading-relaxed break-words shadow-inner">
                    {finalResult}
                </div>
                <button 
                    onClick={handleReset}
                    className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white uppercase tracking-wider transition-all"
                >
                    Enhance Another
                </button>
             </GlassPanel>
        )}
      </div>
    </div>
  );
};

export default ImagePromptEnhancer;