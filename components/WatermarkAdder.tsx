'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, RefreshCcw, ImagePlus, Settings, CheckCircle2 } from 'lucide-react';

// ----------------------------------------------------
// 1. ตั้งค่ารายการโลโก้ที่นี่
// ----------------------------------------------------
const PREDEFINED_LOGOS = [
  { id: 1, path: '/arisza.png', name: 'Arisza (Blur BG)' }, // ตัวอย่าง: ต้องมีคำว่า arisza ในชื่อไฟล์
  { id: 2, path: '/onesiam.png', name: 'OneSiam' },
  { id: 3, path: '/mainecoon.webp', name: 'Maine Coon' },
];

export default function WatermarkAdder() {
  const [mainImageSrc, setMainImageSrc] = useState<string | null>(null);
  const [selectedLogoPath, setSelectedLogoPath] = useState<string | null>(null);
  
  // Settings
  const [logoSizePercent, setLogoSizePercent] = useState(20);
  const [opacity, setOpacity] = useState(0.8);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Upload Main Image Only
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMainImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; 
    }
  };

  // Draw Function
  useEffect(() => {
    if (!mainImageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mainImg = new Image();
    mainImg.onload = () => {
      // 1. Setup Canvas
      canvas.width = mainImg.width;
      canvas.height = mainImg.height;

      // 2. Clear & Draw Main Image (Normal)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mainImg, 0, 0);

      // 3. Draw Selected Logo (if any)
      if (selectedLogoPath) {
        const logoImg = new Image();
        logoImg.onload = () => {
          // คำนวณขนาดและตำแหน่ง
          const targetWidth = (canvas.width * logoSizePercent) / 100;
          const aspectRatio = logoImg.height / logoImg.width;
          const targetHeight = targetWidth * aspectRatio;

          const padding = canvas.width * 0.02; // 2% padding
          const x = canvas.width - targetWidth - padding;
          const y = canvas.height - targetHeight - padding;

          // -------------------------------------------------------
          // 4. Special Effect: Blur Background for 'arisza' only
          // -------------------------------------------------------
          if (selectedLogoPath.toLowerCase().includes('arisza')) {
             ctx.save(); // เซฟสถานะ Canvas ปัจจุบันไว้
             
             // สร้างกรอบสี่เหลี่ยมตามขนาดโลโก้
             ctx.beginPath();
             ctx.rect(x, y, targetWidth, targetHeight);
             ctx.clip(); // สั่งให้วาดเฉพาะในกรอบนี้เท่านั้น

             // สั่งเบลอ
             ctx.filter = 'blur(15px)'; // ปรับความเบลอได้ตรงนี้ (px)
             
             // วาดรูปหลักทับลงไปอีกที (มันจะติดเบลอเฉพาะในกรอบที่ clip ไว้)
             ctx.drawImage(mainImg, 0, 0); 
             
             ctx.restore(); // คืนค่า Canvas กลับสู่ปกติ (เลิก Clip, เลิก Filter)
          }
          // -------------------------------------------------------

          // 5. วาดโลโก้ทับลงไป
          ctx.globalAlpha = opacity;
          ctx.drawImage(logoImg, x, y, targetWidth, targetHeight);
          ctx.globalAlpha = 1.0;
        };
        // Load image from public folder path
        logoImg.src = selectedLogoPath; 
      }
    };
    mainImg.src = mainImageSrc;

  }, [mainImageSrc, selectedLogoPath, logoSizePercent, opacity]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = 'watermarked-image.png';
    link.href = canvasRef.current?.toDataURL("image/png") || "";
    link.click();
  };

  const resetAll = () => {
      setMainImageSrc(null);
      setSelectedLogoPath(null);
      setLogoSizePercent(20);
      setOpacity(0.8);
  }

  return (
    <div className="flex flex-col items-center p-6 max-w-6xl mx-auto space-y-6">
      
      {/* 1. Main Image Upload */}
      {!mainImageSrc && (
        <div className="w-full h-80 border-4 border-dashed border-indigo-300 rounded-2xl flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer relative shadow-sm group">
          <input type="file" accept="image/*" onChange={handleMainImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
          <div className="p-4 bg-white rounded-full mb-4 group-hover:scale-110 transition-transform shadow"><ImagePlus className="w-12 h-12 text-indigo-600" /></div>
          <p className="text-2xl font-bold text-indigo-700">1. อัปโหลดรูปภาพหลัก</p>
          <p className="text-indigo-500 mt-2">รูปที่ต้องการติดลายน้ำ</p>
        </div>
      )}

      {/* 2. Workspace */}
      {mainImageSrc && (
        <div className="w-full flex flex-col lg:flex-row gap-8">
            
            {/* Left Sidebar: Controls */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6 order-2 lg:order-1">
                
                {/* --- Logo Selection Grid --- */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                        <ImagePlus className="w-5 h-5 mr-2 text-indigo-600"/> เลือกรูปลายน้ำ
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                        {PREDEFINED_LOGOS.map((logo) => (
                            <button
                                key={logo.id}
                                onClick={() => setSelectedLogoPath(logo.path)}
                                className={`
                                    relative aspect-square rounded-xl border-2 overflow-hidden transition-all p-2 flex items-center justify-center bg-gray-50
                                    ${selectedLogoPath === logo.path 
                                        ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50' 
                                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'}
                                `}
                            >
                                <img src={logo.path} alt={logo.name} className="w-full h-full object-contain" />
                                {selectedLogoPath === logo.path && (
                                    <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5">
                                        <CheckCircle2 className="w-3 h-3"/>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    {PREDEFINED_LOGOS.length === 0 && (
                        <p className="text-red-500 text-sm text-center py-4 bg-red-50 rounded-lg">
                            ⚠️ ไม่พบรูปใน public/logos <br/> กรุณาสร้างโฟลเดอร์และใส่รูปภาพ
                        </p>
                    )}
                </div>

                {/* --- Adjustments --- */}
                {selectedLogoPath && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 animate-in slide-in-from-left-2">
                     <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                        <Settings className="w-5 h-5 mr-2 text-indigo-600"/> ปรับแต่ง
                     </h3>
                     
                     {/* Size */}
                     <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <label className="font-medium text-gray-600">ขนาด</label>
                            <span className="text-indigo-600 font-bold bg-indigo-50 px-2 rounded">{logoSizePercent}%</span>
                        </div>
                        <input type="range" min="5" max="80" value={logoSizePercent} onChange={(e) => setLogoSizePercent(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                     </div>

                     {/* Opacity */}
                     <div>
                        <div className="flex justify-between text-sm mb-2">
                            <label className="font-medium text-gray-600">ความโปร่งใส</label>
                            <span className="text-indigo-600 font-bold bg-indigo-50 px-2 rounded">{Math.round(opacity * 100)}%</span>
                        </div>
                        <input type="range" min="0.1" max="1.0" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                     </div>
                </div>
                )}

                 {/* Actions */}
                 <div className="flex gap-3 mt-auto">
                    <button onClick={resetAll} className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition flex items-center justify-center">
                        <RefreshCcw className="w-4 h-4 mr-2"/> เริ่มใหม่
                    </button>
                    <button onClick={downloadImage} className="flex-[2] py-3 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition flex items-center justify-center active:scale-95">
                        <Download className="w-5 h-5 mr-2"/> ดาวน์โหลด
                    </button>
                 </div>

            </div>

            {/* Right Side: Preview */}
            <div className="w-full lg:w-2/3 order-1 lg:order-2">
                <div className="bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative min-h-[500px] p-4">
                     <canvas ref={canvasRef} className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg" />
                     
                     {!selectedLogoPath && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/5 backdrop-blur-[1px] rounded-2xl">
                             <div className="bg-white/90 px-6 py-3 rounded-full shadow-lg text-gray-600 font-medium animate-pulse">
                                👈 กรุณาเลือกโลโก้จากฝั่งซ้าย
                             </div>
                        </div>
                     )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}