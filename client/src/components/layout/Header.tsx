import { Link } from "wouter";
import { Bot, Home, Info, Menu } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className={`${isMenuOpen ? '' : 'bg-black/20 backdrop-blur-md'} rounded-full border border-white/10 shadow-lg transition-all duration-200`}>
        <div className="flex justify-between items-center h-14 px-6">
          {/* Logo */}
          <Link href="/landingpage">
            <div className="flex items-center cursor-pointer">
              <img
                src="/logo.jpeg"
                alt="לוגו"
                className="h-8 w-8 mr-2 rounded-full border-2 border-primary/20"
              />
              <span className="px-2 text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                The Finder 
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <div className="bg-black/20 backdrop-blur-sm rounded-full p-1.5 flex gap-1">
              <Link href="/">
                <a className="flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                  <Home className="w-4 h-4" />
                  <span className="text-sm">חיפוש דירות</span>
                </a>
              </Link>
              
              <Link href="/landingpage">
                <a className="flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">מידע כללי</span>
                </a>
              </Link>

              <a 
                href="https://t.me/The_Underdog_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              >
                <Bot className="w-4 h-4" />
                <span className="text-sm">בוט אישי</span>
              </a>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden transition-colors ${isMenuOpen ? 'text-primary hover:text-primary/80' : 'text-white/70 hover:text-white'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
    
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/20 backdrop-blur-md mt-2 rounded-2xl border border-white/10 p-2 space-y-1 shadow-lg mx-2 mb-2">
            <Link href="/">
              <a className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">חיפוש דירות</span>
              </a>
            </Link> 
            
            <Link href="/landingpage">
              <a className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">מידע כללי</span>
              </a>
            </Link>

            <a 
              href="https://t.me/The_Underdog_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">בוט אישי</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
