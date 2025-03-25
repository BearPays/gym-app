"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useWorkout } from "@/contexts/WorkoutContext";

// Adding icons for the mobile navigation
function TemplateIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
      stroke="currentColor" className={`w-6 h-6 ${isActive ? "fill-blue-500 stroke-blue-500" : ""}`}>
      <path strokeLinecap="round" strokeLinejoin="round" 
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-3.75h3.75" />
    </svg>
  );
}

function WorkoutIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
      stroke="currentColor" className={`w-6 h-6 ${isActive ? "fill-blue-500 stroke-blue-500" : ""}`}>
      <path strokeLinecap="round" strokeLinejoin="round" 
        d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-1.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}

function AccountIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
      stroke="currentColor" className={`w-6 h-6 ${isActive ? "fill-blue-500 stroke-blue-500" : ""}`}>
      <path strokeLinecap="round" strokeLinejoin="round" 
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function ActiveWorkoutIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
      stroke="currentColor" className={`w-6 h-6 ${isActive ? "fill-blue-500 stroke-blue-500" : ""}`}>
      <path strokeLinecap="round" strokeLinejoin="round" 
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

export default function NavBar() {
  const { isAuthenticated } = useAuth();
  const { activeWorkout } = useWorkout(); // Access active workout session
  const pathname = usePathname();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe flex items-center justify-around shadow-lg">
      <Link href="/templates" className="flex-1">
        <div className={`flex flex-col items-center justify-center py-3 ${pathname.startsWith('/templates') ? 'text-blue-500' : 'text-gray-500'}`}>
          <TemplateIcon isActive={pathname.startsWith('/templates')} />
          <span className="text-xs mt-1">Templates</span>
        </div>
      </Link>
      
      <Link href="/workouts" className="flex-1">
        <div className={`flex flex-col items-center justify-center py-3 ${pathname.startsWith('/workouts') && !pathname.includes('/active') ? 'text-blue-500' : 'text-gray-500'}`}>
          <WorkoutIcon isActive={pathname.startsWith('/workouts') && !pathname.includes('/active')} />
          <span className="text-xs mt-1">Workouts</span>
        </div>
      </Link>
      
      {activeWorkout && (
        <Link href="/workouts/active" className="flex-1">
          <div className={`flex flex-col items-center justify-center py-3 ${pathname.includes('/active') ? 'text-blue-500' : 'text-gray-500'}`}>
            <ActiveWorkoutIcon isActive={pathname.includes('/active')} />
            <span className="text-xs mt-1">Active</span>
          </div>
        </Link>
      )}
      
      <Link href="/user" className="flex-1">
        <div className={`flex flex-col items-center justify-center py-3 ${pathname.startsWith('/user') ? 'text-blue-500' : 'text-gray-500'}`}>
          <AccountIcon isActive={pathname.startsWith('/user')} />
          <span className="text-xs mt-1">Account</span>
        </div>
      </Link>
    </nav>
  );
}
