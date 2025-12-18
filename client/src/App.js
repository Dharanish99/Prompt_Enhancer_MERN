import { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import ImagePromptEnhancer from "./components/ImagePromptEnhancer";
import TemplatesGallery from "./components/TemplatesGallery";
import HistorySidebar from "./components/HistorySidebar";
import TextPromptArchitect from "./components/TextPromptArchitect";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* --- GLOBAL TEXTURE COMPONENT --- */
const GlobalAmbience = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0 bg-[#050505]" />
    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 12, repeat: Infinity }}
      className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-900/10 blur-[120px]"
    />
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
      transition={{ duration: 15, repeat: Infinity, delay: 2 }}
      className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-900/10 blur-[120px]"
    />
  </div>
);

const ViewWrapper = ({ children, viewKey }) => (
  <motion.div
    key={viewKey}
    initial={{ opacity: 0, y: 10, scale: 0.99 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.99 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="relative w-full h-full"
  >
    {children}
  </motion.div>
);

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState("home");
  const [activePrompt, setActivePrompt] = useState("");
  const [activeModel, setActiveModel] = useState("midjourney");
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleRemixComplete = (prompt, model) => {
    setActivePrompt(prompt);
    setActiveModel(model || "midjourney");
    setCurrentView("image");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-neutral-500 font-mono text-xs">
        INITIALIZING STUDIO…
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <GlobalAmbience />

      <div className={`relative z-50 transition-all ${isNavbarHidden ? "-translate-y-32 opacity-0" : ""}`}>
        <Navbar
          activeTab={currentView}
          onNavigate={setCurrentView}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      </div>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <ViewWrapper viewKey="home">
              <HomePage onNavigate={setCurrentView} />
            </ViewWrapper>
          )}

          {currentView === "image" && (
            <ViewWrapper viewKey="image">
              <div className="pt-24 max-w-7xl mx-auto">
                <ImagePromptEnhancer
                  initialPrompt={activePrompt}
                  initialModel={activeModel}
                />
              </div>
            </ViewWrapper>
          )}

          {currentView === "chat" && (
            <ViewWrapper viewKey="chat">
              <TextPromptArchitect />
            </ViewWrapper>
          )}

          {currentView === "templates" && (
            <ViewWrapper viewKey="templates">
              <TemplatesGallery
                onRemixComplete={handleRemixComplete}
                setNavbarHidden={setIsNavbarHidden}
              />
            </ViewWrapper>
          )}
        </AnimatePresence>
      </main>

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
