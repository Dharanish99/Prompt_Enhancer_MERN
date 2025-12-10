import { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import ImagePromptEnhancer from "./components/ImagePromptEnhancer";
import HistorySidebar from "./components/HistorySidebar"; // Import new component
import { useAuth } from "@clerk/clerk-react";

function App() {
  const [currentView, setCurrentView] = useState("home"); // home, chat, image, templates
  const { isSignedIn, isLoaded } = useAuth();
  
  // --- NEW STATE FOR HISTORY SIDEBAR ---
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If not logged in, show Login
  if (!isSignedIn) {
    return <LoginPage />;
  }

  // View Router
  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomePage onNavigate={setCurrentView} />;
      case "image":
        return (
          <div className="pt-24 px-6 max-w-7xl mx-auto h-[calc(100vh-100px)]">
             <ImagePromptEnhancer />
          </div>
        );
      case "chat":
        return (
          <div className="pt-32 text-center text-white">
            <h1 className="text-2xl">Text Enhancer Component (Coming Next)</h1>
            {/* We will move the Text Logic here in the next step */}
          </div>
        );
      case "templates":
        return (
          <div className="pt-32 text-center text-white">
             <h1 className="text-2xl">Templates Gallery (Coming Soon)</h1>
          </div>
        );
      default:
        return <HomePage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Background Ambience (Global) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      {/* Pass the open handler to Navbar */}
      <Navbar 
        activeTab={currentView} 
        onNavigate={setCurrentView} 
        onOpenHistory={() => setIsHistoryOpen(true)} 
      />
      
      <main>
        {renderView()}
      </main>

      {/* --- RENDER HISTORY SIDEBAR --- */}
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
    </div>
  );
}

export default App;