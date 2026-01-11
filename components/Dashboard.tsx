
import React, { useMemo, useState } from 'react';
import { VoteRecord, Village, VillageStatus } from '../types';
import { CANDIDATES, MEMBER_CANDIDATES } from '../constants';
import { Search, ChevronLeft, ChevronRight, Trophy, Users, FileBarChart, Activity, CheckCircle2, Clock, AlertCircle, Scale, X, Info, Medal, RefreshCw, Layers, CalendarDays, LayoutGrid, MapPin, BarChart3, PieChart } from 'lucide-react';

interface DashboardProps {
  votes: VoteRecord[];
  villages: Village[];
  statuses: VillageStatus[];
  lastUpdated: Date;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 24;

export const Dashboard: React.FC<DashboardProps> = ({ votes, villages, statuses, onRefresh }) => {
  const [viewMode, setViewMode] = useState<'MAYOR' | 'MEMBER'>('MAYOR');
  const [filterText, setFilterText] = useState('');
  const [candidateFilterText, setCandidateFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const electionDateDisplay = "11 มกราคม 2569";

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
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

  const candidateResults = useMemo(() => {
    const list = viewMode === 'MAYOR' ? CANDIDATES : Object.values(MEMBER_CANDIDATES).flat();
    const uniqueCandidates = Array.from(new Set(list.map(c => c.id))).map(id => list.find(c => c.id === id)!);
    
    let results = uniqueCandidates.map(c => ({
      ...c,
      totalVotes: relevantVotes.filter(v => v.candidateId === c.id).reduce((sum, r) => sum + r.count, 0)
    }));

    if (candidateFilterText) {
       const lowerFilter = candidateFilterText.toLowerCase();
       results = results.filter(c => 
         c.name.toLowerCase().includes(lowerFilter) || 
         c.party.toLowerCase().includes(lowerFilter)
       );
    }

    if (viewMode === 'MAYOR') {
        return results.sort((a, b) => b.totalVotes - a.totalVotes);
    }
    return results;
  }, [relevantVotes, viewMode, candidateFilterText]);

  const totalValidVotes = useMemo(() => {
      const list = viewMode === 'MAYOR' ? CANDIDATES : Object.values(MEMBER_CANDIDATES).flat();
      const uniqueCandidates = Array.from(new Set(list.map(c => c.id))).map(id => list.find(c => c.id === id)!);
      return uniqueCandidates.reduce((acc, c) => {
         const votes = relevantVotes.filter(v => v.candidateId === c.id).reduce((sum, r) => sum + r.count, 0);
         return acc + votes;
      }, 0);
  }, [relevantVotes, viewMode]);

  const allVillageStats = useMemo(() => {
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
                          (candidatesSorted[0].count - candidatesSorted[1].count) / (goodVotes || 1) <= 0.05;

      return { ...v, currentTotal, goodVotes, invalidVotes, noVotes, turnoutPercent, candidatesSorted, status, isCloseRace };
    });
  }, [villages, relevantVotes, statuses, viewMode]);

  const filteredVillages = useMemo(() => {
    return allVillageStats.filter(v => v.name.includes(filterText) || v.moo.toString().includes(filterText));
  }, [allVillageStats, filterText]);

  const paginatedVillages = filteredVillages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* 1. Modern Header */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Activity size={200} />
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative z-10">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100">Live Dashboard</span>
                   <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                      <Clock size={12} /> Last update: {new Date().toLocaleTimeString('th-TH')}
                   </span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    ระบบรายงานผลเลือกตั้ง
                </h1>
                <p className="text-slate-500 font-medium text-lg flex items-center gap-2">
                    อบต.เหนือเมือง <span className="w-1 h-1 rounded-full bg-slate-300"></span> {electionDateDisplay}
                </p>
            </div>

            <div className="flex items-center gap-3">
                 <button 
                  onClick={handleRefreshClick}
                  className={`flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all font-bold shadow-sm ${isRefreshing ? 'opacity-70' : ''}`}
                >
                  <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>รีเฟรชข้อมูล</span>
                </button>
                <div className="bg-slate-100 p-1 rounded-2xl flex">
                   <button 
                     onClick={() => { setViewMode('MAYOR'); setCurrentPage(1); }}
                     className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${viewMode === 'MAYOR' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     นายก อบต.
                   </button>
                   <button 
                     onClick={() => { setViewMode('MEMBER'); setCurrentPage(1); }}
                     className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${viewMode === 'MEMBER' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     สมาชิก อบต.
                   </button>
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-10 bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers size={16} className="text-blue-500" />
                        ความคืบหน้าการนับคะแนน
                    </span>
                    <span className="text-2xl font-black text-slate-900 font-numeric">
                        {globalStats.reportedUnits} <span className="text-base text-slate-400 font-bold">/ {globalStats.totalUnits} หน่วย</span>
                    </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.3)] relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_linear_infinite]" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 pl-0 md:pl-6 md:border-l border-slate-200">
                <div className="text-right">
                    <div className="text-4xl font-black text-blue-900 font-numeric leading-none">{progress}%</div>
                    <div className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Completed</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <PieChart size={24} />
                </div>
            </div>
        </div>
      </div>

      {/* 2. Global Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatsCard 
            title="ผู้มาใช้สิทธิ (Turnout)" 
            value={globalStats.turnout} 
            total={globalStats.eligible} 
            color="blue" 
            icon={<Users size={24} />} 
         />
         <StatsCard 
            title="บัตรดี (Valid)" 
            value={globalStats.good} 
            total={globalStats.turnout} 
            color="emerald" 
            icon={<CheckCircle2 size={24} />} 
         />
         <StatsCard 
            title="บัตรเสีย (Invalid)" 
            value={globalStats.invalid} 
            total={globalStats.turnout} 
            color="red" 
            icon={<X size={24} />} 
         />
         <StatsCard 
            title="ไม่ประสงค์ (No Vote)" 
            value={globalStats.noVote} 
            total={globalStats.turnout} 
            color="slate" 
            icon={<AlertCircle size={24} />} 
         />
      </div>

      {/* 3. Candidate Leaderboard (Only for Mayor) */}
      {viewMode === 'MAYOR' && (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <Trophy className="text-amber-500" />
                <h3 className="text-xl font-black text-slate-800">สรุปผลคะแนนผู้สมัครนายกฯ (อย่างไม่เป็นทางการ)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {candidateResults.map((c, idx) => {
                    const isLeading = idx === 0 && c.totalVotes > 0;
                    const percent = totalValidVotes > 0 ? (c.totalVotes / totalValidVotes * 100) : 0;
                    
                    return (
                        <div key={c.id} className={`relative bg-white rounded-3xl p-6 border-2 transition-all hover:-translate-y-1 hover:shadow-xl ${isLeading ? 'border-amber-400 shadow-amber-100 ring-4 ring-amber-50' : 'border-slate-100 shadow-sm'}`}>
                            {isLeading && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Current Leader</div>}
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white mb-4 shadow-md ${isLeading ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-slate-800'}`}>
                                    {c.number}
                                </div>
                                <h4 className="font-bold text-slate-900 text-lg line-clamp-1">{c.name}</h4>
                                <span className="text-xs text-slate-400 font-medium mb-6 bg-slate-50 px-2 py-1 rounded-lg mt-1">{c.party}</span>
                                
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-3xl font-black text-slate-800 font-numeric">{c.totalVotes.toLocaleString()}</span>
                                        <span className="text-sm font-bold text-slate-400">{percent.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: c.color }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      )}

      {/* 4. Village Results Explorer (Modern Card Grid) */}
      <div className="space-y-6 pt-4">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <FileBarChart className="text-blue-600" />
                    รายงานผลรายหน่วยเลือกตั้ง
                </h3>
                <p className="text-slate-500 text-sm font-medium mt-1">ข้อมูลละเอียดรายหมู่บ้าน/หน่วยเลือกตั้ง</p>
             </div>
             <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อบ้าน หรือ หมู่ที่..." 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
             </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedVillages.map((v) => (
                <div key={v.id} className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden group hover:shadow-xl hover:-translate-y-1 ${v.isCloseRace ? 'border-amber-400 ring-4 ring-amber-50' : 'border-slate-200'}`}>
                    {/* Card Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-6 w-full">
                            <div className="w-32 h-32 bg-[#1e293b] text-white rounded-3xl flex items-center justify-center font-black text-8xl shadow-2xl shrink-0 border-4 border-white ring-4 ring-slate-100/50">
                                {v.moo}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-900 text-3xl leading-tight mb-2">{v.name}</h4>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs font-black uppercase tracking-wider bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-500 shadow-sm">Zone {v.zone}</span>
                                    {v.status?.isReported ? (
                                        <span className="flex items-center gap-1 text-xs font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                            <CheckCircle2 size={12} /> Reported
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                            <Clock size={12} /> Pending
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Body: Candidates */}
                    <div className="p-5 flex-1 space-y-6">
                        {v.candidatesSorted.length > 0 ? (
                            v.candidatesSorted.map((c, i) => {
                                const pct = v.goodVotes > 0 ? (c.count / v.goodVotes * 100) : 0;
                                return (
                                    <div key={c.id} className="space-y-2">
                                        <div className="flex justify-between items-center gap-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-black shrink-0 ${i === 0 ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>{c.number}</span>
                                                <span className={`font-black text-xl truncate ${i === 0 ? 'text-slate-900' : 'text-slate-500'}`}>{c.name}</span>
                                            </div>
                                            <div className="font-numeric font-black text-slate-700 text-xl shrink-0">
                                                {c.count.toLocaleString()} <span className="text-sm text-slate-400 font-bold opacity-60">({pct.toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }}></div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="py-8 text-center opacity-40">
                                <BarChart3 className="mx-auto mb-2" />
                                <span className="text-xs font-bold uppercase">Waiting for data</span>
                            </div>
                        )}
                    </div>

                    {/* New Footer: Total Result / Percentage Summary */}
                    <div className="bg-slate-50 p-4 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                             <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                 <div className="text-xs font-black text-emerald-600 uppercase tracking-wide mb-1">บัตรดี (Good)</div>
                                 <div className="flex justify-between items-baseline">
                                     <span className="font-numeric font-black text-emerald-800 text-lg">{v.goodVotes.toLocaleString()}</span>
                                     <span className="text-xs text-emerald-600/70 font-bold">{v.currentTotal > 0 ? ((v.goodVotes/v.currentTotal)*100).toFixed(0) : 0}%</span>
                                 </div>
                             </div>
                             <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                 <div className="text-xs font-black text-red-600 uppercase tracking-wide mb-1">บัตรเสีย (Bad)</div>
                                 <div className="flex justify-between items-baseline">
                                     <span className="font-numeric font-black text-red-800 text-lg">{v.invalidVotes.toLocaleString()}</span>
                                     <span className="text-xs text-red-600/70 font-bold">{v.currentTotal > 0 ? ((v.invalidVotes/v.currentTotal)*100).toFixed(0) : 0}%</span>
                                 </div>
                             </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                             <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm flex-1">
                                 <div className="text-xs font-black text-slate-500 uppercase tracking-wide mb-1">ไม่ประสงค์</div>
                                 <div className="flex justify-between items-baseline">
                                     <span className="font-numeric font-black text-slate-700 text-lg">{v.noVotes.toLocaleString()}</span>
                                 </div>
                             </div>
                             <div className={`flex-1 p-2.5 rounded-xl border shadow-sm flex flex-col justify-center ${v.turnoutPercent > 70 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                                 <div className={`text-[10px] font-black uppercase tracking-wide mb-0.5 ${v.turnoutPercent > 70 ? 'text-blue-100' : 'text-slate-400'}`}>มาใช้สิทธิ (Turnout)</div>
                                 <div className="flex justify-between items-baseline">
                                     <span className="font-numeric font-black text-xl leading-none">{v.currentTotal.toLocaleString()}</span>
                                     <span className={`text-xs font-black ${v.turnoutPercent > 70 ? 'text-white' : 'text-blue-600'}`}>{v.turnoutPercent.toFixed(1)}%</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            ))}
         </div>

         {/* Pagination */}
         {filteredVillages.length > ITEMS_PER_PAGE && (
              <div className="p-8 bg-white border border-slate-200 rounded-3xl flex justify-center items-center gap-6 shadow-sm">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                  >
                      <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {Math.ceil(filteredVillages.length / ITEMS_PER_PAGE)}</span>
                  <button 
                    disabled={currentPage === Math.ceil(filteredVillages.length / ITEMS_PER_PAGE)}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                  >
                      <ChevronRight size={20} />
                  </button>
              </div>
          )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

// Helper Sub-component for Top Stats
const StatsCard = ({ title, value, total, color, icon }: any) => {
    const percent = total > 0 ? (value / total * 100) : 0;
    
    const colorStyles: any = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', bar: 'bg-blue-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', bar: 'bg-emerald-500' },
        red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', bar: 'bg-red-500' },
        slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', bar: 'bg-slate-500' },
    };
    
    const style = colorStyles[color] || colorStyles.slate;

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${style.bg} ${style.text} ${style.border} border`}>
                    {icon}
                </div>
                <div className={`px-2 py-1 rounded-lg ${style.bg} ${style.text} text-xs font-black uppercase tracking-wider`}>
                    {percent.toFixed(1)}%
                </div>
            </div>
            <div>
                <div className="text-slate-500 text-sm font-black uppercase tracking-widest mb-1">{title}</div>
                <div className={`text-4xl font-black ${style.text} font-numeric tracking-tight mb-4`}>
                    {value.toLocaleString()}
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${percent}%` }}></div>
                </div>
            </div>
        </div>
    );
};
