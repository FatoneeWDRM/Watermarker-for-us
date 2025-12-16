const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Setup (V6.1: Watermark Adder - Fixed Variable Name)...');

function writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content.trim(), 'utf8');
    console.log(`✅ Created: ${filePath}`);
}

// --------------------------------------------------------
// 1. components/WatermarkAdder.tsx (FIXED)
// --------------------------------------------------------
const watermarkAdderTsx = `
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, Download, RefreshCcw, ImagePlus, Settings } from 'lucide-react';

export default function WatermarkAdder() {
  const [mainImageSrc, setMainImageSrc] = useState<string | null>(null);
  const [logoImageSrc, setLogoImageSrc] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState(20); // 20% of main image width
  const [opacity, setOpacity] = useState(0.8); // 80% opacity

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (isLogo) {
          setLogoImageSrc(event.target?.result as string);
        } else {
          setMainImageSrc(event.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
    }
  };

  // Core Logic: Draw images onto canvas whenever inputs change
  useEffect(() => {
    if (!mainImageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mainImg = new Image();
    mainImg.onload = () => {
      // 1. Set canvas to main image size
      canvas.width = mainImg.width;
      canvas.height = mainImg.height;

      // 2. Draw main image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mainImg, 0, 0);

      // 3. If logo exists, draw it at bottom-right
      if (logoImageSrc) {
        const logoImg = new Image();
        logoImg.onload = () => {
          // Calculate size relative to main image width
          const targetWidth = (canvas.width * logoSizePercent) / 100;
          const aspectRatio = logoImg.height / logoImg.width;
          const targetHeight = targetWidth * aspectRatio;

          // Padding from edge (e.g., 2% of width)
          const padding = canvas.width * 0.02; 

          // Calculate Bottom-Right position
          const x = canvas.width - targetWidth - padding;
          const y = canvas.height - targetHeight - padding;

          // Set opacity
          ctx.globalAlpha = opacity;
          
          // Draw logo
          ctx.drawImage(logoImg, x, y, targetWidth, targetHeight);

          // Reset opacity for future drawings
          ctx.globalAlpha = 1.0;
        };
        logoImg.src = logoImageSrc;
      }
    };
    mainImg.src = mainImageSrc;

  }, [mainImageSrc, logoImageSrc, logoSizePercent, opacity]);


  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = 'watermarked-image.png';
    link.href = canvasRef.current?.toDataURL("image/png") || "";
    link.click();
  };

  const resetAll = () => {
      setMainImageSrc(null);
      setLogoImageSrc(null);
      setLogoSizePercent(20);
      setOpacity(0.8);
  }

  return (
    <div className="flex flex-col items-center p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Main Image Upload Area */}
      {!mainImageSrc && (
        <div className="w-full h-80 border-4 border-dashed border-blue-300 rounded-2xl flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 transition cursor-pointer relative shadow-sm group">
          <input type="file" accept="image/*" onChange={(e) => handleUpload(e, false)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
          <div className="p-4 bg-white rounded-full mb-4 group-hover:scale-110 transition-transform shadow"><ImagePlus className="w-12 h-12 text-blue-600" /></div>
          <p className="text-2xl font-bold text-blue-700">1. Upload Main Photo</p>
          <p className="text-blue-500 mt-2">The image you want to watermark</p>
        </div>
      )}

      {/* Editor Section - Visible ONLY when mainImageSrc is present */}
      {mainImageSrc && (
        <div className="w-full flex flex-col md:flex-row gap-6">
            
            {/* Sidebar Controls */}
            <div className="w-full md:w-1/3 flex flex-col gap-4 order-2 md:order-1">
                
                {/* Logo Upload & Preview */}
                <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center"><ImagePlus className="w-4 h-4 mr-2"/> 2. Logo / Watermark</h3>
                    {!logoImageSrc ? (
                        <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative">
                            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, true)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                            <Upload className="w-6 h-6 text-gray-400 mb-1"/>
                            <span className="text-sm text-gray-500 font-medium">Click to choose logo</span>
                            <span className="text-xs text-gray-400">(PNG with transparency is best)</span>
                        </label>
                    ) : (
                        <div className="relative h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 p-2">
                            {/* Use an img tag for previewing the raw logo source */}
                            <img src={logoImageSrc} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                            <button onClick={() => setLogoImageSrc(null)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"><RefreshCcw className="w-4 h-4 text-red-500"/></button>
                        </div>
                    )}
                </div>

                {/* Adjustments */}
                {logoImageSrc && (
                <div className="bg-white p-4 rounded-xl shadow border border-gray-200 animate-in fade-in slide-in-from-top-4">
                     <h3 className="font-bold text-gray-700 mb-3 flex items-center"><Settings className="w-4 h-4 mr-2"/> Adjustments</h3>
                     
                     {/* Size Slider */}
                     <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <label className="font-medium text-gray-600">Size (%)</label>
                            <span className="text-blue-600 font-bold">{logoSizePercent}%</span>
                        </div>
                        <input type="range" min="5" max="50" value={logoSizePercent} onChange={(e) => setLogoSizePercent(parseInt(e.target.value))} className="w-full accent-blue-600 cursor-pointer"/>
                     </div>

                     {/* Opacity Slider */}
                     <div>
                        <div className="flex justify-between text-sm mb-1">
                            <label className="font-medium text-gray-600">Opacity</label>
                            <span className="text-blue-600 font-bold">{Math.round(opacity * 100)}%</span>
                        </div>
                        <input type="range" min="0.1" max="1.0" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-blue-600 cursor-pointer"/>
                     </div>
                </div>
                )}

                 {/* Actions */}
                 <div className="flex gap-2">
                    <button onClick={resetAll} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition flex items-center justify-center">
                        <RefreshCcw className="w-4 h-4 mr-2"/> Reset All
                    </button>
                    <button onClick={downloadImage} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md transition flex items-center justify-center active:scale-95">
                        <Download className="w-5 h-5 mr-2"/> Download
                    </button>
                 </div>

            </div>

            {/* Preview Area (Canvas) */}
            <div className="w-full md:w-2/3 order-1 md:order-2 bg-gray-100 rounded-xl border-2 border-gray-200 shadow-inner flex items-center justify-center overflow-hidden relative min-h-[400px] p-2">
                 <canvas ref={canvasRef} className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-lg" />
                 {!logoImageSrc && <div className="absolute pointer-events-none text-gray-500 bg-white/80 px-4 py-2 rounded-full text-sm font-medium shadow-sm">Preview: Upload a logo to see it here</div>}
            </div>
        </div>
      )}
    </div>
  );
}
`;

