'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Mail, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentRole: 'faculty' | 'student';
  onRoleChange: (newRole: 'faculty' | 'student') => void;
}

export function Header({ currentRole, onRoleChange }: HeaderProps) {
  const router = useRouter();

  const isFaculty = currentRole === 'faculty';
  const userName = isFaculty ? 'Dr. Aris Thorne' : 'Branden Harris';
  const userTitle = isFaculty ? 'Professor of Computer Science' : 'Student (ID: CS2026-01)';
  const avatarUrl = isFaculty
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

  const handleToggle = () => {
    const next = isFaculty ? 'student' : 'faculty';
    onRoleChange(next);
    router.push(`/${next}`);
  };

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Left: Welcome Greeting */}
      <div className="flex items-center space-x-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Welcome back, <span className="text-[#3E2D68]">{userName}</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Smart Institute of Technology • Fall 2026</p>
        </div>

        {/* Search Input matching Template */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search courses, outcomes, assessments..."
            className="w-72 bg-[#F4F5FA] rounded-full pl-10 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 border border-transparent focus:border-[#3E2D68] focus:bg-white focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Right Controls: Role Switcher, Alerts, Profile */}
      <div className="flex items-center space-x-4">
        {/* Quick Role Switcher Pill */}
        <Button
          onClick={handleToggle}
          variant="outline"
          size="sm"
          className="rounded-full border-purple-200 bg-purple-50/70 text-[#3E2D68] hover:bg-purple-100 flex items-center space-x-2 text-xs font-bold px-3 py-1.5"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Switch to {isFaculty ? 'Student View' : 'Faculty View'}</span>
        </Button>

        {/* Notifications Icons */}
        <div className="flex items-center space-x-2 text-gray-500">
          <button className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center relative transition-colors">
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="w-2 h-2 rounded-full bg-[#FF6B72] absolute top-2 right-2 ring-2 ring-white" />
          </button>
          <button className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
            <Mail className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Profile Tag */}
        <div className="flex items-center space-x-3 pl-3 border-l border-gray-100">
          <img
            src={avatarUrl}
            alt={userName}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-gray-900 leading-tight">{userName}</p>
            <p className="text-[11px] text-gray-500 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-[#3E2D68]" />
              <span>{isFaculty ? 'Faculty' : 'Student'}</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
