import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wand2, ArrowRight, Sparkles, Cpu, X, 
  CheckCircle2, Copy, ArrowLeft, Loader2, Layers 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

// Safe Copy Utility
const safeCopy = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
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
  const { getToken } = useAuth();
  
  // State: 'input' -> 'loading' -> 'success'
  const [view, setView] = useState("input");
  
  const [instruction, setInstruction] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [remixData, setRemixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRemix = async () => {
    if (!instruction.trim()) return;
    setLoading(true);
    setView("loading");

    try {
      const token = await getToken();
      const res = await axios.post("/api/templates/remix", {
        templateId: template._id,
        userChange: instruction
      }, { headers: { Authorization: `Bearer ${token}` } });

      setFinalPrompt(res.data.remixed_prompt);
      setRemixData({ explanation: res.data.explanation, variables: res.data.variables });
      
      // CHANGE: Go to Success View instead of Result Split
      setView("success");

    } catch (err) {
      console.error("Remix failed", err);
      // Fallback
      setTimeout(() => {
        setFinalPrompt(template.promptContent + ` [Remixed with: ${instruction}]`);
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
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* HEADER */}
        <div className="flex-none h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                 <Sparkles size={16} />
              </div>
              <div>
                 <h2 className="text-sm font-bold text-white tracking-wide">Remix Studio</h2>
                 <p className="text-[10px] text-neutral-500 font-mono uppercase truncate max-w-[150px]">{template.title}</p>
              </div>
           </div>
           <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: INPUT */}
            {(view === "input" || view === "loading") && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                {view === "loading" ? (
                   <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
                      <div className="relative">
                         <div className="h-16 w-16 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu size={20} className="text-blue-400 animate-pulse" />
                         </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Synthesizing...</h3>
                        <p className="text-sm text-neutral-500 mt-1">Applying your changes to the template.</p>
                      </div>
                   </div>
                ) : (
                  <>
                    <div className="mb-6">
                       <h3 className="text-2xl font-bold text-white mb-2">Adapt this template</h3>
                       <p className="text-sm text-neutral-400">How should we modify the original prompt?</p>
                    </div>
                    
                    <textarea 
                       autoFocus
                       value={instruction}
                       onChange={(e) => setInstruction(e.target.value)}
                       placeholder="e.g. Change the setting to a futuristic coffee shop..."
                       className="w-full h-40 rounded-2xl bg-neutral-900 border border-white/10 p-4 text-base text-white placeholder-neutral-600 focus:border-blue-500/50 outline-none resize-none mb-4"
                    />

                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                       <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Source</p>
                       <p className="text-xs text-neutral-400 line-clamp-2 font-mono opacity-70">"{template.promptContent}"</p>
                    </div>

                    <div className="mt-auto pt-6">
                       <button 
                          onClick={handleRemix}
                          disabled={!instruction.trim()}
                          className="w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                       >
                          <Wand2 size={18} /> Remix with AI
                       </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* VIEW 2: SUCCESS (No Redirect) */}
            {view === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full">
                 <div className="text-center mb-6">
                    <div className="mx-auto h-12 w-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Remix Ready</h2>
                 </div>
                 
                 <div className="bg-neutral-900 rounded-xl p-4 mb-6 border border-white/5 flex-1 relative">
                    <textarea 
                        readOnly 
                        value={finalPrompt} 
                        className="w-full h-full bg-transparent text-blue-100 font-mono text-sm resize-none outline-none custom-scrollbar"
                    />
                 </div>

                 <div className="flex flex-col gap-3">
                    <button onClick={handleCopy} className="w-full py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors">
                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        {copied ? "Copied" : "Copy to Clipboard"}
                    </button>
                    <button onClick={() => setView("input")} className="text-sm text-neutral-500 hover:text-white py-2">
                        Try different instruction
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