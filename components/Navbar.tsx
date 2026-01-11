
import React, { useEffect, useState } from 'react';
import { LayoutDashboard, FileText, UserCircle, LogOut, History, Settings as SettingsIcon, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'entry' | 'audit' | 'settings' | 'ai';
  onTabChange: (tab: 'dashboard' | 'entry' | 'audit' | 'settings' | 'ai') => void;
  userRole: 'public' | 'officer';
  onToggleRole: () => void;
  lastUpdated?: Date;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, userRole, onToggleRole, lastUpdated, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1e293b] shadow-xl border-b-[4px] border-amber-400 font-sarabun">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onTabChange('dashboard')}>
            <div className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-slate-200 shadow-inner overflow-hidden shrink-0">
                <svg className="w-9 h-9 text-[#1e3a8a]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
                </svg>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-2xl text-white leading-none tracking-tight drop-shadow-sm">อบต.เหนือเมือง</span>
              <span className="text-sm text-slate-300 font-medium tracking-wide mt-1 uppercase opacity-90">รายงานผลการเลือกตั้งท้องถิ่น</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
                <button
                    onClick={() => onTabChange('dashboard')}
                    className={`
                        px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2
                        ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/10'}
                    `}
                >
                    <LayoutDashboard size={18} />
                    หน้าหลัก
                </button>

                <button
                    onClick={() => onTabChange('ai')}
                    className={`
                        px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2
                        ${activeTab === 'ai' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-blue-400 hover:text-white hover:bg-white/10'}
                    `}
                >
                    <Sparkles size={18} />
                    AI ช่วยเหลือ
                </button>

                <button
                    onClick={handleRefreshClick}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                    <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                    รีเฟรช
                </button>

                <button
                    onClick={() => onTabChange('settings')}
                    className={`
                        px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2
                        ${activeTab === 'settings' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/10'}
                    `}
                >
                    <SettingsIcon size={18} />
                    ตั้งค่า
                </button>
                
                {userRole === 'officer' && (
                    <>
                        <button
                            onClick={() => onTabChange('entry')}
                            className={`
                                px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2
                                ${activeTab === 'entry' ? 'bg-amber-400 text-slate-900 shadow-lg' : 'text-amber-400 hover:bg-amber-400/10'}
                            `}
                        >
                            <FileText size={18} />
                            บันทึกคะแนน
                        </button>
                        <button
                            onClick={() => onTabChange('audit')}
                            className={`
                                px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2
                                ${activeTab === 'audit' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}
                            `}
                        >
                            <History size={18} />
                            Audit
                        </button>
                    </>
                )}
            </div>

            <div className="flex items-center gap-4 pl-4 border-l border-slate-700 ml-2">
              <button 
                onClick={onToggleRole}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-bold border
                  ${userRole === 'public' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20'}
                `}
              >
                {userRole === 'public' ? <UserCircle size={20} /> : <LogOut size={20} />}
                <span className="hidden lg:inline">{userRole === 'public' ? 'บุคคลทั่วไป' : 'ออกจากระบบ'}</span>
              </button>
            </div>
        </div>
      </div>
      
      {/* Mobile Bottom Menu */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
             <button onClick={() => onTabChange('dashboard')} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'dashboard' ? 'text-blue-800 bg-blue-50' : 'text-slate-400'}`}>
                <LayoutDashboard size={24} />
                <span className="text-[10px] font-bold">หน้าหลัก</span>
             </button>
             <button onClick={() => onTabChange('ai')} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'ai' ? 'text-indigo-800 bg-indigo-50' : 'text-slate-400'}`}>
                <Sparkles size={24} />
                <span className="text-[10px] font-bold">AI</span>
             </button>
             <button onClick={handleRefreshClick} className="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-400">
                <RefreshCw size={24} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="text-[10px] font-bold">รีเฟรช</span>
             </button>
             <button onClick={() => onTabChange('settings')} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'settings' ? 'text-blue-800 bg-blue-50' : 'text-slate-400'}`}>
                <SettingsIcon size={24} />
                <span className="text-[10px] font-bold">ตั้งค่า</span>
             </button>
             {userRole === 'officer' && (
               <>
                <button onClick={() => onTabChange('entry')} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'entry' ? 'text-amber-700 bg-amber-50' : 'text-slate-400'}`}><FileText size={24} /><span className="text-[10px] font-bold">บันทึกผล</span></button>
               </>
             )}
      </div>
    </nav>
  );
};
