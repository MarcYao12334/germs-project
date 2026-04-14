import { ReactNode } from 'react';
export default function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-200 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl shadow-black/10 relative flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
