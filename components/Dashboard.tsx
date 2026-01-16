
import React, { useMemo, useState, useEffect } from 'react';
import { VoteRecord, Village, VillageStatus } from '../types';
import { CANDIDATES, MEMBER_CANDIDATES } from '../constants';
import { 
  Search, Trophy, Users, FileBarChart, Activity, 
  CheckCircle2, Clock, AlertCircle, X, PieChart, 
  Share2, Check, ChevronDown, ChevronUp, Eye, 
  Map as MapIcon, ShieldCheck, Navigation2, Layers,
  Medal, TrendingUp, Radio, Crown, Target, TrendingDown,
  Sparkles, Zap, Award, AlertTriangle, Info
} from 'lucide-react';

interface DashboardProps {
  votes: VoteRecord[];
  villages: Village[];
  statuses: VillageStatus[];
  lastUpdated: Date;
  onRefresh: () => void;
}

const ZONES: Village['zone'][] = ['North', 'Central', 'South', 'East', 'West'];

const ZONE_THEMES: Record<Village['zone'], { color: string, bg: string, border: string, text: string, gradient: string }> = {
  'North': { color: 'blue', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-indigo-600' },
  'Central': { color: 'purple', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-pink-600' },
  'South': { color: 'rose', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', gradient: 'from-rose-500 to-red-600' },
  'East': { color: 'amber', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-600' },
  'West': { color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600' }
};

const ZONE_LABELS: Record<Village['zone'], string> = {
  'North': 'โซนทิศเหนือ',
  'Central': 'โซนกลาง (ในเมือง)',
  'South': 'โซนทิศใต้',
  'East': 'โซนทิศตะวันออก',
  'West': 'โซนทิศตะวันตก'
};

export const Dashboard: React.FC<DashboardProps> = ({ votes, villages, statuses, lastUpdated, onRefresh }) => {
  const [viewMode, setViewMode] = useState<'MAYOR' | 'MEMBER'>('MAYOR');
  const [filterText, setFilterText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [expandedVillageId, setExpandedVillageId] = useState<number | null>(null);
  const [showLiveSignal, setShowLiveSignal] = useState(false);
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({
    'North': true,
    'Central': true,
    'South': true,
    'East': true,
    'West': true
  });

  const electionDateDisplay = "11 มกราคม 2569";

  useEffect(() => {
    setShowLiveSignal(true);
    const timer = setTimeout(() => setShowLiveSignal(false), 3000);
    return () => clearTimeout(timer);
  }, [lastUpdated]);

  const toggleZone = (zone: string) => {
    setExpandedZones(prev => ({ ...prev, [zone]: !prev[zone] }));
  };

  const relevantVotes = useMemo(() => {
    return votes.filter(v => 
      viewMode === 'MAYOR' 
        ? (v.electionType === 'MAYOR' || !v.electionType)
        : v.electionType === 'MEMBER'
    );
  }, [votes, viewMode]);

  const globalStats = useMemo(() => {
    let eligible = 0;
    let turnout = 0;
    let good = 0;
    let invalid = 0;
    let noVote = 0;
    
    const reportedUnits = statuses.filter(s => s.isReported).length;

    villages.forEach(v => {
      const villageVotes = relevantVotes.filter(r => r.villageId === v.id);
      const g = villageVotes.filter(r => r.candidateId > 0).reduce((acc, r) => acc + r.count, 0);
      const i = villageVotes.find(r => r.candidateId === -1)?.count || 0;
      const n = villageVotes.find(r => r.candidateId === 0)?.count || 0;
      const t = g + i + n;

      eligible += v.totalVoters;
      turnout += t;
      good += g;
      invalid += i;
      noVote += n;
    });

    return { eligible, turnout, good, invalid, noVote, reportedUnits, totalUnits: villages.length };
  }, [villages, relevantVotes, statuses]);

  const progress = Math.min(100, globalStats.totalUnits > 0 ? Math.round((globalStats.reportedUnits / globalStats.totalUnits) * 100) : 0);

  const mayorCandidateResults = useMemo(() => {
    const results = CANDIDATES.map(c => ({
      ...c,
      totalVotes: votes.filter(v => v.electionType === 'MAYOR' && v.candidateId === c.id).reduce((sum, r) => sum + r.count, 0)
    }));
    return results.sort((a, b) => b.totalVotes - a.totalVotes);
  }, [votes]);

  const candidateResults = useMemo(() => {
    const list = viewMode === 'MAYOR' ? CANDIDATES : Object.values(MEMBER_CANDIDATES).flat();
    const uniqueCandidates = Array.from(new Set(list.map(c => c.id))).map(id => list.find(c => c.id === id)!);
    
    let results = uniqueCandidates.map(c => ({
      ...c,
      totalVotes: relevantVotes.filter(v => v.candidateId === c.id).reduce((sum, r) => sum + r.count, 0)
    }));

    if (viewMode === 'MAYOR') {
        return results.sort((a, b) => b.totalVotes - a.totalVotes);
    }
    return results;
  }, [relevantVotes, viewMode]);

  const totalValidVotes = useMemo(() => {
      return candidateResults.reduce((acc, c) => acc + c.totalVotes, 0);
  }, [candidateResults]);

  const mayorTotalVotes = useMemo(() => {
      return mayorCandidateResults.reduce((acc, c) => acc + c.totalVotes, 0);
  }, [mayorCandidateResults]);

  const allVillageStats = useMemo(() => {
    const now = Date.now();
    return villages.map(v => {
      const villageVotes = relevantVotes.filter(r => r.villageId === v.id);
      const goodVotes = villageVotes.filter(r => r.candidateId > 0).reduce((acc, r) => acc + r.count, 0);
      const invalidVotes = villageVotes.find(r => r.candidateId === -1)?.count || 0;
      const noVotes = villageVotes.find(r => r.candidateId === 0)?.count || 0;
      const currentTotal = goodVotes + invalidVotes + noVotes;
      const turnoutPercent = v.totalVoters > 0 ? (currentTotal / v.totalVoters) * 100 : 0;
      
      const candidatesInVillage = viewMode === 'MAYOR' ? CANDIDATES : (MEMBER_CANDIDATES[v.id] || []);
      const candidatesSorted = candidatesInVillage.map(c => ({
        ...c,
        count: villageVotes.find(r => r.candidateId === c.id)?.count || 0
      })).sort((a, b) => b.count - a.count || a.number - b.number);

      const status = statuses.find(s => s.villageId === v.id);
      const isCloseRace = candidatesSorted.length >= 2 && candidatesSorted[0].count > 0 && 
                          (candidatesSorted[0].count - candidatesSorted[1].count) / (currentTotal || 1) <= 0.05;
      
      const isJustUpdated = status?.lastUpdated && (now - new Date(status.lastUpdated).getTime() < 30000);

      return { ...v, currentTotal, goodVotes, invalidVotes, noVotes, turnoutPercent, candidatesSorted, status, isCloseRace, isJustUpdated };
    });
  }, [villages, relevantVotes, statuses, viewMode]);

  const groupedVillages = useMemo(() => {
    const lowerFilter = filterText.toLowerCase();
    const filtered = allVillageStats.filter(v => 
      v.name.toLowerCase().includes(lowerFilter) || 
      v.moo.toString().includes(lowerFilter)
    );

    const groups: Record<Village['zone'], typeof allVillageStats> = {
      'North': [],
      'Central': [],
      'South': [],
      'East': [],
      'West': []
    };

    filtered.forEach(v => {
      groups[v.zone].push(v);
    });

    return groups;
  }, [allVillageStats, filterText]);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-1000">
      
      {/* 1. Real-time Update HUD Overlay */}
      {showLiveSignal && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4">
            <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 backdrop-blur-md">
                <Radio className="animate-pulse" size={18} />
                <span className="text-sm font-black uppercase tracking-widest">รับข้อมูลใหม่เรียลไทม์...</span>
            </div>
        </div>
      )}

      {/* 2. Hero Header */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 p-8 lg:p-14 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none scale-150 group-hover:scale-110 transition-transform duration-[10s]">
           <Activity size={400} />
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 relative z-10">
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                   <span className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-200 flex items-center gap-3">
                     <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div>
                     LIVE BROADCAST
                   </span>
                   <span className="flex items-center gap-2 text-slate-500 text-xs font-black bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 shadow-inner">
                      <Clock size={16} className="text-blue-500" /> อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString('th-TH')}
                   </span>
                </div>
                <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85]">
                    ผลเลือกตั้ง <br/><span className="text-blue-600">เรียลไทม์</span>
                </h1>
                <p className="text-slate-400 font-bold text-2xl flex items-center gap-4 ml-1">
                    อบต.เหนือเมือง <span className="w-2 h-2 rounded-full bg-slate-200"></span> {electionDateDisplay}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 w-full lg:w-auto">
                <button 
                  onClick={() => {}} // Placeholder for share logic
                  className="group flex items-center justify-center gap-3 px-10 py-6 bg-white border-2 border-slate-100 text-slate-700 rounded-[2.25rem] hover:border-blue-500 hover:text-blue-600 transition-all font-black shadow-sm active:scale-95"
                >
                  <Share2 size={24} className="group-hover:scale-110 transition-transform" />
                  <span>แชร์ผลรวม</span>
                </button>

                <div className="bg-slate-100 p-2.5 rounded-[2.5rem] flex shadow-inner">
                   <button 
                     onClick={() => setViewMode('MAYOR')}
                     className={`px-12 py-5 rounded-[2.25rem] text-sm font-black transition-all ${viewMode === 'MAYOR' ? 'bg-white text-blue-900 shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     นายก อบต.
                   </button>
                   <button 
                     onClick={() => setViewMode('MEMBER')}
                     className={`px-12 py-5 rounded-[2.25rem] text-sm font-black transition-all ${viewMode === 'MEMBER' ? 'bg-white text-blue-900 shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     สมาชิก อบต.
                   </button>
                </div>
            </div>
        </div>

        {/* Global Progress Bar Section - Enhanced */}
        <div className="mt-16 bg-slate-50/60 rounded-[3.5rem] p-12 border border-slate-100 flex flex-col md:flex-row items-center gap-16 relative group/progress">
            <div className="flex-1 w-full space-y-6">
                <div className="flex justify-between items-end">
                    <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
                        <Layers size={24} className="text-blue-500" />
                        ความคืบหน้าการนับคะแนน
                    </span>
                    <div className="flex items-center gap-3">
                         <span className="text-5xl font-black text-slate-900 font-numeric tracking-tight">
                            {globalStats.reportedUnits} <span className="text-2xl text-slate-300 font-bold ml-1">/ {globalStats.totalUnits} หน่วย</span>
                        </span>
                    </div>
                </div>
                
                {/* Progress Bar with Tooltip */}
                <div 
                    className="relative w-full bg-slate-200 h-8 rounded-full overflow-visible shadow-inner p-1.5 cursor-help"
                    title={`รวมผู้มาใช้สิทธิ: ${globalStats.turnout.toLocaleString()} / ผู้มีสิทธิทั้งหมด: ${globalStats.eligible.toLocaleString()} คน`}
                >
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-1000 shadow-2xl relative overflow-hidden group/bar"
                        style={{ width: `${progress}%` }}
                    >
                      {/* Pulse Overlay */}
                      <div className="absolute inset-0 bg-white/30 animate-pulse opacity-50"></div>
                      
                      {/* Animated Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full -translate-x-full animate-[shimmer_3s_infinite] skew-x-[-25deg]"></div>
                    </div>

                    {/* Tooltip Popup on Hover */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-2xl opacity-0 group-hover/progress:opacity-100 transition-all pointer-events-none border border-slate-700 backdrop-blur-md z-20 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                            <Users size={16} className="text-blue-400" />
                            <span>สถิติ: {globalStats.turnout.toLocaleString()} / {globalStats.eligible.toLocaleString()} คะแนน</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900"></div>
                    </div>
                </div>
                
                <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                         รายงานแล้ว
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                         รอผลนับคะแนน
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-10 pl-0 md:pl-16 md:border-l-2 border-slate-200">
                <div className="text-right">
                    <div className="text-7xl font-black text-blue-900 font-numeric tracking-tighter leading-none">{progress}%</div>
                    <div className="text-[11px] text-slate-400 font-black uppercase tracking-[0.5em] mt-4">STATION DATA</div>
                </div>
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] rotate-6 border-4 border-white">
                    <PieChart size={48} />
                </div>
            </div>
        </div>
      </div>

      {/* 3. Mayor Candidate Section - Premium Hero Design */}
      {viewMode === 'MAYOR' && (
        <div className="space-y-16 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-5">
                        <div className="bg-amber-100 p-4 rounded-[1.75rem] text-amber-600 shadow-xl shadow-amber-100/50 border border-amber-200"><Crown size={36} /></div>
                        <h3 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">สรุปอันดับ <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">นายก อบต.</span></h3>
                    </div>
                    <p className="text-slate-400 font-bold text-xl ml-20">ภาพรวมคะแนนสดจาก 23 หมู่บ้าน</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white px-8 py-5 rounded-[2.5rem] border-2 border-slate-100 flex items-center gap-5 shadow-sm">
                     <div className="text-right">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">ยอดรวมบัตรดี</p>
                        <p className="text-3xl font-black text-slate-900 font-numeric">{mayorTotalVotes.toLocaleString()}</p>
                     </div>
                     <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                       <TrendingUp size={32} />
                     </div>
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6">
                {candidateResults.map((c, idx) => {
                    const isLeading = idx === 0 && c.totalVotes > 0;
                    const percent = totalValidVotes > 0 ? (c.totalVotes / totalValidVotes * 100) : 0;
                    const rank = idx + 1;
                    
                    return (
                        <div 
                          key={c.id} 
                          className={`group relative flex flex-col transition-all duration-700 rounded-[4rem] overflow-hidden ${
                            isLeading 
                              ? 'bg-[#0f172a] ring-[16px] ring-amber-400/5 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] border border-amber-400/40 z-10 scale-[1.03]' 
                              : 'bg-white border-2 border-slate-100 shadow-2xl hover:border-blue-200 hover:-translate-y-6'
                          }`}
                        >
                            <div className={`absolute top-0 inset-x-0 h-64 opacity-20 transition-opacity duration-1000 ${isLeading ? 'bg-gradient-to-b from-amber-400/30 to-transparent' : 'bg-gradient-to-b from-blue-500/20 to-transparent'}`}></div>
                            
                            <div className={`absolute top-10 left-10 w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl shadow-2xl z-20 group-hover:scale-110 group-hover:rotate-12 transition-all ${
                              isLeading ? 'bg-amber-400 text-slate-900' : 'bg-slate-900 text-white'
                            }`}>
                              {rank}
                            </div>

                            <div className="pt-24 px-10 pb-6 relative flex flex-col items-center">
                                <div className={`relative w-56 h-56 rounded-[4rem] overflow-hidden border-[6px] transition-all duration-1000 group-hover:scale-105 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] ${isLeading ? 'border-amber-400/80 shadow-amber-400/20' : 'border-white'}`}>
                                    <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover transition-all duration-1000 group-hover:rotate-2 scale-110 group-hover:scale-125" />
                                    {isLeading && <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 via-transparent to-transparent"></div>}
                                </div>
                                <div className={`absolute -bottom-4 px-10 py-3 rounded-[1.75rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl z-20 border-2 ${isLeading ? 'bg-amber-400 text-slate-900 border-amber-500' : 'bg-slate-900 text-white border-slate-700'}`}>
                                   หมายเลข {c.number}
                                </div>
                            </div>

                            <div className="p-10 flex-1 flex flex-col justify-between space-y-10">
                                <div className="text-center space-y-3">
                                    <h4 className={`text-3xl font-black tracking-tight leading-tight ${isLeading ? 'text-white' : 'text-slate-900'}`}>
                                      {c.name.split(' ')[0]} <br/> <span className={`text-xl opacity-80 ${isLeading ? 'text-amber-400' : 'text-slate-500'}`}>{c.name.split(' ').slice(1).join(' ')}</span>
                                    </h4>
                                    <p className={`text-[11px] font-black uppercase tracking-[0.4em] ${isLeading ? 'text-blue-400' : 'text-slate-400'}`}>
                                      {c.party}
                                    </p>
                                </div>

                                <div className={`p-10 rounded-[3rem] flex flex-col items-center justify-center space-y-3 relative overflow-hidden transition-all shadow-inner ${
                                  isLeading ? 'bg-slate-800/80' : 'bg-slate-50'
                                }`}>
                                   <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${isLeading ? 'text-slate-500' : 'text-slate-400'}`}>
                                     คะแนนสะสมสุทธิ
                                   </p>
                                   <span className={`text-6xl font-black font-numeric tracking-tighter ${isLeading ? 'text-amber-400' : 'text-blue-900'}`}>
                                     {c.totalVotes.toLocaleString()}
                                   </span>
                                   <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black shadow-lg ${isLeading ? 'bg-amber-400/20 text-amber-400' : 'bg-blue-600 text-white'}`}>
                                      <Zap size={14} fill="currentColor" /> {percent.toFixed(1)}% Share
                                   </div>
                                </div>

                                <div className="space-y-5">
                                   <div className={`h-4 w-full rounded-full overflow-hidden p-1 shadow-inner ${isLeading ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                      <div 
                                        className={`h-full rounded-full transition-all duration-[2000ms] ease-out shadow-xl relative overflow-hidden ${
                                          isLeading ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-blue-600'
                                        }`} 
                                        style={{ width: `${percent}%` }}
                                      >
                                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                      </div>
                                   </div>
                                   <div className="flex justify-between items-center px-2">
                                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Election Data</span>
                                      {isLeading && <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div> CURRENT LEADER</div>}
                                   </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      )}

      {/* 4. Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-6">
         <StatsCard title="ผู้มาใช้สิทธิ" value={globalStats.turnout} total={globalStats.eligible} color="blue" icon={<Users size={32} />} />
         <StatsCard title="บัตรดี" value={globalStats.good} total={globalStats.turnout} color="emerald" icon={<CheckCircle2 size={32} />} />
         <StatsCard title="บัตรเสีย" value={globalStats.invalid} total={globalStats.turnout} color="red" icon={<X size={32} />} />
         <StatsCard title="ไม่ประสงค์" value={globalStats.noVote} total={globalStats.turnout} color="slate" icon={<AlertCircle size={32} />} />
      </div>

      {/* 5. Zone Explorer - Village Units */}
      <div className="space-y-16 pt-12">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm mx-6 group">
             <div className="space-y-3">
                <h3 className="text-4xl font-black text-slate-900 flex items-center gap-5">
                    <MapIcon className="text-blue-600 group-hover:rotate-12 transition-transform" size={40} /> รายงานผลรายหน่วย
                </h3>
                <p className="text-slate-400 font-bold text-xl ml-16 leading-relaxed">ข้อมูลเจาะลึกรายหมู่บ้าน แยกตามโซนพื้นที่รับผิดชอบ</p>
             </div>
             <div className="relative w-full md:w-[450px]">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={28} />
                <input 
                    type="text" 
                    placeholder="ค้นหาหมู่บ้านหรือเลขหมู่..." 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full pl-20 pr-10 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner text-xl"
                />
             </div>
         </div>

         <div className="space-y-12 px-6">
            {ZONES.map(zone => {
              const zoneVillages = groupedVillages[zone];
              if (zoneVillages.length === 0) return null;
              
              const isExpanded = expandedZones[zone];
              const theme = ZONE_THEMES[zone];
              const reportedInZone = zoneVillages.filter(v => v.status?.isReported).length;
              const totalInZone = zoneVillages.length;
              const zoneProgress = Math.round((reportedInZone / totalInZone) * 100);

              return (
                <div key={zone} className="space-y-8">
                  {/* Modern Zone Toggle */}
                  <button 
                    onClick={() => toggleZone(zone)}
                    className={`w-full group flex flex-col md:flex-row md:items-center justify-between p-10 rounded-[3.5rem] border-2 transition-all text-left ${
                        isExpanded 
                        ? `${theme.bg} ${theme.border} shadow-2xl shadow-${theme.color}-100/50 scale-[1.01]` 
                        : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-8">
                      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all shadow-lg ${
                          isExpanded 
                          ? `${theme.text} bg-white ${theme.border} rotate-6` 
                          : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}>
                        <Navigation2 size={40} />
                      </div>
                      <div>
                        <h4 className={`text-3xl font-black tracking-tight ${isExpanded ? 'text-slate-900' : 'text-slate-700'}`}>{ZONE_LABELS[zone]}</h4>
                        <div className={`flex items-center gap-4 mt-2 text-base font-bold text-slate-400`}>
                          <span className="flex items-center gap-2"><Award size={18} /> {totalInZone} หน่วย</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span className={`flex items-center gap-2 ${reportedInZone === totalInZone ? 'text-emerald-500' : ''}`}>
                            <CheckCircle2 size={18} /> รายงานแล้ว {reportedInZone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 md:mt-0 flex items-center gap-10">
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-end gap-3">
                           <span className={`text-4xl font-black font-numeric ${theme.text}`}>{zoneProgress}%</span>
                           <span className={`text-[11px] font-black uppercase tracking-widest mb-2 text-slate-400`}>Zone Done</span>
                        </div>
                        <div className="w-40 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-1000`} style={{ width: `${zoneProgress}%` }}></div>
                        </div>
                      </div>
                      <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'text-slate-300'}`}>
                        <ChevronDown size={40} />
                      </div>
                    </div>
                  </button>

                  {/* Enhanced Village Units Grid */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 animate-in slide-in-from-top-6 duration-700 pb-12">
                      {zoneVillages.map((v) => {
                          const isVillageExpanded = expandedVillageId === v.id;
                          return (
                              <div key={v.id} className={`bg-white rounded-[3rem] border-2 transition-all duration-500 overflow-hidden group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] ${v.isJustUpdated ? 'ring-[8px] ring-emerald-400/20 border-emerald-400 scale-[1.02] shadow-[0_0_50px_rgba(52,211,153,0.2)]' : v.isCloseRace ? 'border-amber-300 ring-[8px] ring-amber-400/5 shadow-[0_0_40px_rgba(245,158,11,0.1)]' : 'border-slate-100 hover:border-blue-400'}`}>
                                  <div className="p-10 border-b border-slate-100 bg-slate-50/30 relative">
                                      {v.isJustUpdated && (
                                        <div className="absolute top-6 right-10 bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl animate-bounce flex items-center gap-2">
                                            <Zap size={10} fill="white" /> NEW DATA
                                        </div>
                                      )}
                                      {v.isCloseRace && !v.isJustUpdated && (
                                        <div className="absolute top-6 right-10 bg-amber-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-2">
                                            <AlertTriangle size={10} /> CLOSE RACE
                                        </div>
                                      )}
                                      <div className="flex items-center gap-8">
                                          <div className="w-24 h-24 bg-[#0f172a] text-white rounded-[2rem] flex flex-col items-center justify-center font-black shrink-0 border-[6px] border-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                                              <span className="text-[11px] uppercase tracking-widest opacity-60">หมู่ที่</span>
                                              <span className="text-4xl font-numeric leading-none">{v.moo}</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <h4 className="font-black text-slate-900 text-2xl truncate tracking-tight mb-2">{v.name}</h4>
                                              <div className="flex flex-wrap gap-2">
                                                  <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-2xl border transition-colors flex items-center gap-2 ${v.status?.isReported ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-100'}`}>
                                                      {v.status?.isReported ? <Check size={12} /> : null}
                                                      {v.status?.isReported ? 'รายงานแล้ว' : 'รอผล...'}
                                                  </span>
                                                  {v.status?.isVerified && (
                                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-2 rounded-2xl border border-blue-100 uppercase tracking-widest flex items-center gap-2">
                                                      <ShieldCheck size={14} /> VERIFIED
                                                    </span>
                                                  )}
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="p-10">
                                    <div className="flex justify-between items-center mb-8">
                                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">สรุปผลคะแนน</span>
                                        <button 
                                          onClick={() => setExpandedVillageId(isVillageExpanded ? null : v.id)} 
                                          className={`text-xs font-black flex items-center gap-2 px-5 py-3 rounded-[1.25rem] transition-all shadow-sm ${isVillageExpanded ? 'bg-blue-600 text-white shadow-blue-200' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
                                        >
                                          {isVillageExpanded ? <ChevronUp size={18} /> : <Eye size={18} />} 
                                          {isVillageExpanded ? 'ย่อสรุป' : 'ดูรายบุคคล'}
                                        </button>
                                    </div>
                                    
                                    {isVillageExpanded ? (
                                      <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                                          {v.candidatesSorted.map((c, idx) => {
                                            const pct = v.currentTotal > 0 ? (c.count / v.currentTotal * 100) : 0;
                                            const isTopCandidate = idx === 0 && c.count > 0;
                                            return (
                                              <div key={c.id} className={`p-5 rounded-[1.75rem] border-2 transition-all ${isTopCandidate ? 'bg-blue-50 border-blue-200 shadow-md scale-[1.02]' : 'bg-slate-50 border-slate-100'}`}>
                                                <div className="flex justify-between items-center mb-3">
                                                  <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${isTopCandidate ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                                                      {c.number}
                                                    </div>
                                                    <span className="text-base font-black text-slate-800 truncate max-w-[120px]">{c.name.split(' ')[0]}</span>
                                                  </div>
                                                  <div className="text-right">
                                                    <span className="text-2xl font-black text-slate-900 font-numeric">{c.count.toLocaleString()}</span>
                                                    <span className={`text-[11px] font-bold ml-2 ${isTopCandidate ? 'text-blue-600' : 'text-slate-400'}`}>({pct.toFixed(1)}%)</span>
                                                  </div>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                                  <div className={`h-full transition-all duration-1000 ${isTopCandidate ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-400'}`} style={{ width: `${pct}%` }}></div>
                                                </div>
                                              </div>
                                            )
                                          })}
                                          <div className="grid grid-cols-2 gap-4 mt-6">
                                              <div className="bg-rose-50 p-4 rounded-[1.75rem] border border-rose-100 text-center shadow-inner">
                                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">บัตรเสีย</p>
                                                <p className="text-2xl font-black text-rose-600 font-numeric">{v.invalidVotes.toLocaleString()}</p>
                                              </div>
                                              <div className="bg-slate-100 p-4 rounded-[1.75rem] border border-slate-200 text-center shadow-inner">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ไม่ประสงค์</p>
                                                <p className="text-2xl font-black text-slate-800 font-numeric">{v.noVotes.toLocaleString()}</p>
                                              </div>
                                          </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-8">
                                        <div className="flex justify-between items-end">
                                          <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Turnout</span>
                                            <span className="text-4xl font-black text-slate-900 font-numeric tracking-tighter">{v.turnoutPercent.toFixed(1)}%</span>
                                          </div>
                                          <div className="text-right">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Counted</span>
                                            <span className="text-4xl font-black text-blue-900 font-numeric block tracking-tighter">{v.currentTotal.toLocaleString()}</span>
                                          </div>
                                        </div>
                                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1 shadow-inner relative">
                                          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ width: `${v.turnoutPercent}%` }}></div>
                                          {v.turnoutPercent > 100 && (
                                              <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
                                          )}
                                        </div>
                                        {v.status?.lastUpdated && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest justify-center mt-2">
                                                <Clock size={12} /> อัปเดตเมื่อ {new Date(v.status.lastUpdated).toLocaleTimeString('th-TH')}
                                            </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                              </div>
                          );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
         </div>

         {/* 6. Premium Summary Section (The Leaderboard) */}
         <div className="mx-6 mt-20 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="bg-[#0f172a] rounded-[4.5rem] border-4 border-slate-800 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.6)] p-12 lg:p-20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] group-hover:bg-blue-500/10 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 relative z-10 mb-20">
                    <div className="space-y-5">
                        <div className="flex items-center gap-6">
                            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 rounded-[2.25rem] text-slate-950 shadow-[0_20px_40px_-10px_rgba(251,191,36,0.5)] border-2 border-white/20">
                                <Medal size={48} />
                            </div>
                            <div>
                                <h3 className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                                    TOP 3 <span className="text-amber-400 block sm:inline mt-2 sm:mt-0 ml-0 sm:ml-4">STANDINGS</span>
                                </h3>
                                <p className="text-slate-500 font-bold text-2xl mt-4 tracking-tight">ทำเนียบผู้สมัครคะแนนสูงสุด</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-2xl px-12 py-8 rounded-[3rem] border-2 border-slate-800 flex flex-col items-center sm:items-end shadow-2xl">
                        <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] mb-3">ยอดยืนยันผลล่าสุด</span>
                        <div className="flex items-center gap-5">
                            <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                                <TrendingUp className="text-emerald-400" size={28} />
                            </div>
                            <span className="text-5xl lg:text-6xl font-black text-white font-numeric tracking-tighter drop-shadow-lg">{mayorTotalVotes.toLocaleString()}</span>
                            <span className="text-slate-500 text-lg font-black uppercase tracking-widest mt-2">VOTES</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                    {mayorCandidateResults.slice(0, 3).map((c, idx) => {
                        const sharePercent = mayorTotalVotes > 0 ? (c.totalVotes / mayorTotalVotes * 100) : 0;
                        const rankColors = [
                            'from-amber-400 via-amber-300 to-amber-500 shadow-amber-400/30',
                            'from-slate-300 via-slate-200 to-slate-400 shadow-slate-300/30',
                            'from-orange-400 via-orange-300 to-orange-600 shadow-orange-400/30'
                        ];
                        const rankLabels = ['GOLD LEADER', 'SILVER CONTENDER', 'BRONZE STANDING'];
                        
                        return (
                            <div key={c.id} className="bg-slate-900/40 border-2 border-slate-800/80 p-12 rounded-[4rem] flex flex-col justify-between transition-all hover:bg-slate-800/40 hover:border-slate-700 hover:-translate-y-4 group/card relative shadow-2xl overflow-hidden">
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${rankColors[idx].split(' ')[0]} opacity-5 blur-3xl`}></div>
                                
                                <div className="space-y-8 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-700 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] group-hover/card:border-blue-500 transition-all duration-700">
                                            <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover grayscale-[30%] group-hover/card:grayscale-0 transition-all duration-1000" />
                                        </div>
                                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-2xl bg-gradient-to-br ${rankColors[idx]} text-slate-950 border-4 border-white/20`}>
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-amber-400 font-black text-[12px] uppercase tracking-[0.4em]">{rankLabels[idx]}</span>
                                        </div>
                                        <h4 className="text-3xl font-black text-white truncate tracking-tight">{c.name}</h4>
                                        <p className="text-lg font-bold text-blue-400/60 tracking-wide">{c.party}</p>
                                    </div>
                                </div>

                                <div className="mt-16 space-y-6 relative z-10">
                                    <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">SCORE</span>
                                            <span className="text-5xl font-black text-white font-numeric tracking-tighter leading-none">{c.totalVotes.toLocaleString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-amber-400 font-numeric leading-none">{sharePercent.toFixed(1)}%</div>
                                            <span className="text-[10px] font-black text-slate-500 tracking-[0.2em]">OF TOTAL</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-4 bg-slate-800/50 rounded-full overflow-hidden shadow-inner p-1 border border-slate-700/50">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-[2.5s] ease-out shadow-2xl bg-gradient-to-r ${idx === 0 ? 'from-amber-400 via-amber-300 to-amber-500' : 'from-blue-600 to-indigo-600'}`} 
                                            style={{ width: `${sharePercent}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-20 pt-12 border-t-2 border-slate-800 flex flex-col md:flex-row justify-between items-center gap-10 opacity-60 hover:opacity-100 transition-opacity relative z-10">
                    <p className="text-slate-500 text-lg font-bold italic flex items-center gap-3">
                       <ShieldCheck className="text-emerald-500" size={24} /> 
                       แสดงผลข้อมูลที่รายงานและผ่านการตรวจสอบเบื้องต้นอย่างเป็นทางการแล้ว
                    </p>
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-800/50 text-blue-400 font-black text-sm uppercase tracking-widest hover:text-white hover:bg-slate-800 transition-all rounded-2xl border border-slate-700"
                    >
                        กลับขึ้นด้านบน <ChevronUp size={24} />
                    </button>
                </div>
            </div>
         </div>
      </div>

      {/* Internal Style for Shimmer Animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-25deg); }
          100% { transform: translateX(300%) skewX(-25deg); }
        }
      `}</style>
    </div>
  );
};

const StatsCard = ({ title, value, total, color, icon }: any) => {
  const percent = total > 0 ? (value / total * 100) : 0;
  const colors: any = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', accent: 'bg-blue-600', shadow: 'shadow-blue-100' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', accent: 'bg-emerald-600', shadow: 'shadow-emerald-100' },
    red: { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', accent: 'bg-rose-600', shadow: 'shadow-rose-100' },
    slate: { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', accent: 'bg-slate-600', shadow: 'shadow-slate-100' }
  };
  const theme = colors[color];

  return (
    <div className={`bg-white p-12 rounded-[3.5rem] border-2 border-slate-50 shadow-sm transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group hover:-translate-y-4 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${theme.accent.replace('bg-', 'bg-')}/5 rounded-full -translate-y-1/2 translate-x-1/2`}></div>
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className={`p-6 rounded-[2rem] shadow-xl border-2 border-white transition-transform group-hover:rotate-6 ${theme.bg} ${theme.text} ${theme.shadow}`}>
          {icon}
        </div>
        <div className="text-right">
           <div className={`text-4xl font-black font-numeric leading-none ${theme.text}`}>{percent.toFixed(1)}%</div>
           <div className="text-[11px] font-black text-slate-400 uppercase mt-3 tracking-[0.2em]">Share Rate</div>
        </div>
      </div>
      <div className="space-y-3 relative z-10">
        <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">{title}</h4>
        <div className="text-6xl font-black text-slate-900 font-numeric tracking-tighter leading-none">{value.toLocaleString()}</div>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-10 shadow-inner p-0.5 border border-slate-50">
        <div className={`h-full transition-all duration-[2000ms] rounded-full shadow-lg ${theme.accent}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};
