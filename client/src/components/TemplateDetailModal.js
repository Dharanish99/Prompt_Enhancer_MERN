import { motion } from "framer-motion";
import { X, Copy, Check, Wand2, Terminal, Calendar, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", duration: 0.5 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const TemplateDetailModal = ({ template, onClose, onRemix }) => {
  const [copied, setCopied] = useState(false);
  const isImage = template.category === "image";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template.promptContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers or non-HTTPS contexts
      const textArea = document.createElement('textarea');
      textArea.value = template.promptContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        variants={modalVariants}
        initial="hidden" animate="visible" exit="exit"
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white/70 backdrop-blur-md hover:bg-white hover:text-black transition-colors"
        >
          <X size={20} />
        </button>

        {/* --- LEFT SIDE: VISUALS --- */}
        <div className={cn(
          "relative min-h-[300px] md:min-h-full w-full md:w-5/12 overflow-hidden",
          isImage ? "bg-black" : "bg-gradient-to-br from-neutral-900 to-black"
        )}>
          {isImage && template.previewImage ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10" />
              <img 
                src={template.previewImage} 
                alt={template.title} 
                className="h-full w-full object-cover"
              />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
               <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
                  {template.category === 'code' ? <Terminal size={40} className="text-blue-400" /> : <Sparkles size={40} className="text-purple-400" />}
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">{template.title}</h3>
               <p className="text-sm text-neutral-500 uppercase tracking-widest">{template.category} Template</p>
            </div>
          )}
        </div>

        {/* --- RIGHT SIDE: CONTENT --- */}
        <div className="flex flex-1 flex-col p-6 md:p-8 overflow-y-auto">
          
          {/* Header Info */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
               {template.tags?.map(tag => (
                 <span key={tag} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                   {tag}
                 </span>
               ))}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{template.title}</h2>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
               <span className="flex items-center gap-1.5"><Calendar size={14} /> Added recently</span>
               <span className="flex items-center gap-1.5"><Share2 size={14} /> 2.4k Uses</span>
            </div>
          </div>

          {/* Prompt Display */}
          <div className="flex-1 mb-8">
            <div className="flex items-center justify-between mb-2">
               <label className="text-xs font-bold text-neutral-500 uppercase">Prompt Source</label>
               <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy Raw"}
               </button>
            </div>
            <div className="relative group rounded-xl bg-[#111] border border-white/10 p-4">
               <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
               <p className="font-mono text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap">
                 {template.promptContent}
               </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-auto pt-6 border-t border-white/5">
             <button 
               onClick={() => onRemix(template)}
               className="group relative w-full flex items-center justify-center gap-3 rounded-xl bg-white py-4 text-black font-bold text-lg hover:bg-neutral-200 transition-all active:scale-95"
             >
               <Wand2 className="transition-transform group-hover:rotate-12" size={20} />
               Remix Template
             </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default TemplateDetailModal;