
import React, { useState, useEffect, useCallback } from 'react';
import { Village, VillageStatus, Candidate, ElectionType } from '../types';
import { CANDIDATES, MEMBER_CANDIDATES } from '../constants';
import { Save, AlertTriangle, Check, User, Calculator, Trash2, X, AlertCircle, Undo2, Redo2, ChevronRight, Hash, ShieldCheck, DatabaseZap, HelpCircle, ArrowRight, ClipboardEdit, BarChart3, PieChart } from 'lucide-react';

interface VoteEntryProps {
  villages: Village[];
  statuses: VillageStatus[];
  onSubmit: (villageId: number, votes: {candidateId: number, count: number}[], type: ElectionType, remark?: string) => void;
  onReset: () => void;
}

export const VoteEntry: React.FC<VoteEntryProps> = ({ villages, statuses, onSubmit, onReset }) => {
  const [selectedVillageId, setSelectedVillageId] = useState<number>(villages[0]?.id || 1);
  const [electionType, setElectionType] = useState<ElectionType>(ElectionType.MAYOR);
  
  const [voteInputs, setVoteInputs] = useState<Record<number, string>>({});
  const [invalidVoteStr, setInvalidVoteStr] = useState('');
  const [noVoteStr, setNoVoteStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Submit Confirmation States
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkInput, setRemarkInput] = useState('');
  const [preparedData, setPreparedData] = useState<{candidateId: number, count: number}[]>([]);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFactoryResetConfirm, setShowFactoryResetConfirm] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');

  const selectedVillage = villages.find(v => v.id === selectedVillageId);
  const activeCandidates = electionType === ElectionType.MAYOR ? CANDIDATES : (MEMBER_CANDIDATES[selectedVillageId] || []);

  useEffect(() => {
    setVoteInputs({});
    setInvalidVoteStr('');
    setNoVoteStr('');
  }, [selectedVillageId, electionType]);

  useEffect(() => {
    if (!showResetConfirm && !showFactoryResetConfirm) {
      setResetConfirmationInput('');
    }
  }, [showResetConfirm, showFactoryResetConfirm]);

  // Real-time Calculations
  const invalid = parseInt(invalidVoteStr) || 0;
  const noVote = parseInt(noVoteStr) || 0;
  const candidatesSum = Object.values(voteInputs).reduce<number>((sum, val) => sum + (parseInt(val as string) || 0), 0);
  const total = candidatesSum + invalid + noVote;

  const totalVoters = selectedVillage?.totalVoters || 0;
  const isOverLimit = total > totalVoters;
  const turnoutPercent = totalVoters > 0 ? (total / totalVoters) * 100 : 0;

  const prepareSubmission = () => {
    const data = activeCandidates.map(c => ({ candidateId: c.id, count: parseInt(voteInputs[c.id]) || 0 }));
    data.push({ candidateId: -1, count: invalid });
    data.push({ candidateId: 0, count: noVote });
    setPreparedData(data);
  };

  const handleQuickSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (total === 0) return;
    prepareSubmission();
    setShowSubmitConfirm(true);
  };

  const handleSaveWithRemark = () => {
    if (total === 0) return;
    prepareSubmission();
    setShowRemarkModal(true);
  };

  const confirmSubmission = async (withRemark: boolean = false) => {
    setShowSubmitConfirm(false);
    setShowRemarkModal(false);
    setIsSubmitting(true);

    // Simulate API network delay
    setTimeout(() => {
      onSubmit(selectedVillageId, preparedData, electionType, withRemark ? remarkInput : undefined);
      setIsSubmitting(false);
      setRemarkInput('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 600);
  };

  const handleFactoryReset = () => {
    localStorage.clear(); 
    localStorage.removeItem('ELECTION_APP_DATA_V3_PROD');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      
      {/* ส่วนควบคุมการเลือกหน่วย */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
                <ShieldCheck size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-800">ระบบบันทึกผลคะแนนรายหน่วย</h2>
                <p className="text-slate-500 font-medium">องค์การบริหารส่วนตำบลเหนือเมือง</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-base font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-black">01</div>
                เลือกหน่วยเลือกตั้ง
            </label>
            <div className="relative">
                <select 
                  className="w-full p-5 pl-5 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all text-xl font-black text-slate-900 appearance-none cursor-pointer hover:border-slate-300 shadow-inner"
                  value={selectedVillageId}
                  onChange={(e) => setSelectedVillageId(parseInt(e.target.value))}
                >
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>หมู่ที่ {v.moo} - {v.name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <ChevronRight className="rotate-90" />
                </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-base font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-black">02</div>
                ประเภทการเลือกตั้ง
            </label>
            <div className="flex bg-slate-100 p-2 rounded-2xl border-2 border-slate-200 h-[76px] shadow-inner">
              <button 
                onClick={() => setElectionType(ElectionType.MAYOR)}
                className={`flex-1 text-lg font-black rounded-xl transition-all duration-300 ${electionType === ElectionType.MAYOR ? 'bg-white text-blue-900 shadow-md transform scale-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                นายก อบต.
              </button>
              <button 
                onClick={() => setElectionType(ElectionType.MEMBER)}
                className={`flex-1 text-lg font-black rounded-xl transition-all duration-300 ${electionType === ElectionType.MEMBER ? 'bg-white text-blue-900 shadow-md transform scale-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                สมาชิก อบต.
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* แบบฟอร์มกรอกคะแนน */}
      <div className="bg-white rounded-[48px] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#1e293b] p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white border-b-8 border-amber-400">
          <div className="flex items-center gap-6">
             <div className="bg-amber-400 p-4 rounded-2xl text-slate-900 shadow-lg shadow-amber-900/40">
                <Calculator size={36} />
             </div>
             <div>
                <h3 className="font-black text-2xl sm:text-3xl leading-tight">หมู่ที่ {selectedVillage?.moo} - {selectedVillage?.name}</h3>
                <p className="text-amber-400/80 text-sm font-black uppercase tracking-widest mt-1">
                   ส.ถ./ผ.ถ. 5/7 บันทึกข้อมูลเรียลไทม์
                </p>
             </div>
          </div>
        </div>

        <form onSubmit={handleQuickSave} className="p-8 sm:p-12">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            
            {/* รายชื่อผู้สมัคร */}
            <div className="xl:col-span-2 space-y-8">
              <h4 className="text-base font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-50 pb-4 flex items-center gap-2">
                <Hash size={16} /> บัญชีรายชื่อผู้สมัครรับเลือกตั้ง
              </h4>
              
              <div className="space-y-5">
                {activeCandidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-6 p-5 rounded-[24px] hover:bg-slate-50/80 transition-all duration-300 border-2 border-transparent hover:border-blue-100 group">
                    <div className="w-24 h-24 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-5xl shadow-xl transition-all shrink-0">
                      {c.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-3xl leading-tight truncate">{c.name}</p>
                      <p className="text-sm text-slate-400 font-bold mt-1.5 uppercase tracking-widest bg-slate-100 inline-block px-3 py-1 rounded-full">{c.party}</p>
                    </div>
                    <div className="w-32 sm:w-44 shrink-0">
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full text-right p-4 sm:p-6 bg-slate-50 border-2 border-slate-200 rounded-[20px] focus:border-blue-600 focus:ring-8 focus:ring-blue-100 font-numeric text-3xl sm:text-5xl font-black text-blue-900 transition-all placeholder:text-slate-200 shadow-inner outline-none"
                        placeholder="0"
                        value={voteInputs[c.id] || ''}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setVoteInputs(prev => ({ ...prev, [c.id]: val }));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* สรุปคะแนนบัตร */}
            <div className="space-y-8">
               <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-200 space-y-10 shadow-inner sticky top-24">
                  <h4 className="text-base font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 pb-4">
                    <AlertCircle size={18} className="text-slate-400" />
                    สถานะจำนวนบัตรเลือกตั้ง
                  </h4>
                  
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-red-500 uppercase tracking-widest ml-1">จำนวนบัตรเสีย (Invalid)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        className="w-full text-right p-6 bg-white border-2 border-slate-200 rounded-[24px] focus:border-red-500 focus:ring-8 focus:ring-red-50 font-numeric text-4xl font-black text-red-600 placeholder:text-slate-100 shadow-sm outline-none"
                        placeholder="0"
                        value={invalidVoteStr}
                        onChange={(e) => setInvalidVoteStr(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">ไม่ประสงค์ลงคะแนน (No Vote)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        className="w-full text-right p-6 bg-white border-2 border-slate-200 rounded-[24px] focus:border-slate-500 focus:ring-8 focus:ring-slate-100 font-numeric text-4xl font-black text-slate-700 placeholder:text-slate-100 shadow-sm outline-none"
                        placeholder="0"
                        value={noVoteStr}
                        onChange={(e) => setNoVoteStr(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t-2 border-slate-200 space-y-5">
                    <div className="flex justify-between items-center text-base font-black text-slate-400 uppercase tracking-widest">
                      <span>ยอดรวมผู้มีสิทธิ:</span>
                      <span className="text-slate-900 text-2xl font-numeric">{totalVoters.toLocaleString()}</span>
                    </div>

                    <div className={`flex flex-col bg-white p-6 rounded-[24px] border-2 shadow-md transition-all duration-300 ${isOverLimit ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-black text-slate-800 text-xl uppercase tracking-tight">คะแนนรวมสุทธิ:</span>
                        <div className="text-right">
                             <span className={`text-6xl font-black font-numeric leading-none ${isOverLimit ? 'text-red-600' : 'text-blue-900'}`}>{total.toLocaleString()}</span>
                             <span className="text-lg font-bold text-slate-400 ml-2">/ {totalVoters.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Breakdown Display */}
                      <div className="flex justify-end items-center gap-3 text-sm font-bold text-slate-500 mb-4 border-t border-slate-100 pt-3 border-dashed">
                          <span className="flex items-center gap-1">ผู้สมัคร <span className="text-slate-600 font-numeric">{candidatesSum.toLocaleString()}</span></span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="flex items-center gap-1">บัตรเสีย <span className="text-red-500 font-numeric">{invalid.toLocaleString()}</span></span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="flex items-center gap-1">ไม่ประสงค์ <span className="text-slate-600 font-numeric">{noVote.toLocaleString()}</span></span>
                      </div>
                      
                      {/* Visual Progress Bar */}
                      <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative">
                         {isOverLimit && (
                             <div className="absolute inset-0 bg-red-100 w-full h-full striped-bg opacity-50 animate-pulse"></div>
                         )}
                         <div 
                            className={`h-full rounded-full transition-all duration-500 ease-out ${isOverLimit ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                            style={{ width: `${Math.min(turnoutPercent, 100)}%` }}
                         ></div>
                      </div>
                      <div className="flex justify-between mt-3 text-xs font-black uppercase tracking-widest">
                          <span className={isOverLimit ? 'text-red-600' : 'text-blue-600'}>
                             {turnoutPercent.toFixed(1)}% Turnout
                          </span>
                          {isOverLimit && <span className="text-red-600 flex items-center gap-1"><AlertTriangle size={12} /> Over Limit!</span>}
                      </div>
                    </div>
                  </div>
                  
                  {isOverLimit && (
                    <div className="bg-red-50 text-red-700 p-5 rounded-[24px] text-sm font-bold flex items-start gap-4 border-2 border-red-200 animate-in slide-in-from-bottom-2">
                      <AlertTriangle size={32} className="shrink-0 text-red-600 mt-1" />
                      <div>
                        <p className="text-lg font-black leading-tight">ยอดคะแนนเกินจริง!</p>
                        <p className="mt-1 text-red-600/80">ตรวจพบจำนวนคะแนนรวมเกินจำนวนผู้มีสิทธิ {(total - totalVoters).toLocaleString()} ใบ กรุณาตรวจสอบข้อมูลอีกครั้ง</p>
                      </div>
                    </div>
                  )}
               </div>

               <div className="space-y-4 pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting || total === 0 || isOverLimit}
                    className={`w-full py-6 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 shadow-xl transition-all transform active:scale-95 border-b-4 ${isSubmitting || total === 0 || isOverLimit ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-800 shadow-blue-100'}`}
                  >
                    {isSubmitting ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save size={24} />
                        บันทึกข้อมูลด่วน
                      </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={handleSaveWithRemark}
                    disabled={isSubmitting || total === 0 || isOverLimit}
                    className={`w-full py-6 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 shadow-xl transition-all transform active:scale-95 border-b-4 ${isSubmitting || total === 0 || isOverLimit ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none' : 'bg-slate-800 text-white hover:bg-black border-slate-900 shadow-slate-100'}`}
                  >
                    <ClipboardEdit size={24} />
                    บันทึกพร้อมประวัติ (Note)
                  </button>
               </div>
            </div>
          </div>
        </form>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[48px] p-10 max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-4 bg-blue-600"></div>
              <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 ring-8 ring-blue-50/50">
                      <HelpCircle size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">ยืนยันการบันทึก</h3>
                  <p className="text-slate-500 font-bold mb-8">กรุณาตรวจสอบข้อมูลก่อนการส่งเข้าระบบ</p>

                  <div className="w-full space-y-4 mb-10">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">หน่วยเลือกตั้ง</p>
                          <p className="text-xl font-black text-slate-900 flex items-center gap-2">
                             หมู่ที่ {selectedVillage?.moo} <ArrowRight size={16} className="text-slate-300" /> {selectedVillage?.name}
                          </p>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">ประเภทการเลือกตั้ง</p>
                          <p className="text-xl font-black text-blue-800">
                             {electionType === ElectionType.MAYOR ? 'นายก อบต.' : 'สมาชิก อบต.'}
                          </p>
                      </div>
                      <div className="bg-blue-900 p-5 rounded-2xl text-left shadow-lg">
                          <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-1">คะแนนรวมสุทธิ</p>
                          <p className="text-4xl font-black text-white font-numeric">
                             {total.toLocaleString()} <span className="text-lg font-bold opacity-60">คะแนน</span>
                          </p>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                      <button 
                        onClick={() => setShowSubmitConfirm(false)}
                        className="py-5 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all text-lg"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        onClick={() => confirmSubmission(false)}
                        className="py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 text-lg border-b-4 border-blue-800"
                      >
                        ยืนยันส่งข้อมูล
                      </button>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* Remark Modal */}
      {showRemarkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl border border-slate-100 relative">
              <div className="absolute top-0 inset-x-0 h-4 bg-slate-800"></div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                 <ClipboardEdit className="text-blue-600" /> ระบุหมายเหตุ/เหตุผลการบันทึก
              </h3>
              <p className="text-slate-500 font-medium mb-6">ข้อความนี้จะถูกบันทึกลงใน Audit Log เพื่อความโปร่งใสและใช้ในการตรวจสอบภายหลัง</p>
              
              <textarea 
                className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[24px] focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800 min-h-[160px] resize-none"
                placeholder="ระบุเหตุผล เช่น: แก้ไขคะแนนผิดพลาดจากการอ่านบัตร, ข้อมูลเพิ่มเติมจากการตรวจสอบ..."
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4 mt-8">
                  <button 
                    onClick={() => { setShowRemarkModal(false); setRemarkInput(''); }}
                    className="py-5 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all text-lg"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    disabled={!remarkInput.trim()}
                    onClick={() => confirmSubmission(true)}
                    className={`py-5 font-black rounded-2xl transition-all shadow-xl text-lg border-b-4 ${remarkInput.trim() ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    บันทึกพร้อมประวัติ
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-xl p-4 animate-in zoom-in duration-300">
           <div className="bg-white rounded-[56px] p-14 flex flex-col items-center text-center shadow-2xl max-w-sm w-full border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-4 bg-emerald-500"></div>
              <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-10 shadow-inner ring-12 ring-emerald-50/50">
                 <Check size={80} />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">บันทึกสำเร็จ</h3>
              <p className="text-xl text-slate-500 mb-10 font-bold leading-relaxed">ข้อมูลถูกส่งเข้าสู่ระบบฐานข้อมูลกลางและประมวลผลทันที</p>
              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-black text-emerald-600 uppercase tracking-widest">
                Data Synchronized • 200 OK
              </div>
           </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-white border-2 border-red-100 rounded-[40px] p-10 flex flex-col space-y-8 shadow-xl shadow-red-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-red-50 pb-8">
              <div className="flex items-center gap-6">
                  <div className="bg-red-50 p-5 rounded-[24px] text-red-600 shadow-inner border border-red-100">
                      <Trash2 size={32} />
                  </div>
                  <div className="text-center md:text-left">
                      <h4 className="text-2xl font-black text-red-900 uppercase tracking-tight">พื้นที่อันตราย (System Reset)</h4>
                      <p className="text-lg text-red-600/70 mt-1 font-medium">ล้างข้อมูลคะแนนและประวัติเพื่อเริ่มการเลือกตั้งใหม่</p>
                  </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="px-8 py-5 bg-white text-red-600 border-2 border-red-200 font-black rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-lg"
                >
                  <Trash2 size={20} /> ล้างผลคะแนนทั้งหมด
                </button>
                <button 
                  onClick={() => setShowFactoryResetConfirm(true)}
                  className="px-8 py-5 bg-red-900 text-white border-b-4 border-red-950 font-black rounded-2xl hover:bg-red-950 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 text-lg"
                >
                  <DatabaseZap size={20} /> ล้างแคชข้อมูลถาวร
                </button>
              </div>
          </div>
          <p className="text-red-400 text-sm font-bold text-center leading-relaxed">
            * การล้างข้อมูลถาวรจะทำการลบข้อมูลออกจากเบราว์เซอร์นี้ทั้งหมด รวมไปถึงการตั้งค่าและประวัติ Audit Log <br/>
            กรุณาตรวจสอบให้มั่นใจก่อนดำเนินการ
          </p>
      </div>

      {/* Temporary Reset Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-xl p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[48px] p-12 max-w-md w-full shadow-2xl border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-4 bg-red-500"></div>
              <div className="w-28 h-28 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 ring-12 ring-red-50/50 shadow-inner">
                  <AlertTriangle size={56} />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">ล้างผลคะแนน?</h3>
              <p className="text-slate-500 mb-10 font-bold text-xl leading-relaxed">
                  คุณกำลังจะลบข้อมูลคะแนนที่รายงานมาจาก <strong className="text-red-600">ทุกหน่วยเลือกตั้ง</strong> <br/>
                  <span className="text-red-500 font-black bg-red-50 px-3 py-1 rounded-lg mt-3 inline-block uppercase text-xs tracking-widest border border-red-100">Audit History will be created</span>
              </p>

              <div className="mb-10 bg-slate-50 p-8 rounded-[32px] border-2 border-slate-200 shadow-inner">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                      พิมพ์คำว่า <span className="text-red-600 select-all font-mono">RESET</span> เพื่อยืนยัน
                  </label>
                  <input 
                    type="text"
                    autoFocus
                    className="w-full p-5 border-2 border-slate-200 rounded-2xl text-center text-3xl font-black tracking-widest focus:border-red-500 focus:ring-8 focus:ring-red-100 transition-all uppercase outline-none"
                    placeholder="CONFIRM..."
                    value={resetConfirmationInput}
                    onChange={(e) => setResetConfirmationInput(e.target.value)}
                  />
              </div>

              <div className="grid grid-cols-2 gap-5">
                  <button onClick={() => setShowResetConfirm(false)} className="py-5 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all text-xl">ยกเลิก</button>
                  <button 
                    disabled={resetConfirmationInput.toUpperCase() !== 'RESET'}
                    onClick={() => { onReset(); setShowResetConfirm(false); }}
                    className={`py-5 font-black rounded-2xl transition-all shadow-xl text-xl ${resetConfirmationInput.toUpperCase() === 'RESET' ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 border-b-4 border-red-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                  >ยืนยันลบ</button>
              </div>
           </div>
        </div>
      )}

      {/* Factory Reset Modal */}
      {showFactoryResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-950/90 backdrop-blur-2xl p-4 animate-in fade-in duration-200">
           <div className="bg-red-900 rounded-[56px] p-12 max-w-md w-full shadow-[0_0_100px_rgba(220,38,38,0.3)] border-2 border-red-500/50 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-4 bg-white/20"></div>
              <div className="w-32 h-32 bg-white/10 text-white rounded-full flex items-center justify-center mx-auto mb-8 ring-12 ring-white/5 shadow-inner">
                  <DatabaseZap size={64} />
              </div>
              <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">ล้างข้อมูลถาวร?</h3>
              <p className="text-red-100 mb-10 font-bold text-xl leading-relaxed">
                  นี่คือการคืนค่าโรงงาน ข้อมูล <strong className="text-white">localStorage</strong> ทั้งหมดรวมถึงประวัติและ Audit Log จะหายไป <br/>
                  <span className="text-white font-black bg-red-800 px-4 py-2 rounded-xl mt-4 inline-block uppercase tracking-[0.2em] text-xs border border-red-700 shadow-lg">Extreme Action Required</span>
              </p>

              <div className="mb-10 bg-red-950/50 p-8 rounded-[32px] border-2 border-red-700 shadow-inner">
                  <label className="block text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-4 text-center">
                      พิมพ์คำว่า <span className="text-white select-all font-mono">DELETE ALL</span>
                  </label>
                  <input 
                    type="text"
                    autoFocus
                    className="w-full p-5 border-2 border-red-600 bg-red-900/50 text-white rounded-2xl text-center text-3xl font-black tracking-widest focus:border-white outline-none transition-all uppercase placeholder:text-red-800"
                    placeholder="••••••••••"
                    value={resetConfirmationInput}
                    onChange={(e) => setResetConfirmationInput(e.target.value)}
                  />
              </div>

              <div className="grid grid-cols-2 gap-5">
                  <button onClick={() => setShowFactoryResetConfirm(false)} className="py-5 bg-red-800 text-red-200 font-black rounded-2xl hover:bg-red-700 transition-all text-xl border-b-4 border-red-950">ยกเลิก</button>
                  <button 
                    disabled={resetConfirmationInput.toUpperCase() !== 'DELETE ALL'}
                    onClick={handleFactoryReset}
                    className={`py-5 font-black rounded-2xl transition-all shadow-2xl text-xl ${resetConfirmationInput.toUpperCase() === 'DELETE ALL' ? 'bg-white text-red-900 hover:bg-red-50 border-b-4 border-slate-300' : 'bg-red-950/50 text-red-900/50 cursor-not-allowed shadow-none'}`}
                  >ล้างถาวร</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
