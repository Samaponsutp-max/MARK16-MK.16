
import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Send, Loader2, Globe, ExternalLink, Sparkles, MessageSquare, Info, X, Zap, Image as ImageIcon, Camera, Upload } from 'lucide-react';
import { askSearchGrounding, askMapsGrounding, askFastResponse, editImage } from '../aiService';

export const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'fast' | 'search' | 'maps' | 'image-edit'>('fast');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, grounding?: any[], imageUrl?: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    if (mode === 'image-edit' && !selectedImage) {
      alert('กรุณาเลือกรูปภาพเพื่อแก้ไข');
      return;
    }

    const userMessage = input;
    const currentSelectedImage = selectedImage;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, imageUrl: currentSelectedImage || undefined }]);
    setLoading(true);

    try {
      let res;
      if (mode === 'image-edit' && currentSelectedImage) {
        const base64Data = currentSelectedImage.split(',')[1];
        const mimeType = currentSelectedImage.split(';')[0].split(':')[1];
        res = await editImage(userMessage, base64Data, mimeType);
      } else if (mode === 'fast') {
        res = await askFastResponse(userMessage);
      } else if (mode === 'search') {
        res = await askSearchGrounding(userMessage);
      } else {
        let lat, lng;
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => 
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (e) {
          console.warn("Location access denied or timed out");
        }
        res = await askMapsGrounding(userMessage, lat, lng);
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: res.text || (mode === 'image-edit' ? 'แก้ไขรูปภาพสำเร็จ' : 'ไม่สามารถประมวลผลคำตอบได้ในขณะนี้'), 
        grounding: (res as any).grounding,
        imageUrl: (res as any).imageUrl
      }]);
      
      // Keep image selected for further editing if in edit mode
      if (mode === 'image-edit' && (res as any).imageUrl) {
          setSelectedImage((res as any).imageUrl);
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ AI' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[800px] flex flex-col bg-white rounded-[3rem] shadow-3xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-[#1e293b] p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6 border-b-[6px] border-amber-400">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-blue-900/40">
            <Sparkles size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Election AI Assistant</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-400/10 px-2 py-0.5 rounded">Active</span>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Grounding with Google Search & Maps</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/50 backdrop-blur-md">
          <button 
            onClick={() => setMode('fast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'fast' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Zap size={16} /> Fast
          </button>
          <button 
            onClick={() => setMode('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'search' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Globe size={16} /> Search
          </button>
          <button 
            onClick={() => setMode('maps')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'maps' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <MapPin size={16} /> Maps
          </button>
          <button 
            onClick={() => setMode('image-edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'image-edit' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <ImageIcon size={16} /> Edit
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 scroll-smooth no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-12">
            <div className="w-24 h-24 bg-blue-100/50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 ring-[12px] ring-blue-50 transition-transform hover:scale-110 duration-500">
              <MessageSquare size={48} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">ระบบช่วยเหลืออัจฉริยะ</h3>
            <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-md">
               ถามเรื่องข้อมูลการเลือกตั้ง ค้นหาประวัติผู้สมัคร หรือแก้ไขรูปภาพหน่วยเลือกตั้งได้รวดเร็วทันใจ
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 w-full max-w-2xl">
              <div className="p-1 bg-slate-200/50 rounded-3xl">
                <button onClick={() => setInput("ผู้สมัครนายกเบอร์ 1 คือใคร?")} className="w-full p-6 bg-white border border-slate-100 rounded-[1.25rem] text-sm font-black text-slate-700 hover:text-blue-600 hover:shadow-xl transition-all text-left flex items-start gap-4 group">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Search size={16}/></div>
                  <span>"ผู้สมัครนายกเบอร์ 1 คือใคร?"</span>
                </button>
              </div>
              <div className="p-1 bg-slate-200/50 rounded-3xl">
                <button onClick={() => { setMode('image-edit'); setInput("ช่วยใส่ฟิลเตอร์ย้อนยุคให้รูปนี้หน่อย"); }} className="w-full p-6 bg-white border border-slate-100 rounded-[1.25rem] text-sm font-black text-slate-700 hover:text-purple-600 hover:shadow-xl transition-all text-left flex items-start gap-4 group">
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors"><ImageIcon size={16}/></div>
                  <span>"ช่วยใส่ฟิลเตอร์ย้อนยุคให้รูปหน่อย"</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[90%] rounded-[2.25rem] p-7 shadow-sm relative group ${
              m.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              {m.imageUrl && (
                <div className="mb-4 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
                  <img src={m.imageUrl} alt="Uploaded" className="max-w-full h-auto max-h-[300px] object-contain" />
                </div>
              )}
              <div className="text-lg leading-relaxed whitespace-pre-wrap font-bold">
                {m.text}
              </div>
              
              {m.grounding && m.grounding.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100/20 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={12} className="text-blue-500" /> References Found
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {m.grounding.map((chunk: any, cIdx: number) => {
                      const link = chunk.web?.uri || chunk.maps?.uri;
                      const title = chunk.web?.title || chunk.maps?.title || 'External Source';
                      if (!link) return null;
                      return (
                        <a 
                          key={cIdx} 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                            m.role === 'user' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100'
                          }`}
                        >
                          <ExternalLink size={14} />
                          <span className="truncate max-w-[180px]">{title}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white border border-slate-100 rounded-[2.25rem] rounded-bl-none p-7 flex items-center gap-4 shadow-sm">
              <div className="relative">
                 <Loader2 className="text-blue-600 animate-spin" size={24} />
                 <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 opacity-30" size={12} />
              </div>
              <span className="text-base font-black text-slate-400 uppercase tracking-widest">
                {mode === 'fast' ? 'Fast Processing...' : mode === 'image-edit' ? 'Editing Image...' : 'Thinking...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview & Selection UI */}
      {mode === 'image-edit' && (
        <div className="px-8 py-4 bg-purple-50 border-t border-purple-100 flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          {selectedImage ? (
            <div className="relative group shrink-0">
              <img src={selectedImage} alt="Preview" className="w-16 h-16 rounded-xl object-cover shadow-md border-2 border-white" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-xl bg-white border-2 border-dashed border-purple-200 text-purple-400 flex items-center justify-center hover:bg-purple-100 hover:border-purple-300 transition-all shadow-sm"
            >
              <Upload size={24} />
            </button>
          )}
          <div className="flex-1">
            <p className="text-sm font-black text-purple-900">โหมดแก้ไขรูปภาพ</p>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
              {selectedImage ? 'เลือกรูปแล้ว พร้อมรับคำสั่งแก้ไข' : 'กรุณาอัปโหลดรูปภาพที่ต้องการแก้ไข'}
            </p>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="p-8 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1 relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'fast' ? "คุยรวดเร็วทันใจ ตอบไวทันที..." :
                mode === 'image-edit' ? "สั่งแก้ไขรูปภาพ เช่น 'ใส่ฟิลเตอร์ขาวดำ'..." :
                mode === 'search' ? "ถามเรื่องข่าวสาร ข้อมูลผู้สมัคร..." : 
                "ค้นหาหน่วยเลือกตั้ง หรือ สถานที่ใกล้เคียง..."
              }
              className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-slate-800 text-lg placeholder:text-slate-300 shadow-inner group-hover:border-slate-200"
            />
            <div className={`absolute right-6 top-1/2 -translate-y-1/2 transition-all ${mode === 'fast' ? 'text-amber-500' : mode === 'image-edit' ? 'text-purple-500' : mode === 'search' ? 'text-blue-500' : 'text-emerald-500'} opacity-30 group-focus-within:opacity-100`}>
               {mode === 'fast' ? <Zap size={24} /> : mode === 'image-edit' ? <ImageIcon size={24} /> : mode === 'search' ? <Globe size={24} /> : <MapPin size={24} />}
            </div>
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || loading || (mode === 'image-edit' && !selectedImage)}
            className={`p-6 rounded-3xl shadow-2xl transition-all transform active:scale-90 flex items-center justify-center min-w-[80px] ${
              !input.trim() || loading || (mode === 'image-edit' && !selectedImage)
                ? 'bg-slate-100 text-slate-300' 
                : mode === 'fast' ? 'bg-amber-500 text-slate-900 shadow-amber-200' : mode === 'image-edit' ? 'bg-purple-600 text-white shadow-purple-200' : 'bg-blue-600 text-white shadow-blue-200'
            }`}
          >
            {loading ? <Loader2 size={32} className="animate-spin" /> : <Send size={32} />}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center gap-6">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
            Powered by Gemini {mode === 'fast' ? '2.5 Flash Lite' : mode === 'image-edit' ? '2.5 Flash Image' : '3 Flash & Grounding'}
          </p>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${mode === 'fast' ? 'bg-amber-400' : mode === 'image-edit' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              {mode === 'fast' ? 'Latency Optimized' : mode === 'image-edit' ? 'Image Intelligence' : 'Search Enhanced'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
