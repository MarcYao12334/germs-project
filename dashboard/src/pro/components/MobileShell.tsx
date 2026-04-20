import { ReactNode } from 'react';
export default function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex justify-center bg-command-900">
      <div
        className="w-full max-w-[430px] min-h-screen shadow-2xl shadow-black/70 relative flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0c1220 60%, #0f172a 100%)' }}
      >
        {children}
      </div>
    </div>
  );
}
