import WatermarkAdder from "@/components/WatermarkAdder"; 

export default function Home() {
  return (
    // แก้ไขบรรทัดนี้: ใส่ bg-[url('/bg.jpg')] และค่าอื่นๆ
    <main className="min-h-screen py-8 bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
      
      {/* เพิ่ม Overlay สีขาวจางๆ เพื่อให้อ่านตัวหนังสือออกง่ายขึ้น (ถ้าไม่ชอบลบ div นี้ออกได้) */}
      <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl font-extrabold text-center mb-2 text-blue-900 tracking-tight drop-shadow-sm">
          Watermark Adder
        </h1>
        <p className="text-center text-blue-800 mb-10 font-medium drop-shadow-sm">
          Add your logo to the bottom-right corner in seconds.
        </p>
              <WatermarkAdder /> 
              <img 
                src="/E.jpg" 
                className="animate-smooth-move" 
              />
              
              <img 
                src="/E2.jpg" 
                className="animate-smooth-move" 
              />
              
              <img 
                src="/E3.jpg" 
                className="animate-smooth-move" 
              />
              
              <img 
                src="/E4.png" 
                className="animate-smooth-move" 
              />
      </div>
    </main>
  );
}