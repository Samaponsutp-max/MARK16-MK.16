
import React, { useState, useRef, useEffect } from 'react';
/* Fix: Replacing non-existent AspectRatio icon with RectangleHorizontal from lucide-react */
import { Search, MapPin, Send, Loader2, Globe, ExternalLink, Sparkles, MessageSquare, Info, X, Zap, Image as ImageIcon, Camera, Upload, Trash2, Wand2, PlusSquare, RectangleHorizontal, Key, AlertTriangle } from 'lucide-react';
import { askSearchGrounding, askMapsGrounding, askFastResponse, editImage, generateImage } from '../aiService';

// The environment provides aistudio on the window object. 
// We use a helper with type casting to avoid global declaration conflicts.
const getAIStudio = () => (window as any).aistudio;

const ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"];

export const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'fast' | 'search' | 'maps' | 'image-edit' | 'image-gen'>('fast');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, grounding?: any[], imageUrl?: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("ไม่สามารถเข้าถึงกล้องได้");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraActive(false);
  };

  const handleOpenKeySelector = async () => {
    await getAIStudio().openSelectKey();
    setShowKeyPrompt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    // Check key for Pro model
    if (mode === 'image-gen') {
      const hasKey = await getAIStudio().hasSelectedApiKey();
      if (!hasKey) {
        setShowKeyPrompt(true);
        return;
      }
    }

    if (mode === 'image-edit' && !selectedImage) {
      alert('กรุณาเลือกรูปภาพเพื่อแก้ไข');
      return;
    }

    const userMessage = input;
    const currentSelectedImage = selectedImage;
    const currentAspectRatio = aspectRatio;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, imageUrl: (mode === 'image-edit' && currentSelectedImage) ? currentSelectedImage : undefined }]);
    setLoading(true);

    try {
      let res;
      if (mode === 'image-gen') {
        res = await generateImage(userMessage, currentAspectRatio);
      } else if (mode === 'image-edit' && currentSelectedImage) {
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
        text: res.text || (mode === 'image-edit' || mode === 'image-gen' ? 'สร้างผลลัพธ์สำเร็จ' : 'ไม่สามารถประมวลผลคำตอบได้ในขณะนี้'), 
        grounding: (res as any).grounding,
        imageUrl: (res as any).imageUrl
      }]);
      
      if (mode === 'image-edit' && (res as any).imageUrl) {
          setSelectedImage((res as any).imageUrl);
      }

    } catch (error: any) {
      let errorText = 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ AI';
      if (error?.message?.includes("Requested entity was not found")) {
        setShowKeyPrompt(true);
        errorText = 'กรุณาเลือก API Key ที่ถูกต้องเพื่อใช้งานโมเดลคุณภาพสูง';
      }
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: errorText
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[800px] flex flex-col bg-white rounded-[3rem] shadow-3xl shadow-slate-900/10 border border-slate-100 overflow-hidden relative">
      {/* API Key Prompt Modal */}
      {showKeyPrompt && (
        <div className="absolute inset-0 z-[60] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-8">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Key size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">ต้องระบุ API Key ของคุณ</h3>
                <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                    การใช้งาน Gemini 3 Pro (Image Generation) จำเป็นต้องใช้ API Key ของผู้ใช้เองที่เปิดใช้งาน Billing แล้ว
                </p>
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={handleOpenKeySelector}
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
                    >
                        เลือก API Key ของฉัน
                    </button>
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600"
                    >
                        ข้อมูลการตั้งค่า Billing
                    </a>
                    <button 
                        onClick={() => setShowKeyPrompt(false)}
                        className="text-slate-400 text-sm font-bold mt-2"
                    >
                        ปิดหน้าต่างนี้
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1e293b] p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6 border-b-[6px] border-amber-400">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-blue-900/40">
            <Sparkles size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Election AI Assistant</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-400/10 px-2 py-0.5 rounded">V4 Stable</span>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Multi-Model Powered</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/50 backdrop-blur-md">
          <button 
            onClick={() => { setMode('fast'); setShowKeyPrompt(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'fast' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Zap size={16} /> Fast
          </button>
          <button 
            onClick={() => { setMode('search'); setShowKeyPrompt(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'search' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Globe size={16} /> Search
          </button>
          <button 
            onClick={() => { setMode('maps'); setShowKeyPrompt(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'maps' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <MapPin size={16} /> Maps
          </button>
          <button 
            onClick={() => { setMode('image-gen'); setShowKeyPrompt(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'image-gen' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <PlusSquare size={16} /> Gen Image
          </button>
          <button 
            onClick={() => { setMode('image-edit'); setIsCameraActive(false); setShowKeyPrompt(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'image-edit' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <ImageIcon size={16} /> Edit Image
          </button>
        </div>
      </div>

      {/* Camera UI Overlay */}
      {isCameraActive && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-3xl shadow-2xl border-2 border-white/20" />
            <div className="mt-8 flex gap-6">
                <button onClick={stopCamera} className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20"><X size={32} /></button>
                <button onClick={capturePhoto} className="w-20 h-20 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl transform active:scale-90 transition-transform"><Camera size={40} /></button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 scroll-smooth no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-12">
            <div className="w-24 h-24 bg-blue-100/50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 ring-[12px] ring-blue-50 transition-transform hover:scale-110 duration-500">
              <MessageSquare size={48} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Election AI Assistant</h3>
            <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-md">
               ถามข้อมูลเลือกตั้ง, ค้นหาสถานที่หน่วยเลือกตั้ง หรือสร้างและแก้ไขภาพด้วยพลัง Multi-Model AI
            </p>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[90%] rounded-[2.25rem] p-7 shadow-sm relative group ${
              m.role === 'user' 
                ? 'bg-[#2563eb] text-white rounded-br-none' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              {m.imageUrl && (
                <div className="mb-4 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
                  <img src={m.imageUrl} alt="AI Result" className="max-w-full h-auto max-h-[450px] object-contain mx-auto" />
                </div>
              )}
              <div className="text-lg leading-relaxed whitespace-pre-wrap font-bold">
                {m.text}
              </div>
              
              {m.grounding && m.grounding.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100/20 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={12} className="text-blue-500" /> Grounding References
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {m.grounding.map((chunk: any, cIdx: number) => {
                      const link = chunk.web?.uri || chunk.maps?.uri;
                      const title = chunk.web?.title || chunk.maps?.title || 'Source';
                      if (!link) return null;
                      return (
                        <a 
                          key={cIdx} 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold transition-all"
                        >
                          <ExternalLink size={14} />
                          <span className="truncate max-w-[150px]">{title}</span>
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
              <Loader2 className="text-blue-600 animate-spin" size={24} />
              <span className="text-base font-black text-slate-400 uppercase tracking-widest">
                AI กำลังประมวลผล...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Image Gen Aspect Ratio Selector */}
      {mode === 'image-gen' && (
        <div className="px-8 py-5 bg-indigo-50 border-t border-indigo-100 space-y-3">
          <div className="flex items-center gap-2 mb-1">
             <RectangleHorizontal size={16} className="text-indigo-600" />
             <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Aspect Ratio (สัดส่วนภาพ)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map(ratio => (
              <button 
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === ratio ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-indigo-400 border-indigo-100 hover:border-indigo-300'}`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Context Bar */}
      {mode === 'image-edit' && (
        <div className="px-8 py-4 bg-purple-50 border-t border-purple-100 flex items-center gap-4 transition-all animate-in slide-in-from-bottom-2">
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
          {selectedImage ? (
            <div className="relative group shrink-0">
              <img src={selectedImage} alt="Preview" className="w-20 h-20 rounded-2xl object-cover shadow-xl border-4 border-white" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-2xl hover:bg-red-600 transform transition-all active:scale-90"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-purple-200 text-purple-400 flex items-center justify-center hover:bg-white hover:border-purple-400 transition-all shadow-sm"
                >
                  <Upload size={24} />
                </button>
                <button 
                  onClick={startCamera}
                  className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                >
                  <Camera size={24} />
                </button>
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-black text-purple-900">โหมดแต่งภาพ อัจฉริยะ (Nano Banana)</p>
            <p className="text-xs text-purple-500 font-bold">
              {selectedImage ? 'เลือกรูปแล้ว ส่งคำสั่งแก้ไขได้เลย' : 'เลือกหรือถ่ายภาพหน่วยเลือกตั้งเพื่อแก้ไข'}
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
                mode === 'fast' ? "ถามเรื่องการเลือกตั้ง..." :
                mode === 'image-gen' ? "ระบุภาพที่คุณต้องการสร้าง (Prompt)..." :
                mode === 'image-edit' ? "สั่งแก้ไขภาพ เช่น 'แต่งภาพให้สว่างขึ้น'..." :
                mode === 'search' ? "ค้นหาข้อมูลจาก Google..." : 
                "ค้นหาหน่วยเลือกตั้ง..."
              }
              className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-slate-800 text-lg placeholder:text-slate-300 shadow-inner group-hover:border-slate-200"
            />
            <div className={`absolute right-6 top-1/2 -translate-y-1/2 transition-all opacity-30 group-focus-within:opacity-100 ${mode === 'image-edit' ? 'text-purple-600' : mode === 'image-gen' ? 'text-indigo-600' : 'text-blue-600'}`}>
               {mode === 'image-gen' ? <PlusSquare size={24} /> : mode === 'image-edit' ? <Wand2 size={24} /> : <Zap size={24} />}
            </div>
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || loading || (mode === 'image-edit' && !selectedImage)}
            className={`p-6 rounded-3xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center min-w-[80px] ${
              !input.trim() || loading || (mode === 'image-edit' && !selectedImage)
                ? 'bg-slate-100 text-slate-300' 
                : mode === 'image-gen' ? 'bg-indigo-600 text-white' : mode === 'image-edit' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {loading ? <Loader2 size={32} className="animate-spin" /> : <Send size={32} />}
          </button>
        </form>
      </div>
    </div>
  );
};
