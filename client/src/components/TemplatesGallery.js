import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Image as ImageIcon, 
  Code, PenTool, Briefcase, 
  Loader2, X, Terminal, TrendingUp, Feather, ArrowRight 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Import the Advanced Components
import RemixEditor from "./RemixEditor";
import TemplateDetailModal from "./TemplateDetailModal";

// --- UTILS ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

// CATEGORIES
const CATEGORIES = [
  { id: "image", label: "Visuals", icon: ImageIcon },
  { id: "code", label: "Code", icon: Code },
  { id: "writing", label: "Writing", icon: PenTool },
  { id: "business", label: "Business", icon: Briefcase },
];

// --- ANIMATION CONFIG ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: "spring", stiffness: 400, damping: 30 }
  }
};

// --- 1. CARD HEADER (Visual Core) ---
const CardHeader = ({ template }) => {
  const { category, title } = template;

  if (category === "image" && template.previewImage) {
    return (
      <div className="relative h-48 w-full overflow-hidden bg-neutral-900 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10" />
        <motion.img 
          src={template.previewImage} 
          alt={title} 
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute bottom-2 left-3 z-20">
             <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300 backdrop-blur-md border border-purple-500/20">
               {template.modelConfig || "Midjourney"}
             </span>
        </div>
      </div>
    );
  }

  if (category === "code") {
    return (
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#111] to-[#0A0A0A] p-6 border-b border-white/5 group-hover:bg-[#151515] transition-colors">
        <div className="h-full w-full rounded-lg bg-[#1E1E1E] border border-white/5 p-4 shadow-2xl relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-500">
           <div className="flex gap-1.5 mb-3 opacity-50">
             <div className="w-2 h-2 rounded-full bg-red-500" />
             <div className="w-2 h-2 rounded-full bg-yellow-500" />
             <div className="w-2 h-2 rounded-full bg-green-500" />
           </div>
           <div className="space-y-2 opacity-40">
              <div className="h-1.5 w-1/3 bg-blue-400 rounded-full" />
              <div className="h-1.5 w-2/3 bg-purple-400 rounded-full" />
              <div className="h-1.5 w-1/2 bg-neutral-500 rounded-full" />
           </div>
           <Terminal className="absolute bottom-[-10px] right-[-10px] text-white/5 w-24 h-24 rotate-[-15deg]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-neutral-900 to-black border-b border-white/5 flex items-center justify-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
            {category === 'writing' ? <Feather className="text-pink-400" /> : <TrendingUp className="text-blue-400" />}
        </div>
    </div>
  );
};

// --- 2. TEMPLATE CARD ---
const TemplateCard = ({ template, onOpenDetail }) => {
  return (
    <motion.div
      variants={cardVariants}
      onClick={() => onOpenDetail(template)}
      className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/50 backdrop-blur-sm cursor-pointer hover:border-white/20 hover:shadow-[0_0_30px_-15px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <CardHeader template={template} />

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
          {template.title}
        </h3>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-white/5 text-neutral-500 border border-transparent group-hover:border-white/5 transition-colors">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between text-xs font-medium text-neutral-500 pt-4 border-t border-white/5">
           <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider opacity-50">{template.category}</span>
           </div>
           
           <span className="text-blue-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
             View <ArrowRight size={12} />
           </span>
        </div>
      </div>
    </motion.div>
  );
};

// --- 3. CREATE MODAL (Preserved) ---
const CreateModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({ title: "", category: "image", promptContent: "", tags: "" });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl ring-1 ring-white/10"
      >
        <div className="p-6">
           <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white">Create Template</h2>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10 transition-colors"><X className="text-neutral-500 hover:text-white" size={20} /></button>
           </div>
           
           <div className="space-y-4">
             <div className="group">
                <label className="text-xs font-bold text-neutral-500 uppercase ml-1 mb-1 block">Title</label>
                <input 
                    placeholder="e.g. Neon Cyberpunk Streets" 
                    className="w-full rounded-xl bg-neutral-900/50 border border-white/10 p-3 text-white focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />
             </div>

             <div className="flex gap-3">
                <div className="flex-1">
                    <label className="text-xs font-bold text-neutral-500 uppercase ml-1 mb-1 block">Category</label>
                    <div className="relative">
                        <select 
                            className="w-full appearance-none rounded-xl bg-neutral-900/50 border border-white/10 p-3 text-white outline-none focus:border-blue-500/50 transition-all"
                            value={formData.category} 
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="image">Image Generation</option>
                            <option value="code">Code Snippet</option>
                            <option value="writing">Writing Assistant</option>
                            <option value="business">Business Utility</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">▼</div>
                    </div>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-neutral-500 uppercase ml-1 mb-1 block">Tags</label>
                    <input 
                        placeholder="scifi, neon, 8k" 
                        className="w-full rounded-xl bg-neutral-900/50 border border-white/10 p-3 text-white outline-none focus:border-blue-500/50 transition-all"
                        value={formData.tags} 
                        onChange={e => setFormData({...formData, tags: e.target.value})}
                    />
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-neutral-500 uppercase ml-1 mb-1 block">Prompt Logic</label>
                <textarea 
                    placeholder="Enter your prompt structure here..." 
                    className="w-full h-32 rounded-xl bg-neutral-900/50 border border-white/10 p-3 text-white resize-none outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-mono text-sm"
                    value={formData.promptContent} 
                    onChange={e => setFormData({...formData, promptContent: e.target.value})}
                />
             </div>

             <button 
               onClick={() => onSubmit(formData)}
               disabled={loading}
               className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-900/20"
             >
               {loading ? <Loader2 className="animate-spin mx-auto" /> : "Publish Template"}
             </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN PAGE ---
const TemplatesGallery = ({ onRemixComplete, setNavbarHidden }) => {
  
  const [activeCategory, setActiveCategory] = useState("image");
  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeRemixTemplate, setActiveRemixTemplate] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // --- NEW LOGIC: HIDE NAVBAR ON MODAL ---
  useEffect(() => {
    // Check if any modal is active
    const isModalActive = !!selectedTemplate || !!activeRemixTemplate || isCreateOpen;
    
    // Safety check in case prop is missing during dev
    if (setNavbarHidden) {
        setNavbarHidden(isModalActive);
    }
  }, [selectedTemplate, activeRemixTemplate, isCreateOpen, setNavbarHidden]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get("/api/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Failed to load templates");
      setTemplates([
        { _id: 1, title: "Cyberpunk City", category: "image", promptContent: "Futuristic city...", tags: ["scifi"], previewImage: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=600" },
        { _id: 2, title: "React Custom Hook", category: "code", promptContent: "Create a custom hook...", tags: ["react", "frontend"] },
        { _id: 3, title: "SEO Blog Article", category: "writing", promptContent: "Write a blog post...", tags: ["seo", "content"] },
        { _id: 4, title: "Cold Email Outreach", category: "business", promptContent: "Professional email...", tags: ["work", "sales"] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    if(!data.title || !data.promptContent) return;
    setCreating(true);
    try {
      await axios.post("/api/templates", {
        ...data,
        tags: data.tags.split(",").map(t => t.trim())
      }, { withCredentials: true });
      setIsCreateOpen(false);
      fetchTemplates();
    } catch (err) {
      alert("Error creating template");
    } finally {
      setCreating(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesCategory = t.category === activeCategory;
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                            t.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, templates]);

  return (
    <div className="min-h-screen px-4 md:px-8 pb-20 pt-24 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Discovery Lab</h1>
          <p className="text-neutral-400">Explore and remix engineered prompts.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-blue-400" size={16} />
              <input 
                 placeholder="Search templates..." 
                 value={search} onChange={(e) => setSearch(e.target.value)}
                 className="w-full rounded-full bg-[#0A0A0A]/50 border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all backdrop-blur-sm"
              />
           </div>
           <button 
             onClick={() => setIsCreateOpen(true)}
             className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-neutral-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
           >
             <Plus size={16} />
             <span className="hidden md:inline">Create</span>
           </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-6 mb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
              activeCategory === cat.id 
                ? "bg-white text-black border-white shadow-lg shadow-white/10" 
                : "bg-black/40 border-white/10 text-neutral-500 hover:text-white hover:border-white/30"
            )}
          >
            <cat.icon size={14} /> {cat.label}
          </button>
        ))}
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={40} /></div>
      ) : (
        <motion.div 
           key={activeCategory}
           initial="hidden" animate="visible" exit="exit"
           variants={containerVariants}
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20"
        >
           <AnimatePresence mode="popLayout">
             {filteredTemplates.map((template) => (
               <TemplateCard 
                 key={template._id} 
                 template={template} 
                 onOpenDetail={setSelectedTemplate} 
               />
             ))}
           </AnimatePresence>
        </motion.div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {selectedTemplate && (
          <TemplateDetailModal 
            template={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            onRemix={(template) => {
               setSelectedTemplate(null);
               setActiveRemixTemplate(template);
            }}
          />
        )}

        {activeRemixTemplate && (
          <RemixEditor 
            template={activeRemixTemplate}
            onClose={() => setActiveRemixTemplate(null)}
            onComplete={(prompt, model) => {
               setActiveRemixTemplate(null);
               onRemixComplete(prompt, model);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateOpen && (
           <CreateModal 
             isOpen={isCreateOpen}
             onClose={() => setIsCreateOpen(false)}
             onSubmit={handleCreate}
             loading={creating}
           />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplatesGallery;