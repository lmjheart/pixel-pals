
import React from 'react';
import { ADMIN_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: string | null;
  currentView: 'all' | 'hallOfFame' | 'myWorks';
  onLogin: () => void;
  onLogout: () => void;
  onSetView: (view: 'all' | 'hallOfFame' | 'myWorks') => void;
  onCopyLink: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  currentView,
  onLogin, 
  onLogout, 
  onSetView,
  onCopyLink
}) => {
  const handleNavClick = (view: 'all' | 'hallOfFame' | 'myWorks') => {
    onSetView(view);
    const contentElement = document.getElementById('gallery-content');
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isAdmin = currentUser === ADMIN_NAME;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-indigo-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavClick('all')}>
              <div className="bg-white text-indigo-600 p-2 rounded-xl rotate-3 shadow-md flex items-center justify-center w-10 h-10 transform hover:rotate-12 transition-transform">
                <span className="text-2xl font-black italic">P</span>
              </div>
            </div>
            <button 
              onClick={onCopyLink}
              className="hidden md:flex items-center space-x-2 bg-indigo-500/50 hover:bg-indigo-400/50 px-3 py-1.5 rounded-full border border-indigo-400/30 transition-all active:scale-95"
            >
              <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-100">Invite Friends 🔗</span>
            </button>
          </div>
          
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex space-x-1 bg-indigo-700/30 p-1 rounded-2xl overflow-x-auto">
              <button 
                onClick={() => handleNavClick('all')} 
                className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-[12px] sm:text-sm transition-all whitespace-nowrap ${currentView === 'all' ? 'bg-white text-indigo-600 shadow-md' : 'text-indigo-100 hover:bg-indigo-500/30'}`}
              >
                전체
              </button>
              <button 
                onClick={() => handleNavClick('hallOfFame')} 
                className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-[12px] sm:text-sm transition-all whitespace-nowrap ${currentView === 'hallOfFame' ? 'bg-white text-indigo-600 shadow-md' : 'text-indigo-100 hover:bg-indigo-500/30'}`}
              >
                랭킹
              </button>
              {currentUser && (
                <button 
                  onClick={() => handleNavClick('myWorks')} 
                  className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-[12px] sm:text-sm transition-all whitespace-nowrap ${currentView === 'myWorks' ? 'bg-white text-indigo-600 shadow-md' : 'text-indigo-100 hover:bg-indigo-500/30'}`}
                >
                  내꺼
                </button>
              )}
            </div>
            
            {currentUser ? (
              <div className={`flex items-center ${isAdmin ? 'bg-indigo-900 border-yellow-400' : 'bg-indigo-700/50 border-indigo-400'} p-1 pl-3 sm:pl-4 rounded-full border`}>
                <span className={`${isAdmin ? 'text-white' : 'text-yellow-400'} font-black text-[10px] sm:text-xs hidden xs:inline`}>
                  {isAdmin && <span className="mr-1">🛡️</span>}
                  {currentUser}
                </span>
                <button 
                  onClick={onLogout}
                  className="p-2 ml-1 text-indigo-300 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 whitespace-nowrap"
              >
                입장
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="py-12 bg-white border-t border-slate-100 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-indigo-900 font-black text-sm mb-2 uppercase tracking-widest">Global Pixel Art Square</p>
          <p className="text-slate-400 text-xs font-medium">친구들과 링크를 공유하고 함께 즐겨요!</p>
        </div>
      </footer>
    </div>
  );
};
