import { ReactNode } from 'react';
export default function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #e0f2fe 50%, #f0fdf4 100%)' }}>
      <div className="w-full max-w-[430px] min-h-screen shadow-2xl shadow-black/10 relative flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fefce8 50%, #f0fdf4 100%)' }}>
        {children}
      </div>
    </div>
  );
}