// --------------------------------------------------------
// Other files (Standard)
// --------------------------------------------------------
const layoutTsx = `
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Watermark Adder Tool",
  description: "Add logo to your images easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
`;

const packageJson = `{
  "name": "watermark-adder-tool",
  "version": "1.0.0",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start", "lint": "next lint" },
  "dependencies": { "lucide-react": "^0.263.1", "next": "14.2.3", "react": "^18.3.1", "react-dom": "^18.3.1" },
  "devDependencies": { "@types/node": "^20", "@types/react": "^18", "@types/react-dom": "^18", "autoprefixer": "^10.4.19", "postcss": "^8.4.38", "tailwindcss": "^3.4.3", "typescript": "^5" }
}`;

const tsConfig = `{ "compilerOptions": { "lib": ["dom", "dom.iterable", "esnext"], "allowJs": true, "skipLibCheck": true, "strict": true, "noEmit": true, "esModuleInterop": true, "module": "esnext", "moduleResolution": "bundler", "resolveJsonModule": true, "isolatedModules": true, "jsx": "preserve", "incremental": true, "plugins": [{ "name": "next" }], "paths": { "@/*": ["./*"] } }, "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], "exclude": ["node_modules"] }`;
const tailwindConfig = `/** @type {import('tailwindcss').Config} */ module.exports = { content: [ "./app/**/*.{js,ts,jsx,tsx,mdx}", "./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}" ], theme: { extend: {} }, plugins: [] }`;
const postcssConfig = `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`;
const nextConfig = `/** @type {import('next').NextConfig} */ const nextConfig = { reactStrictMode: true }; module.exports = nextConfig;`;
const globalsCss = `@tailwind base; @tailwind components; @tailwind utilities; body { background-color: #f0f7ff; }`;
const pageTsx = `import WatermarkAdder from "@/components/WatermarkAdder"; export default function Home() { return ( <main className="min-h-screen py-8"> <div className="container mx-auto px-4"> <h1 className="text-4xl font-extrabold text-center mb-2 text-blue-900 tracking-tight">Watermark Adder</h1> <p className="text-center text-blue-600 mb-10 font-medium">Add your logo to the bottom-right corner in seconds.</p> <WatermarkAdder /> </div> </main> ); }`;

// Write Files
writeFile('package.json', packageJson);
writeFile('tsconfig.json', tsConfig);
writeFile('tailwind.config.js', tailwindConfig);
writeFile('postcss.config.js', postcssConfig);
writeFile('next.config.js', nextConfig);
writeFile('app/globals.css', globalsCss);
writeFile('app/layout.tsx', layoutTsx);
writeFile('app/page.tsx', pageTsx);
writeFile('components/WatermarkAdder.tsx', watermarkAdderTsx); 

console.log('-------------------------------------------');
console.log('✅ SETUP COMPLETED (V6.1: Variable Name Fixed)');
console.log('👉 Run: node setup.js');
console.log('👉 Then: npm run dev');
console.log('-------------------------------------------');