import { motion } from "framer-motion";
import { X, Copy, Wand2, Terminal, Check } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const TemplateDetailModal = ({ template, onClose, onRemix }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(template.promptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl flex flex-col md:flex-row h-[600px]"
      >
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all border border-white/5"
        >
            <X size={20} />
        </button>

        {/* Visual Side (Left) */}
        <div className="w-full md:w-5/12 bg-neutral-900 relative overflow-hidden group">
           {template.previewImage ? (
              <img src={template.previewImage} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
           ) : (
              <div className="h-full flex items-center justify-center bg-[#111]"><Terminal size={64} className="text-neutral-800" /></div>
           )}
           {/* Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
           
           <div className="absolute bottom-8 left-8 right-8">
              <span className="inline-block px-2 py-1 mb-3 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                {template.category}
              </span>
              <h2 className="text-3xl font-bold text-white leading-tight">{template.title}</h2>
           </div>
        </div>

        {/* Content Side (Right) */}
        <div className="w-full md:w-7/12 p-8 flex flex-col bg-[#0A0A0A] relative">
           {/* Background Noise */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
           
           <div className="flex-1 overflow-y-auto pr-2 relative z-10 custom-scrollbar">
              <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Source Prompt</label>
              </div>
              
              <div className="bg-[#111] rounded-xl border border-white/10 p-6 shadow-inner relative group min-h-[150px]">
                 <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                 <p className="text-sm text-neutral-300 font-mono leading-relaxed whitespace-pre-wrap relative z-10">
                    {template.promptContent}
                 </p>
              </div>
              
              <div className="mt-6">
                 <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Tags</label>
                 <div className="flex flex-wrap gap-2">
                    {template.tags?.map((tag, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-neutral-400">
                            #{tag}
                        </span>
                    ))}
                 </div>
              </div>
           </div>

           {/* NEW FOOTER LAYOUT */}
           <div className="mt-6 pt-6 border-t border-white/5 flex gap-3 relative z-10">
              
              {/* LARGE COPY BUTTON (Replaces Close) */}
              <button 
                  onClick={handleCopy} 
                  className={cn(
                      "flex-1 py-3.5 rounded-xl font-medium border transition-all flex items-center justify-center gap-2",
                      copied 
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                  )}
              >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "Copied" : "Copy Prompt"}
              </button>

              <button 
                  onClick={() => onRemix(template)} 
                  className="flex-1 py-3.5 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
              >
                  <Wand2 size={18} /> 
                  Remix
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateDetailModal;