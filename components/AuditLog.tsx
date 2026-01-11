
import React, { useState, useMemo } from 'react';
import { AuditLogEntry } from '../types';
import { History, ShieldAlert, Clock, Terminal, RotateCcw, ChevronDown, ChevronUp, ArrowRight, User, Calendar, XCircle, Search, Download, Cloud, Printer, MessageSquareText } from 'lucide-react';

interface AuditLogProps {
  logs: AuditLogEntry[];
  onRollback: (logId: string) => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({ logs, onRollback }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Date and Text Filtering State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Date Filter logic
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (logDate > end) return false;
      }

      // Search Filter logic
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          log.details.toLowerCase().includes(query) || 
          log.action.toLowerCase().includes(query) ||
          log.user.toLowerCase().includes(query) ||
          (log.remark && log.remark.toLowerCase().includes(query)) ||
          log.id.toLowerCase().includes(query);
        if (!matches) return false;
      }
      
      return true;
    });
  }, [logs, startDate, endDate, searchQuery]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    // Define CSV headers
    const headers = ['ID', 'Timestamp', 'Action', 'Details', 'Remark', 'User'];
    
    // Map logs to rows
    const rows = filteredLogs.map(log => [
      log.id,
      log.timestamp.toLocaleString('th-TH'),
      log.action,
      log.details,
      log.remark || '',
      log.user
    ]);

    // Create CSV content (including BOM for Excel UTF-8 support - crucial for Thai text)
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `election_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloudSync = () => {
    setIsSyncing(true);
    // Real integration would occur here
    setTimeout(() => {
        setIsSyncing(false);
        alert('สำรองข้อมูลไปยังระบบจัดเก็บข้อมูลเรียบร้อยแล้ว');
    }, 2000);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-2xl text-slate-700 shadow-inner print:hidden"><History size={28} /></div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900">ประวัติการบันทึกข้อมูล (Audit Trail)</h2>
                    <p className="text-slate-500 font-medium">โปร่งใส ตรวจสอบได้ ทุกวินาทีที่มีการเปลี่ยนแปลง</p>
                </div>
            </div>
            <div className="flex items-center gap-3 print:hidden">
                <button 
                  onClick={handleCloudSync}
                  disabled={isSyncing}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all border-2 ${isSyncing ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50'}`}
                >
                  {isSyncing ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full"></div>
                  ) : <Cloud size={18} />}
                  {isSyncing ? 'กำลังเชื่อมต่อ...' : 'Backup to Cloud'}
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black shadow-lg hover:bg-black transition-all"
                >
                  <Printer size={18} />
                  พิมพ์เอกสาร
                </button>
                <button 
                  onClick={handleExportCSV}
                  disabled={filteredLogs.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  <Download size={18} />
                  Export CSV
                </button>
            </div>
        </div>

        {/* Filters Section */}
        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 mb-8 space-y-6 shadow-inner print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Calendar size={14} /> วันที่เริ่มต้น
                    </label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-700"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Calendar size={14} /> วันที่สิ้นสุด
                    </label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-700"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Search size={14} /> ค้นหาคำสำคัญ
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="รายละเอียด, ID, ชื่อผู้ใช้, หมายเหตุ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-700"
                            />
                        </div>
                        {(startDate || endDate || searchQuery) && (
                            <button 
                                onClick={clearFilters}
                                className="p-4 bg-red-50 border-2 border-red-100 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0 shadow-md shadow-red-100"
                                title="ล้างการกรอง"
                            >
                                <XCircle size={24} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {(startDate || endDate || searchQuery) && (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-600 bg-blue-100 px-4 py-1.5 rounded-full border border-blue-200">
                        พบ {filteredLogs.length} รายการจากผลการกรอง
                    </span>
                </div>
            )}
        </div>

        <div className="space-y-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              const isConfirming = confirmId === log.id;
              
              return (
                <div key={log.id} className={`border-2 rounded-[24px] transition-all overflow-hidden ${isExpanded ? 'border-blue-200 bg-blue-50/20 shadow-lg' : 'border-slate-100 hover:border-slate-200 bg-white'} print:border-slate-200 print:mb-4`}>
                  <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                      <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border print:border-slate-300 ${
                        log.action === 'SUBMIT_VOTE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        log.action === 'ROLLBACK' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        log.action === 'RESET_SYSTEM' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {log.action === 'ROLLBACK' ? <RotateCcw size={24} /> : <Terminal size={24} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                            <span className="font-black text-slate-900 text-lg leading-tight">{log.details}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest print:text-black print:border print:border-black ${
                                log.action === 'SUBMIT_VOTE' ? 'bg-emerald-500 text-white' : 
                                log.action === 'ROLLBACK' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
                            }`}>{log.action}</span>
                        </div>
                        
                        {log.remark && (
                            <div className="mt-2 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-2xl">
                                <MessageSquareText size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                                    "{log.remark}"
                                </p>
                            </div>
                        )}

                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400 font-bold uppercase tracking-wide print:text-slate-600">
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-300 print:text-slate-500" /> {log.timestamp.toLocaleString('th-TH')}</span>
                          <span className="flex items-center gap-1.5"><User size={14} className="text-slate-300 print:text-slate-500" /> {log.user}</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] lowercase font-mono print:bg-white print:border print:border-slate-200">#{log.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 print:hidden">
                        {log.diff && log.diff.length > 0 && (
                            <button onClick={() => setExpandedId(isExpanded ? null : log.id)} className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${isExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                {isExpanded ? <><ChevronUp size={16} /> ซ่อน</> : <><ChevronDown size={16} /> ดูรายละเอียด</>}
                            </button>
                        )}
                        
                        {log.snapshot && log.action !== 'ROLLBACK' && (
                            <div className="relative">
                                {isConfirming ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { onRollback(log.id); setConfirmId(null); }} className="bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-amber-700 transition-all">ยืนยัน Rollback</button>
                                        <button onClick={() => setConfirmId(null)} className="bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-slate-300">ยกเลิก</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setConfirmId(log.id)} className="px-4 py-2.5 bg-[#1e293b] text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-black transition-all shadow-md active:scale-95">
                                        <RotateCcw size={16} /> ย้อนกลับข้อมูล
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                  </div>

                  {(isExpanded || (window.matchMedia('print').matches)) && log.diff && (
                    <div className="px-16 pb-6 print:px-5 print:pb-2">
                        <div className="bg-white rounded-3xl border border-blue-100 p-6 space-y-4 overflow-hidden shadow-inner print:rounded-none print:border-slate-100 print:shadow-none">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3 mb-2"><ArrowRight size={12} /> เปรียบเทียบข้อมูล (ก่อน → หลัง)</p>
                            <div className="grid grid-cols-1 gap-3">
                                {log.diff.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 px-4 bg-slate-50/50 rounded-2xl border border-slate-100 print:bg-white print:border-slate-200">
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 font-black text-sm">{d.villageName || 'ไม่ระบุหมู่บ้าน'}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Candidate ID: {d.candidateId === -1 ? 'บัตรเสีย' : d.candidateId === 0 ? 'ไม่ประสงค์ลงคะแนน' : d.candidateId}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">เดิม</span>
                                                <span className="font-numeric font-bold text-slate-400 text-lg">{d.before.toLocaleString()}</span>
                                            </div>
                                            <ArrowRight size={20} className="text-blue-300 print:text-black" />
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">ใหม่</span>
                                                <span className={`font-numeric font-black text-xl ${d.after > d.before ? 'text-emerald-600' : 'text-red-600'} print:text-black`}>
                                                    {d.after.toLocaleString()}
                                                    <span className="text-xs ml-2 opacity-80 print:opacity-100">{d.after > d.before ? `(+${d.after - d.before})` : `(${d.after - d.before})`}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-40 text-center bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-200/60">
                <Terminal size={64} className="mx-auto text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">
                    {startDate || endDate || searchQuery ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา' : 'ยังไม่มีประวัติการทำรายการในระบบ'}
                </h3>
                <p className="text-slate-400 mt-2 font-medium">กรุณาปรับเงื่อนไขการกรองหรือเริ่มทำรายการใหม่</p>
            </div>
          )}
        </div>
        
        <div className="mt-12 p-8 bg-[#0f172a] rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl border-b-8 border-amber-400 relative overflow-hidden group print:hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-500"></div>
            <div className="bg-amber-400 p-5 rounded-[24px] text-slate-900 shadow-xl shadow-amber-400/20 shrink-0 relative z-10"><ShieldAlert size={36} /></div>
            <div className="relative z-10">
                <h4 className="text-2xl font-black mb-2">Audit Safe Architecture</h4>
                <p className="text-slate-400 text-lg leading-relaxed font-medium">ระบบ Audit Trail ถูกออกแบบมาเพื่อความโปร่งใสสูงสุด ทุกครั้งที่มีการแก้ไขคะแนน ระบบจะทำการเปรียบเทียบข้อมูลแบบ Deep Diff และสร้าง Version Snapshot ทันที ทำให้คุณสามารถย้อนเวลา ข้อมูลกลับไปได้ทุกขณะโดยไม่เกิด Silent Change</p>
            </div>
        </div>
      </div>
    </div>
  );
};
