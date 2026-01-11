import React, { useMemo } from 'react';
import { Village, VillageStatus, VoteRecord } from '../types';
import { Map, ExternalLink, Navigation } from 'lucide-react';

interface LiveMapProps {
  votes: VoteRecord[];
  villages: Village[];
  statuses: VillageStatus[];
  initialVillageId: number | null;
}

export const LiveMap: React.FC<LiveMapProps> = ({ votes, villages, statuses, initialVillageId }) => {
  // Normally this would integrate with Google Maps API or Leaflet
  // For this demo, we will render a stylized card list that links to maps
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800">
            <Map className="text-[#1e3a8a]" />
            แผนที่หน่วยเลือกตั้งและเส้นทาง
        </h2>
        <p className="text-slate-500 mb-6">
            แสดงตำแหน่งที่ตั้งของหน่วยเลือกตั้งทั้ง {villages.length} หน่วย ท่านสามารถกดเพื่อดูเส้นทางผ่าน Google Maps
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {villages.map((v) => {
                const status = statuses.find(s => s.villageId === v.id);
                const isSelected = initialVillageId === v.id;
                
                return (
                    <div 
                        key={v.id}
                        className={`
                            relative p-4 rounded-lg border transition-all duration-200 group hover:shadow-md hover:scale-[1.02]
                            ${isSelected ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                                หมู่ที่ {v.moo}
                            </span>
                            <span className={`w-2.5 h-2.5 rounded-full ${status?.isReported ? 'bg-green-500' : 'bg-slate-300'}`} title={status?.isReported ? "รายงานผลแล้ว" : "ยังไม่รายงาน"}></span>
                        </div>
                        
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{v.name}</h3>
                        <p className="text-sm text-slate-500 flex items-start gap-1 mb-4 h-10 overflow-hidden">
                            <Map size={14} className="mt-0.5 shrink-0" />
                            {v.location}
                        </p>

                        <a 
                            href={v.mapUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-700 font-bold text-sm rounded-md hover:bg-blue-100 transition-colors"
                        >
                            <Navigation size={16} />
                            นำทาง
                        </a>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};