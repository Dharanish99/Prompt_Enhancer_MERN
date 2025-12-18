import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, Zap, BrainCircuit, Play, Sparkles, 
  Copy, Check, ChevronDown, ExternalLink, Activity, 
  AlertCircle, Cpu, Hexagon, Command, ScanSearch, Layers
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

// --- UPDATED MODEL REGISTRY ---
const MODELS = [
  // TRACK 1: INTERNAL (Groq API Models)
  { 
    id: "openai/gpt-oss-120b", 
    name: "GPT OSS 120B", 
    type: "internal", 
    icon: Hexagon,
    description: "High reasoning & agentic tasks. (Smartest)" 
  },
  { 
    id: "llama-3.3-70b-versatile", 
    name: "Llama 3.3 70B", 
    type: "internal", 
    icon: Zap,
    description: "Reliable generalist. (Balanced)" 
  },
  { 
    id: "meta-llama/llama-4-scout-17b-16e-instruct", 
    name: "Llama 4 Scout", 
    type: "internal", 
    icon: Activity,
    description: "Next-gen preview model. (Ultra Fast)" 
  },
  { 
    id: "qwen/qwen3-32b", 
    name: "Qwen 3 32B", 
    type: "internal", 
    icon: Cpu,
    description: "Great for logic, math & code." 
  },
  // TRACK 2: EXTERNAL (Redirects)
  { 
    id: "chatgpt", 
    name: "ChatGPT-4o", 
    type: "external", 
    url: "https://chat.openai.com", 
    icon: ExternalLink,
    description: "Redirect to OpenAI." 
  },
  { 
    id: "gemini", 
    name: "Google Gemini", 
    type: "external", 
    url: "https://gemini.google.com", 
    icon: ExternalLink,
    description: "Redirect to Google." 
  },
  { 
    id: "claude", 
    name: "Claude 3.5 Sonnet", 
    type: "external", 
    url: "https://claude.ai/new", 
    icon: ExternalLink,
    description: "Redirect to Anthropic." 
  }
];

// --- 🧠 LOCAL STATIC ANALYZER ---
const calculateLocalHealth = (text) => {
  if (!text) return { score: 0, issues: [] };
  
  let score = 0;
  let issues = [];
  const lower = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).length;

  // 1. Volume Check
  if (wordCount < 5) {
      return { score: 10, issues: ["Prompt is too short to analyze"] };
  }
  score += Math.min(wordCount * 2, 30);

  // 2. Role/Persona
  if (/(act as|you are|role|expert|teacher|coder)/i.test(lower)) {
    score += 20;
  } else {
    issues.push("Missing Persona (e.g., 'Act as an Expert')");
  }

  // 3. Action Verb
  if (/(write|create|generate|code|explain|list|analyze)/i.test(lower)) {
    score += 20;
  } else {
    issues.push("Missing Action Verb (e.g., 'Write', 'Create')");
  }

  // 4. Constraints/Format
  if (/(format|json|markdown|table|list|short|long|limit|constraint|step-by-step)/i.test(lower)) {
    score += 30;
  } else {
    issues.push("Missing Format/Constraint (e.g., 'In JSON', 'Short')");
  }

  return { score: Math.min(score, 100), issues };
};

