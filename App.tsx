
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { VoteEntry } from './components/VoteEntry';
import { AuditLog } from './components/AuditLog';
import { Settings } from './components/Settings';
import { AIAssistant } from './components/AIAssistant';
import { VILLAGES, MOCK_INITIAL_VOTES, MOCK_INITIAL_STATUSES } from './constants';
import { VoteRecord, VillageStatus, AuditLogEntry, NotificationSettings, NotificationCategory, ElectionType } from './types';
import { Lock, X, Bell, CheckCircle2, AlertCircle, Mail, Sparkles, Download, Upload, CloudCheck } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  category?: NotificationCategory;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enableInApp: true,
  enableEmail: false,
  emailAddress: '',
  alertCloseRace: true,
  alertOverLimit: true,
  alertSystemStatus: true
};

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry' | 'audit' | 'settings' | 'ai'>('dashboard');
  const [userRole, setUserRole] = useState<'public' | 'officer'>('public');
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPin, setAuthPin] = useState('');

  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [statuses, setStatuses] = useState<VillageStatus[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  
  // Storage Hydration Flag
  const [isInitialized, setIsInitialized] = useState(false);
  const STORAGE_KEY = 'ELECTION_APP_DATA_V4_STABLE';

  const currentDate = new Date().toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // 1. Initial Load (Hydration) & Cross-Tab Sync
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed.votes)) setVotes(parsed.votes);
          if (Array.isArray(parsed.statuses)) {
            setStatuses(parsed.statuses.map((s: any) => ({ 
              ...s, 
              lastUpdated: s.lastUpdated ? new Date(s.lastUpdated) : undefined 
            })));
          }
          if (Array.isArray(parsed.logs)) {
            setAuditLogs(parsed.logs.map((l: any) => ({ 
              ...l, 
              timestamp: new Date(l.timestamp) 
            })));
          }
          if (parsed.lastUpdated) setLastUpdated(new Date(parsed.lastUpdated));
          if (parsed.settings) setSettings(parsed.settings);
        } else {
          const initialVotes = MOCK_INITIAL_VOTES();
          setVotes(initialVotes);
          setStatuses(MOCK_INITIAL_STATUSES(initialVotes));
          addNotification('โหลดข้อมูลคะแนนเริ่มต้นสำเร็จ', 'info', 'system');
        }
      } catch (e) {
        console.error("Hydration Failed:", e);
      } finally {
        setIsInitialized(true);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const parsed = JSON.parse(e.newValue);
        setVotes(parsed.votes || []);
        setStatuses((parsed.statuses || []).map((s: any) => ({ 
          ...s, 
          lastUpdated: s.lastUpdated ? new Date(s.lastUpdated) : undefined 
        })));
        setAuditLogs((parsed.logs || []).map((l: any) => ({ 
          ...l, 
          timestamp: new Date(l.timestamp) 
        })));
        setLastUpdated(new Date(parsed.lastUpdated || Date.now()));
        // Silent update for dashboard, but can show a small hint if needed
      }
    };

    loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 2. Auto-Save Logic
  useEffect(() => {
    if (!isInitialized) return;
    
    const dataToSave = { 
      votes, 
      statuses, 
      logs: auditLogs, 
      lastUpdated: lastUpdated.toISOString(), 
      settings 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [votes, statuses, auditLogs, lastUpdated, settings, isInitialized]);

  const addNotification = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', category: NotificationCategory = 'general') => {
    if (category === 'close-race' && !settings.alertCloseRace) return;
    if (category === 'over-limit' && !settings.alertOverLimit) return;
    if (category === 'system' && !settings.alertSystemStatus) return;

    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [{ id, message, type, category }, ...prev].slice(0, 3));
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 6000);
  }, [settings]);

  const handleRefresh = useCallback(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        const parsed = JSON.parse(savedData);
        setVotes(parsed.votes || []);
        setStatuses((parsed.statuses || []).map((s: any) => ({ ...s, lastUpdated: s.lastUpdated ? new Date(s.lastUpdated) : undefined })));
        setLastUpdated(new Date());
        addNotification('รีเฟรชและโหลดข้อมูลล่าสุดแล้ว', 'success', 'system');
    }
  }, [addNotification]);

  const handleExportData = () => {
    const data = { votes, statuses, logs: auditLogs, lastUpdated, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `election_backup_${new Date().toISOString().replace(/:/g, '-')}.json`;
    link.click();
    addNotification('ส่งออกข้อมูลสำรองเรียบร้อยแล้ว', 'success', 'system');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(event.target?.result as string);
            if (parsed.votes && parsed.statuses) {
                setVotes(parsed.votes);
                setStatuses(parsed.statuses.map((s: any) => ({ ...s, lastUpdated: s.lastUpdated ? new Date(s.lastUpdated) : undefined })));
                if (parsed.logs) setAuditLogs(parsed.logs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })));
                setLastUpdated(new Date());
                addNotification('นำเข้าข้อมูลสำเร็จ', 'success', 'system');
                setActiveTab('dashboard');
            }
        } catch (err) {
            addNotification('ไฟล์ข้อมูลไม่ถูกต้อง', 'error', 'system');
        }
    };
    reader.readAsText(file);
  };

  const handleAuthSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (authPin === '1234') {
      setUserRole('officer');
      setShowAuthModal(false);
      setAuthPin('');
      addNotification('เข้าสู่ระบบสำเร็จ', 'success', 'system');
    } else {
      addNotification('รหัสผ่านไม่ถูกต้อง', 'error', 'system');
      setAuthPin('');
    }
  }, [authPin, addNotification]);

  const handleVoteSubmit = useCallback((villageId: number, newVoteCounts: {candidateId: number, count: number}[], type: ElectionType, remark?: string) => {
    const village = VILLAGES.find(v => v.id === villageId);
    const typeStr = type === ElectionType.MAYOR ? 'นายก อบต.' : 'สมาชิก อบต.';
    
    const diff: AuditLogEntry['diff'] = [];
    newVoteCounts.forEach(nv => {
      const oldVal = votes.find(v => v.villageId === villageId && v.candidateId === nv.candidateId && v.electionType === type)?.count || 0;
      if (oldVal !== nv.count) {
        diff.push({
          candidateId: nv.candidateId,
          before: oldVal,
          after: nv.count,
          villageName: village?.name
        });
      }
    });

    if (diff.length === 0) {
      addNotification('ไม่มีการเปลี่ยนแปลงข้อมูล', 'info', 'general');
      return;
    }

    const snapshot = { votes: [...votes], statuses: [...statuses] };

    setVotes(prev => {
      const filtered = prev.filter(v => !(v.villageId === villageId && v.electionType === type));
      const newRecords = newVoteCounts.map(nv => ({ villageId, candidateId: nv.candidateId, count: nv.count, electionType: type }));
      return [...filtered, ...newRecords];
    });

    setStatuses(prev => {
      const newUpdate = new Date();
      setLastUpdated(newUpdate);
      const exists = prev.find(s => s.villageId === villageId);
      if (exists) return prev.map(s => s.villageId === villageId ? { ...s, isReported: true, lastUpdated: newUpdate } : s);
      return [...prev, { villageId, isReported: true, isVerified: false, lastUpdated: newUpdate }];
    });

    const newLog: AuditLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      action: 'SUBMIT_VOTE',
      details: `บันทึกคะแนน ${typeStr} หมู่ที่ ${village?.moo} (${village?.name})`,
      remark: remark,
      diff,
      snapshot,
      user: 'Officer ID: 101'
    };

    setAuditLogs(prev => [newLog, ...prev]);
    addNotification(`บันทึกข้อมูลสำเร็จ: ${village?.name}`, 'success', 'general');
    if(type === ElectionType.MAYOR) setActiveTab('dashboard');
  }, [votes, statuses, addNotification]);

  const handleRollback = useCallback((logId: string) => {
    const log = auditLogs.find(l => l.id === logId);
    if (!log || !log.snapshot) return;

    const currentSnapshot = { votes: [...votes], statuses: [...statuses] };
    
    setVotes(log.snapshot.votes);
    setStatuses(log.snapshot.statuses);
    setLastUpdated(new Date());

    const rollbackLog: AuditLogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
        action: 'ROLLBACK',
        details: `ย้อนกลับข้อมูลจากรายการ: ${log.details} (${logId})`,
        snapshot: currentSnapshot,
        user: 'Admin ID: 101'
    };

    setAuditLogs(prev => [rollbackLog, ...prev]);
    addNotification('ย้อนกลับข้อมูลสำเร็จแล้ว', 'warning', 'system');
    setActiveTab('dashboard');
  }, [auditLogs, votes, statuses, addNotification]);

  const handleResetVotes = useCallback(() => {
    const snapshot = { votes: [...votes], statuses: [...statuses] };
    setVotes([]);
    setStatuses(VILLAGES.map(v => ({ villageId: v.id, isReported: false, isVerified: false, lastUpdated: new Date() })));
    setLastUpdated(new Date());
    
    const resetLog: AuditLogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
        action: 'RESET_SYSTEM',
        details: 'ล้างข้อมูลคะแนนทั้งหมดในระบบ',
        snapshot,
        user: 'Admin ID: 101'
    };
    setAuditLogs(prev => [resetLog, ...prev]);
    addNotification('รีเซ็ตข้อมูลสำเร็จ', 'info', 'system');
    setActiveTab('dashboard');
  }, [votes, statuses, addNotification]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sarabun text-slate-900">
      <Navbar 
        activeTab={activeTab as any} 
        onTabChange={setActiveTab as any} 
        userRole={userRole} 
        onToggleRole={() => userRole === 'public' ? setShowAuthModal(true) : setUserRole('public')} 
        lastUpdated={lastUpdated} 
        onRefresh={handleRefresh}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="mb-8 border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {activeTab === 'dashboard' && 'แดชบอร์ดรายงานผลการเลือกตั้ง'}
                  {activeTab === 'entry' && 'บันทึกคะแนนรายหน่วย'}
                  {activeTab === 'audit' && 'ตรวจสอบประวัติและกู้คืนข้อมูล'}
                  {activeTab === 'settings' && 'การตั้งค่าระบบ'}
                  {activeTab === 'ai' && 'วิเคราะห์อัจฉริยะ (AI Assistant)'}
                </h1>
                <p className="text-slate-600 mt-1 font-medium flex items-center gap-2">
                    องค์การบริหารส่วนตำบลเหนือเมือง • {currentDate}
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                        <CheckCircle2 size={12} /> ข้อมูลบันทึกถาวร (Autosave Active)
                    </span>
                </p>
            </div>
            
            {userRole === 'officer' && (
              <div className="flex items-center gap-3">
                  <button 
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-black hover:bg-emerald-100 transition-all"
                  >
                    <Download size={16} /> ส่งออกไฟล์สำรอง
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-sm font-black hover:bg-blue-100 transition-all cursor-pointer">
                    <Upload size={16} /> นำเข้าข้อมูล
                    <input type="file" className="hidden" accept=".json" onChange={handleImportData} />
                  </label>
              </div>
            )}
        </div>

        <div>
          {!isInitialized ? (
            <div className="py-40 flex flex-col items-center justify-center text-slate-400">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="font-black uppercase tracking-widest text-sm text-blue-900">กำลังกู้คืนข้อมูลจากหน่วยความจำ...</p>
            </div>
          ) : (
            <>
                {activeTab === 'dashboard' && <Dashboard votes={votes} villages={VILLAGES} statuses={statuses} lastUpdated={lastUpdated} onRefresh={handleRefresh} />}
                {activeTab === 'audit' && (userRole === 'officer' ? <AuditLog logs={auditLogs} onRollback={handleRollback} /> : <div className="py-20 text-center"><Lock className="mx-auto w-12 h-12 text-slate-300" /><p className="mt-4 font-bold text-slate-500">สำหรับเจ้าหน้าที่เท่านั้น</p></div>)}
                {activeTab === 'entry' && (userRole === 'officer' ? <VoteEntry villages={VILLAGES} statuses={statuses} onSubmit={handleVoteSubmit} onReset={handleResetVotes} /> : <div className="py-20 text-center"><button onClick={() => setShowAuthModal(true)} className="px-8 py-3 bg-blue-900 text-white font-bold rounded-lg shadow-md">ยืนยันตัวตน</button></div>)}
                {activeTab === 'settings' && <Settings settings={settings} onUpdate={setSettings} onExport={handleExportData} onImport={() => document.getElementById('file-import-hidden')?.click()} />}
                {activeTab === 'ai' && <AIAssistant />}
                <input type="file" id="file-import-hidden" className="hidden" accept=".json" onChange={handleImportData} />
            </>
          )}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border-l-4 min-w-[320px] ${n.type === 'success' ? 'bg-emerald-900 text-white border-emerald-500' : n.type === 'error' ? 'bg-red-900 text-white border-red-500' : n.type === 'warning' ? 'bg-amber-900 text-white border-amber-500' : 'bg-blue-900 text-white border-blue-400'}`}>
            {n.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} className="text-amber-400" />}
            <p className="text-sm font-bold flex-1">{n.message}</p>
            <button onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} className="text-white/50 hover:text-white"><X size={16} /></button>
          </div>
        ))}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-[#1e3a8a] px-6 py-4 flex justify-between items-center text-white"><h3 className="font-bold">เข้าสู่ระบบ (1234)</h3><button onClick={() => setShowAuthModal(false)}><X size={24} /></button></div>
                <div className="p-6">
                    <form onSubmit={handleAuthSubmit}><input type="password" autoFocus className="w-full text-center text-4xl tracking-widest font-bold py-4 border-2 rounded-xl mb-6 outline-none focus:border-blue-500 transition-all" value={authPin} onChange={(e) => setAuthPin(e.target.value.replace(/\D/g, ''))} maxLength={4} /><button type="submit" className="w-full bg-[#1e3a8a] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-900 transition-colors">ยืนยัน</button></form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
export default App;
