import { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import ImagePromptEnhancer from "./components/ImagePromptEnhancer";
import TemplatesGallery from "./components/TemplatesGallery";
import HistorySidebar from "./components/HistorySidebar";
import { useAuth } from "@clerk/clerk-react";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const { isSignedIn, isLoaded } = useAuth();
  
  // --- STATE LIFTING: The "Remix" Payload ---
  // We hold the data here to pass it between siblings (Gallery -> Enhancer)
  const [activePrompt, setActivePrompt] = useState("");
  const [activeModel, setActiveModel] = useState("midjourney");
  
  // Sidebar State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // --- LOGIC: REMIX HANDLER ---
  // This function is called by TemplatesGallery when a remix is done
  const handleRemixComplete = (blendedPrompt, model) => {
    // 1. Update the "Active" state with the new AI-generated prompt
    setActivePrompt(blendedPrompt);
    setActiveModel(model || "midjourney");
    
    // 2. Force switch to the Image Enhancer view
    // setCurrentView("image");
  };

  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!isSignedIn) return <LoginPage />;

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomePage onNavigate={setCurrentView} />;
        
      case "image":
        return (
          <div className="pt-24 px-4 md:px-6 max-w-7xl mx-auto h-[calc(100vh-100px)]">
             {/* TASK 1 COMPLETE: 
                We pass the lifted state down as "initial" props.
                The Enhancer will listen to these for changes.
             */}
             <ImagePromptEnhancer 
               initialPrompt={activePrompt}
               initialModel={activeModel}
             />
          </div>
        );
        
      case "chat":
        return (
          <div className="pt-32 text-center text-white">
            <h1 className="text-2xl">Text Enhancer (Component Coming Next)</h1>
          </div>
        );
        
      case "templates":
        return (
          <div className="pt-0">
             {/* Pass the Handler Down */}
             <TemplatesGallery onRemixComplete={handleRemixComplete} />
          </div>
        );
        
      default:
        return <HomePage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Global Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <Navbar 
        activeTab={currentView} 
        onNavigate={setCurrentView} 
        onOpenHistory={() => setIsHistoryOpen(true)} 
      />
      
      <main className="relative z-10">
        {renderView()}
      </main>

      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
    </div>
  );
}

export default App;