// --- COMPONENT: HEALTH CORE (The Auditor) ---
const HealthCore = ({ score = 0, issues = [], onDeepScan, isScanning }) => {
  const safeScore = score || 0;
  const safeIssues = issues || [];
  
  const getColor = (s) => {
    if (s >= 80) return "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]";
    if (s >= 40) return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
    return "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  };

  const colorClass = getColor(safeScore);

  return (
    <div className="flex items-center gap-4">
        {/* Manual Deep Scan Button */}
        <button 
            onClick={onDeepScan}
            disabled={isScanning || safeScore < 10}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-neutral-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
        >
            {isScanning ? <span className="animate-spin">⌛</span> : <ScanSearch size={12} className="group-hover:text-blue-400 transition-colors" />}
            <span>AI Deep Scan</span>
        </button>

        {/* The Core Ring */}
        <div className="group relative flex items-center justify-center">
            <div className="relative h-10 w-10 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                <motion.circle 
                    initial={{ strokeDashoffset: 100.5 }}
                    animate={{ strokeDashoffset: 100.5 - (100.5 * safeScore) / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    cx="20" cy="20" r="16" 
                    stroke="currentColor" strokeWidth="3" fill="transparent" 
                    strokeDasharray={100.5} 
                    strokeLinecap="round"
                    className={colorClass} 
                />
                </svg>
                <span className={cn("absolute text-[9px] font-bold font-mono tracking-tighter", colorClass.split(" ")[0])}>
                {safeScore}
                </span>
            </div>

            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-3 w-64 p-0 rounded-xl bg-[#0F0F0F] border border-white/10 shadow-2xl opacity-0 scale-95 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto origin-top-right z-50 overflow-hidden">
                <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                    <Activity size={12} className={colorClass.split(" ")[0]} /> 
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Audit Report</span>
                </div>
                <div className="p-3">
                    {safeIssues.length > 0 ? (
                    <ul className="space-y-2">
                        {safeIssues.map((issue, i) => (
                        <li key={i} className="text-[10px] text-neutral-400 flex items-start gap-2 leading-tight">
                            <AlertCircle size={10} className="shrink-0 mt-0.5 text-red-500" /> 
                            <span>{issue}</span>
                        </li>
                        ))}
                    </ul>
                    ) : (
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Check size={12} />
                            <span className="text-[10px] font-medium">Optimal structure detected.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

// --- MAIN COMPONENT: TEXT ARCHITECT ---
const TextPromptArchitect = () => {
  
  // State
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  
  // Logic: Local vs AI Audit
  const localAudit = useMemo(() => calculateLocalHealth(prompt), [prompt]);
  const [aiAuditData, setAiAuditData] = useState(null);
  
  const [variations, setVariations] = useState(null);
  const [simulation, setSimulation] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("blueprints"); 
  
  const modelMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 1. MANUAL DEEP SCAN ---
  const handleDeepScan = async () => {
    if (!prompt.trim()) return;
    setIsDeepScanning(true);
    try {
      const res = await axios.post("/api/text/audit", { prompt }, {
         withCredentials: true
      });
      setAiAuditData(res.data);
    } catch (err) {
      console.error("Audit failed", err);
    } finally {
      setIsDeepScanning(false);
    }
  };

  // --- 2. ENHANCE LOGIC ---
  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setActiveTab("blueprints");
    try {
      const res = await axios.post("/api/text/enhance", { prompt }, {
         withCredentials: true
      });
      setVariations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SIMULATE LOGIC ---
  const handleSimulate = async (promptToRun) => {
    if (selectedModel.type === "external") {
      try {
        await navigator.clipboard.writeText(promptToRun);
        const confirmLaunch = window.confirm(
          `Prompt Copied to Clipboard!\n\nLaunch ${selectedModel.name} in a new tab?`
        );
        if (confirmLaunch) {
           window.open(selectedModel.url, "_blank");
        }
      } catch (err) {
        console.error("Clipboard failed");
      }
      return;
    }

    setLoading(true);
    setActiveTab("simulation");
    setSimulation(""); 
    
    try {
      const res = await axios.post("/api/text/simulate", { 
        prompt: promptToRun,
        model: selectedModel.id 
      }, {
         withCredentials: true
      });
      simulateTyping(res.data.result);
    } catch (err) {
      setSimulation("Error: Simulation failed. Please check your API key or model selection.");
    } finally {
      setLoading(false);
    }
  };

  const simulateTyping = (text) => {
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      setSimulation((prev) => prev + text.charAt(i));
      i++;
      if (i > text.length - 1) clearInterval(interval);
    }, 12);
  };

  // Determine active audit data
  const displayHealth = aiAuditData || localAudit;

  return (
    // UPDATED CONTAINER: 
    // 1. pt-28 (Padding Top 28) pushes content below navbar
    // 2. h-[calc(100vh-20px)] ensures it fits the screen height dynamically
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[90rem] mx-auto p-4 pt-28 h-[calc(100vh-20px)] min-h-[600px]">
      
      {/* --- LEFT PANEL: EDITOR --- */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/2 relative flex flex-col rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden group"
      >
        {/* Ambient Noise */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Header - Fixed Overlap: HealthCore is now in Flex row */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Command size={18} />
            </div>
            <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Input Source</h3>
                <span className="text-[10px] text-neutral-500 font-mono">
                    {aiAuditData ? "AI Deep Analysis" : "Local Static Analysis"}
                </span>
            </div>
          </div>
          
          {/* Health Core Component Placed Here */}
          <HealthCore 
            score={displayHealth?.score} 
            issues={displayHealth?.issues || displayHealth?.analysis?.issues}
            onDeepScan={handleDeepScan}
            isScanning={isDeepScanning}
          />
        </div>

        {/* Editor Area */}
        <div className="relative flex-1 p-0 group-hover:bg-white/[0.01] transition-colors min-h-0">
          <textarea 
            value={prompt}
            onChange={(e) => {
                setPrompt(e.target.value);
                if (aiAuditData) setAiAuditData(null); // Reset to local on edit
            }}
            placeholder="// Enter your raw prompt here...&#10;// The Architect will analyze it live."
            className="w-full h-full bg-transparent text-neutral-200 font-mono text-sm p-6 outline-none resize-none placeholder-neutral-700 leading-loose custom-scrollbar z-10 relative selection:bg-blue-500/20"
            spellCheck="false"
          />
        </div>

        {/* Action Bar */}
        <div className="p-5 border-t border-white/5 bg-[#0F0F0F] shrink-0">
           <button 
             onClick={handleEnhance}
             disabled={loading || !prompt.trim()}
             className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
           >
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
             <div className="relative flex items-center justify-center gap-2">
                 {loading ? <LoaderIcon /> : <Zap size={16} className="text-yellow-300 fill-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]" />} 
                 <span>Architect Prompts</span>
             </div>
           </button>
        </div>
      </motion.div>

      {/* --- RIGHT PANEL: WORKBENCH --- */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/2 flex flex-col rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden relative"
      >
        {/* Tab Header */}
        <div className="flex border-b border-white/5 bg-white/[0.02] shrink-0">
           {['blueprints', 'simulation'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn("relative flex-1 py-5 text-[11px] font-bold uppercase tracking-widest transition-colors", 
                 activeTab === tab ? "text-white" : "text-neutral-500 hover:text-neutral-300"
               )}
             >
               <span className="relative z-10 flex items-center justify-center gap-2">
                 {tab === 'blueprints' ? <Layers size={14} /> : <Terminal size={14} />}
                 {tab}
               </span>
               {activeTab === tab && (
                 <motion.div 
                   layoutId="activeTab"
                   className={cn("absolute bottom-0 left-0 right-0 h-[2px]", tab === 'blueprints' ? "bg-blue-500" : "bg-emerald-500")}
                 />
               )}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative flex flex-col min-h-0">
           <AnimatePresence mode="wait">
             
             {/* VIEW 1: BLUEPRINTS */}
             {activeTab === "blueprints" && (
               <motion.div 
                 key="blueprints"
                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 className="space-y-4 h-full"
               >
                 {!variations ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-4">
                       <div className="p-4 rounded-full bg-white/5 border border-white/5">
                          <BrainCircuit size={40} className="opacity-40" />
                       </div>
                       <p className="text-xs font-mono uppercase tracking-widest">Awaiting Input Stream...</p>
                    </div>
                 ) : (
                    <div className="grid gap-4 pb-4">
                       <BlueprintCard 
                         title="Logical Chain" icon={BrainCircuit} color="text-cyan-400" bg="bg-cyan-500/10" border="hover:border-cyan-500/50"
                         content={variations.logical}
                         onRun={() => handleSimulate(variations.logical)}
                       />
                       <BlueprintCard 
                         title="Creative Persona" icon={Sparkles} color="text-purple-400" bg="bg-purple-500/10" border="hover:border-purple-500/50"
                         content={variations.creative}
                         onRun={() => handleSimulate(variations.creative)}
                       />
                       <BlueprintCard 
                         title="Token Optimized" icon={Zap} color="text-emerald-400" bg="bg-emerald-500/10" border="hover:border-emerald-500/50"
                         content={variations.optimized}
                         onRun={() => handleSimulate(variations.optimized)}
                       />
                    </div>
                 )}
               </motion.div>
             )}

             {/* VIEW 2: SIMULATION */}
             {activeTab === "simulation" && (
               <motion.div 
                 key="simulation"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="flex-1 flex flex-col h-full"
               >
                 {/* MODEL SELECTOR */}
                 <div className="mb-4 flex items-center justify-between bg-[#111] p-2.5 rounded-xl border border-white/10 relative z-20 shrink-0">
                    <div className="flex items-center gap-2 px-1">
                       <span className="text-[10px] text-neutral-500 font-mono uppercase">Neural Link:</span>
                    </div>

                    <div className="relative" ref={modelMenuRef}>
                       <button 
                         onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                         className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[11px] font-bold text-white hover:bg-white/10 transition-colors"
                       >
                          <selectedModel.icon size={12} className={selectedModel.type === 'internal' ? 'text-emerald-400' : 'text-blue-400'} />
                          {selectedModel.name}
                          <ChevronDown size={12} className="text-neutral-500"/>
                       </button>

                       <AnimatePresence>
                         {isModelMenuOpen && (
                           <motion.div 
                             initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                             className="absolute right-0 top-full mt-2 w-56 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl p-1 z-30 overflow-hidden ring-1 ring-white/5"
                           >
                             <div className="px-2 py-1.5 text-[9px] font-bold text-neutral-600 uppercase tracking-wider">Internal (Groq)</div>
                             {MODELS.filter(m => m.type === 'internal').map(model => (
                               <ModelOption key={model.id} model={model} isSelected={selectedModel.id === model.id} onSelect={() => { setSelectedModel(model); setIsModelMenuOpen(false); }} />
                             ))}
                             
                             <div className="px-2 py-1.5 mt-1 border-t border-white/5 text-[9px] font-bold text-neutral-600 uppercase tracking-wider">External (Redirect)</div>
                             {MODELS.filter(m => m.type === 'external').map(model => (
                               <ModelOption key={model.id} model={model} isSelected={selectedModel.id === model.id} onSelect={() => { setSelectedModel(model); setIsModelMenuOpen(false); }} />
                             ))}
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                 </div>
                 
                 {/* OUTPUT WINDOW */}
                 <div className="flex-1 font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap font-medium p-2 overflow-y-auto custom-scrollbar">
                   {simulation ? (
                     <>
                       <span className="text-neutral-600 select-none mr-2 block mb-2">$ {selectedModel.type === 'internal' ? 'init_groq_stream' : 'secure_bridge_protocol'} --v=latest</span>
                       {simulation}
                       <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse align-middle"/>
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center h-full text-neutral-700 gap-2 opacity-60">
                        <Terminal size={32} strokeWidth={1.5} />
                        <span className="text-[10px] font-mono">
                          {selectedModel.type === 'internal' ? 'System Ready. Waiting for execution...' : 'Bridge Ready. Waiting for launch...'}
                        </span>
                     </div>
                   )}
                 </div>
               </motion.div>
             )}

           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const ModelOption = ({ model, isSelected, onSelect }) => (
  <button 
    onClick={onSelect}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors mb-0.5 group",
      isSelected ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <div className={cn("p-1.5 rounded-md bg-white/5", isSelected ? "text-white" : "text-neutral-500 group-hover:text-white")}>
       <model.icon size={12} />
    </div>
    <div className="flex flex-col items-start">
      <span className="font-medium">{model.name}</span>
      <span className="text-[9px] opacity-50 font-normal">{model.description}</span>
    </div>
  </button>
);

const BlueprintCard = ({ title, icon: Icon, color, bg, border, content, onRun }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative p-5 rounded-xl border border-white/5 bg-[#0F0F0F] transition-all hover:bg-[#151515] group overflow-hidden", border)}>
      {/* Glow Effect */}
      <div className={cn("absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity", bg.replace("bg-", "bg-gradient-to-b from-transparent via-").replace("/10", " to-transparent"))} />
      
      <div className="flex justify-between items-start mb-3 relative z-10">
         <div className="flex items-center gap-2.5">
            <div className={cn("p-1.5 rounded-lg", bg)}>
               <Icon size={14} className={color} />
            </div>
            <span className={cn("text-xs font-bold uppercase tracking-wide", color)}>{title}</span>
         </div>
         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              title="Copy"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
            <button 
              onClick={onRun}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-blue-400 transition-colors"
              title="Run Simulation"
            >
              <Play size={14} />
            </button>
         </div>
      </div>
      <p className="text-neutral-400 text-[11px] leading-relaxed font-mono opacity-80 line-clamp-3 group-hover:line-clamp-none transition-all relative z-10">
        {content}
      </p>
    </div>
  );
};

const LoaderIcon = () => (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default TextPromptArchitect;