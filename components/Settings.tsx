
import React from 'react';
import { NotificationSettings } from '../types';
import { Bell, Mail, Shield, Save, BellOff, MailCheck, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  settings: NotificationSettings;
  onUpdate: (s: NotificationSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const handleChange = (key: keyof NotificationSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#1e293b] p-8 text-white flex items-center gap-6 border-b-8 border-blue-500">
           <div className="bg-blue-500 p-4 rounded-2xl text-white shadow-lg">
              <Bell size={32} />
           </div>
           <div>
              <h2 className="text-2xl font-black">การตั้งค่าการแจ้งเตือน</h2>
              <p className="text-slate-400 font-medium">จัดการช่องทางการรับข่าวสารและระบบแจ้งเตือนอัตโนมัติ</p>
           </div>
        </div>

        <div className="p-8 space-y-10">
          <section className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
               <Shield className="text-blue-600" size={20} />
               ระบบแจ้งเตือนภายในแอป (In-App)
            </h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
               <div>
                  <p className="font-bold text-slate-800">เปิดใช้งานการแจ้งเตือนแบบป๊อปอัป</p>
                  <p className="text-sm text-slate-500">แสดงผลมุมขวาล่างเมื่อมีเหตุการณ์สำคัญ</p>
               </div>
               <button 
                onClick={() => handleChange('enableInApp', !settings.enableInApp)}
                className={`w-14 h-8 rounded-full transition-all relative ${settings.enableInApp ? 'bg-blue-600' : 'bg-slate-300'}`}
               >
                 <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.enableInApp ? 'left-7' : 'left-1'}`}></div>
               </button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
               <Mail className="text-blue-600" size={20} />
               การแจ้งเตือนผ่านอีเมล
            </h3>
            <div className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
                   <div>
                      <p className="font-bold text-slate-800">รับสรุปผลคะแนนทางอีเมล</p>
                      <p className="text-sm text-slate-500">ส่งอีเมลแจ้งเตือนทุกครั้งที่มีการบันทึกคะแนนใหม่</p>
                   </div>
                   <button 
                    onClick={() => handleChange('enableEmail', !settings.enableEmail)}
                    className={`w-14 h-8 rounded-full transition-all relative ${settings.enableEmail ? 'bg-blue-600' : 'bg-slate-300'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.enableEmail ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>
                
                {settings.enableEmail && (
                    <div className="animate-fade-in pl-4 border-l-4 border-blue-100">
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">อีเมลสำหรับรับแจ้งเตือน</label>
                        <div className="relative max-w-md">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="email" 
                                className="w-full pl-12 pr-6 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-medium"
                                placeholder="example@domain.com"
                                value={settings.emailAddress}
                                onChange={(e) => handleChange('emailAddress', e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>
          </section>

          <section className="space-y-6 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
               <AlertTriangle className="text-amber-500" size={20} />
               เงื่อนไขการแจ้งเตือนพิเศษ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={() => handleChange('alertCloseRace', !settings.alertCloseRace)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${settings.alertCloseRace ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}
                >
                    <p className={`font-bold mb-1 ${settings.alertCloseRace ? 'text-amber-800' : 'text-slate-400'}`}>คะแนนสูสี (Close Race)</p>
                    <p className="text-xs text-slate-500 leading-relaxed">แจ้งเตือนเมื่ออันดับ 1 และ 2 มีส่วนต่างคะแนนน้อยกว่า 5%</p>
                </button>
                <button 
                    onClick={() => handleChange('alertOverLimit', !settings.alertOverLimit)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${settings.alertOverLimit ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}
                >
                    <p className={`font-bold mb-1 ${settings.alertOverLimit ? 'text-red-800' : 'text-slate-400'}`}>คะแนนเกินสิทธิ (Over Limit)</p>
                    <p className="text-xs text-slate-500 leading-relaxed">แจ้งเตือนเมื่อมีการบันทึกคะแนนเกินจำนวนผู้มีสิทธิในหน่วยนั้น</p>
                </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
