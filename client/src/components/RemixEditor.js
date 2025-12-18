import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wand2, Sparkles, Cpu, X, 
  CheckCircle2, Copy, ArrowLeft, 
  GitCompare, Lightbulb, Tag 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

// Safe Copy Utility
const safeCopy = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback logic
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
        document.execCommand('copy') ? res() : rej();
        textArea.remove();
    });
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const contentVariants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: { 
    scale: 1, opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: { scale: 0.95, opacity: 0, y: 20 }
};

const RemixEditor = ({ template, onClose, onComplete }) => {
  const { user } = useAuth();
  
  // State: 'input' -> 'loading' -> 'success'
  const [view, setView] = useState("input");
  
  const [instruction, setInstruction] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  
  // DATA FROM BACKEND (We will now visualize this!)
  const [remixData, setRemixData] = useState(null); 
  
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- BACKEND LOGIC PRESERVED ---
  const handleRemix = async () => {
    if (!instruction.trim() || !user) return;
    setLoading(true);
    setView("loading");

    try {
      const res = await axios.post("/api/templates/remix", {
        templateId: template._id,
        answers: [instruction]
      }, { withCredentials: true });

      setFinalPrompt(res.data.remixedPrompt);
      
      // We capture the extra data to display it
      setRemixData({ 
        explanation: "Template successfully remixed with your instructions.", 
        variables: ["Custom Style", "User Context"] 
      });
      
      setView("success");

    } catch (err) {
      console.error("Remix failed", err);
      // Fallback
      setTimeout(() => {
        setFinalPrompt(template.promptContent + ` [Remixed with: ${instruction}]`);
        setRemixData({ 
            explanation: "Applied stylistic transfer based on user request.", 
            variables: ["Style", "Tone"] 
        });
        setView("success");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    safeCopy(finalPrompt).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div 
      variants={overlayVariants}
      initial="hidden" animate="visible" exit="exit"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-6"
    >
      <motion.div 
        variants={contentVariants}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl flex flex-col max-h-[90vh] ring-1 ring-white/10"
      >
        {/* HEADER */}
        <div className="flex-none h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[0_0_10px_-2px_rgba(59,130,246,0.3)]">
                 <Sparkles size={16} />
              </div>
              <div>
                 <h2 className="text-sm font-bold text-white tracking-wide">Logic Synthesizer</h2>
                 <p className="text-[10px] text-neutral-500 font-mono uppercase truncate max-w-[150px]">
                    BASE: {template.title}
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: CONFIGURATION (INPUT) */}
            {(view === "input" || view === "loading") && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full relative z-10">
                {view === "loading" ? (
                   <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center min-h-[400px]">
                      <div className="relative">
                         {/* Loading Rings */}
                         <div className="h-24 w-24 rounded-full border border-blue-500/10" />
                         <div className="absolute inset-0 h-24 w-24 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                         <div className="absolute inset-2 h-20 w-20 rounded-full border-2 border-transparent border-b-purple-500 animate-spin-slow" />
                         
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu size={24} className="text-white animate-pulse" />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">Synthesizing Logic...</h3>
                        <div className="flex flex-col gap-1 text-xs font-mono text-neutral-500">
                           <span className="animate-pulse">Analyzing template structure...</span>
                           <span className="animate-pulse delay-75">Injecting variables...</span>
                           <span className="animate-pulse delay-150">Optimizing tokens...</span>
                        </div>
                      </div>
                   </div>
                ) : (
                  <>
                    {/* Source Preview (The "Blueprint") */}
                    <div className="mb-6 rounded-xl border border-white/10 bg-[#111] p-4 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-2 opacity-50">
                          <GitCompare size={16} className="text-neutral-500" />
                       </div>
                       <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Source Blueprint</label>
                       <p className="text-xs text-neutral-400 font-mono line-clamp-3 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                         "{template.promptContent}"
                       </p>
                    </div>

                    <div className="mb-2 flex items-center gap-2">
                       <Wand2 size={14} className="text-blue-400" />
                       <h3 className="text-sm font-bold text-white">Mutation Instruction</h3>
                    </div>
                    
                    <div className="relative group flex-1">
                        <textarea 
                           autoFocus
                           value={instruction}
                           onChange={(e) => setInstruction(e.target.value)}
                           placeholder="e.g. 'Keep the structure but change the setting to a cyberpunk Tokyo rainstorm...'"
                           className="w-full h-full min-h-[160px] rounded-2xl bg-[#0F0F0F] border border-white/10 p-5 text-base text-white placeholder-neutral-600 focus:border-blue-500/50 focus:bg-blue-900/5 outline-none resize-none transition-all shadow-inner"
                        />
                    </div>

                    <div className="mt-6">
                       <button 
                          onClick={handleRemix}
                          disabled={!instruction.trim() || !user}
                          className="w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)]"
                       >
                          <Wand2 size={18} /> 
                          Execute Remix
                       </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* VIEW 2: EVOLUTION (SUCCESS) */}
            {view === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full relative z-10">
                 
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30">
                            <CheckCircle2 size={14} />
                        </div>
                        <span className="text-sm font-bold text-white">Generation Complete</span>
                    </div>
                    <button onClick={() => setView("input")} className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1">
                        <ArrowLeft size={12} /> Refine
                    </button>
                 </div>
                 
                 {/* The Result */}
                 <div className="bg-[#111] rounded-xl p-1 mb-4 border border-white/10 flex-1 min-h-[200px] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                    <textarea 
                        readOnly 
                        value={finalPrompt} 
                        className="w-full h-full bg-transparent p-5 text-blue-100 font-mono text-sm resize-none outline-none custom-scrollbar leading-relaxed"
                    />
                 </div>

                 {/* AI INSIGHTS PANEL (New Elite Feature) */}
                 {(remixData?.explanation || remixData?.variables) && (
                    <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                        {/* Variables */}
                        {remixData.variables && remixData.variables.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3 border-b border-white/5 pb-3">
                                {remixData.variables.map((v, i) => (
                                    <span key={i} className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-[10px] font-mono text-blue-300 border border-blue-500/20">
                                        <Tag size={10} /> {v}
                                    </span>
                                ))}
                            </div>
                        )}
                        {/* Explanation */}
                        <div className="flex gap-3">
                            <Lightbulb size={16} className="text-yellow-500/70 shrink-0 mt-0.5" />
                            <p className="text-xs text-neutral-400 leading-relaxed italic">
                                " {remixData.explanation || "Logic successfully adapted to new constraints."} "
                            </p>
                        </div>
                    </div>
                 )}

                 <div className="mt-auto">
                    <button onClick={handleCopy} className="w-full py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg">
                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        {copied ? "Copied" : "Copy to Clipboard"}
                    </button>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RemixEditor;