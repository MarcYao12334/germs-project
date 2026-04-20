import { ReactNode } from 'react';
export default function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex justify-center bg-stone-200">
      <div
        className="w-full max-w-[430px] min-h-screen relative flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FEF7ED 50%, #FDF4E7 100%)' }}
      >
        {children}
      </div>
    </div>
  );
}
