import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon, Sparkles, Loader2, ArrowRight,
  MessageCircleQuestion, CheckCircle2, RefreshCcw, Copy, Check
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@clerk/clerk-react";

// --- UTILS & SHARED UI ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

const GlassCard = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={cn(
      "relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-xl transition-all",
      className
    )}
  >
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
    <div className="relative z-10 h-full flex flex-col">{children}</div>
  </motion.div>
);

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="absolute right-2 top-2 rounded-lg bg-white/5 p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors">
      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
    </button>
  );
};

// Custom Toggle Switch
const RefineToggle = ({ enabled, setEnabled }) => (
  <div
    onClick={() => setEnabled(!enabled)}
    className="flex cursor-pointer items-center gap-3 rounded-full border border-white/5 bg-black/40 px-3 py-1.5 transition-colors hover:bg-black/60"
  >
    <span className={cn("text-xs font-medium transition-colors", enabled ? "text-white" : "text-neutral-500")}>
      Refine Mode
    </span>
    <div className={cn("relative h-5 w-9 rounded-full transition-colors duration-300", enabled ? "bg-purple-500" : "bg-neutral-700")}>
      <motion.div
        className="absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm"
        animate={{ x: enabled ? 18 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const ImagePromptEnhancer = () => {
  const { getToken } = useAuth();

  // State Machine: 'input' -> 'questions' -> 'result'
  const [step, setStep] = useState("input");

  // Data State
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("midjourney");
  const [isRefineMode, setIsRefineMode] = useState(false);

  // API Response State
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [finalResult, setFinalResult] = useState("");

  // Loading State
  const [loading, setLoading] = useState(false);

  // 1. Handle Initial Enhancement / Analysis
  const handleInitialAction = async () => {
    if (!imagePrompt.trim()) return;
    setLoading(true);

    try {
      const token = await getToken();

      if (isRefineMode) {
        // --- FLOW A: HUMAN-IN-THE-LOOP ---
        const res = await axios.post("/api/analyze-prompt", { prompt: imagePrompt }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGeneratedQuestions(res.data.questions);
        setStep("questions");
        setLoading(false);
      } else {
        // --- FLOW B: INSTANT ENHANCE ---
        const res = await axios.post("/api/image-enhance", {
          prompt: imagePrompt,
          model: imageModel
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFinalResult(res.data.enhanced);
        setStep("result");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  // 2. Handle Final Submission (After answering questions)
  const handleFinalize = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.post("/api/finalize-prompt", {
        original: imagePrompt,
        answers: userAnswers,
        model: imageModel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFinalResult(res.data.enhanced);
      setStep("result");
      setLoading(false);

    } catch (err) {
      console.error(err);
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
    <GlassCard className="h-full min-h-[500px]">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <ImageIcon size={20} />
          </div>
          <h2 className="text-xl font-semibold text-white">Diffusion Enhancer</h2>
        </div>

        {/* Toggle only visible in Input mode */}
        {step === "input" && (
          <RefineToggle enabled={isRefineMode} setEnabled={setIsRefineMode} />
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">

          {/* === STEP 1: INPUT === */}
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4 flex-1"
            >
              {/* Model Select */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['midjourney', 'dalle', 'leonardo', 'banana'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setImageModel(m)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium border transition-all capitalize whitespace-nowrap",
                      imageModel === m
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-200"
                        : "bg-white/5 border-white/5 text-neutral-500 hover:bg-white/10 hover:text-neutral-300"
                    )}
                  >
                    {m === 'banana' ? 'Stable Diff.' : m}
                  </button>
                ))}
              </div>

              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe your creative vision..."
                className="w-full flex-1 resize-none rounded-xl bg-black/40 p-4 text-sm leading-relaxed text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all border border-transparent focus:border-purple-500/20 min-h-[160px]"
              />

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleInitialAction}
                  disabled={loading || !imagePrompt.trim()}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-neutral-800 border border-neutral-700 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-700 hover:border-neutral-600 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin text-purple-400" />
                  ) : (
                    <>
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {isRefineMode ? "Analyze & Refine" : "Enhance Now"}
                      </span>
                      {isRefineMode ? <MessageCircleQuestion size={16} className="text-purple-400" /> : <Sparkles size={16} className="text-purple-400" />}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* === STEP 2: QUESTIONS (REFINE MODE) === */}
          {step === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4 flex-1"
            >
              <div className="mb-2 rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-sm text-purple-200 flex items-center gap-2">
                <Sparkles size={14} />
                <span>I need a few details to perfect this prompt:</span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[300px] scrollbar-thin scrollbar-thumb-white/10">
                {generatedQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400 ml-1">{q}</label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                      placeholder="Type your preference..."
                      onChange={(e) => setUserAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-white/5">
                <button onClick={() => setStep("input")} className="text-xs text-neutral-500 hover:text-white transition-colors">
                  Back
                </button>
                <button
                  onClick={handleFinalize}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-500 transition-colors"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Finalize Prompt"}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </div>
            </motion.div>
          )}

          {/* === STEP 3: RESULT === */}
          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-4 flex-1"
            >
              <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
                <CheckCircle2 size={16} />
                <span className="font-semibold">Enhancement Complete</span>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-widest text-purple-400/80">
                  {imageModel} Output
                </div>
                <pre className="whitespace-pre-wrap text-sm text-purple-100/90 font-mono h-full overflow-y-auto custom-scrollbar">
                  {finalResult}
                </pre>
                <CopyButton text={finalResult} />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  <RefreshCcw size={14} />
                  Enhance Another
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </GlassCard>
  );
};

export default ImagePromptEnhancer;