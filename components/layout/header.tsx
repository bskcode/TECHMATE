'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Mail,
  ArrowRightLeft,
  ShieldCheck,
  ChevronDown,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/providers/app-provider';

interface HeaderProps {
  currentRole: 'faculty' | 'student';
  onRoleChange: (newRole: 'faculty' | 'student') => void;
}

export function Header({ currentRole, onRoleChange }: HeaderProps) {
  const router = useRouter();
  const { profiles, getActiveUser, setActiveUser } = useApp();
  const activeUser = getActiveUser(currentRole);
  const isFaculty = currentRole === 'faculty';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setNotifOpen(false);
        setMailOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadNotifs() {
      try {
        const res = await fetch(`/api/notifications?userId=${activeUser.id}&role=${currentRole}`);
        const data = await res.json();
        if (data.success) setNotifications(data.notifications || []);
      } catch {
        // ignore
      }
    }
    loadNotifs();
  }, [activeUser.id, currentRole]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&role=${currentRole}`
        );
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.results || []);
          setSearchOpen(true);
        }
      } catch {
        // ignore
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, currentRole]);

  const handleToggle = () => {
    const next = isFaculty ? 'student' : 'faculty';
    onRoleChange(next);
    router.push(`/${next}`);
  };

  const roleProfiles = profiles.filter((p) => p.role === currentRole);

  return (
    <header
      ref={containerRef}
      className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm"
    >
      {/* Left: Welcome Greeting + Live Search */}
      <div className="flex items-center space-x-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Welcome back, <span className="text-[#3E2D68]">{activeUser.full_name}</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {activeUser.institution || 'Smart Institute of Technology'} • Fall 2026
          </p>
        </div>

        {/* Live Global Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setSearchOpen(true)}
            placeholder="Search courses, outcomes, assessments..."
            className="w-72 bg-[#F4F5FA] rounded-full pl-10 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 border border-transparent focus:border-[#3E2D68] focus:bg-white focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />

          {searchOpen && (
            <div className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-40">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Search Results ({searchResults.length})
                </span>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-[11px] text-gray-400 hover:text-gray-700 font-semibold"
                >
                  Close
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {searchResults.length === 0 ? (
                  <p className="p-4 text-xs text-gray-400 text-center">No matching items found.</p>
                ) : (
                  searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-purple-50/50 transition-colors"
                    >
                      <div className="min-w-0 pr-3">
                        <span className="text-[10px] font-bold uppercase text-[#3E2D68] bg-purple-50 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                        <p className="text-xs font-bold text-gray-900 truncate mt-1">{item.title}</p>
                        <p className="text-[11px] text-gray-500 truncate">{item.subtitle}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Role Switcher, Alerts, Messages, Account Switcher */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={handleToggle}
          variant="outline"
          size="sm"
          className="rounded-full border-purple-200 bg-purple-50/70 text-[#3E2D68] hover:bg-purple-100 flex items-center space-x-2 text-xs font-bold px-3 py-1.5"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Switch to {isFaculty ? 'Student View' : 'Faculty View'}</span>
        </Button>

        {/* Notifications Bell Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setMailOpen(false);
              setUserMenuOpen(false);
            }}
            aria-label="Notifications"
            className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center relative transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-600" />
            {notifications.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF6B72] absolute top-2 right-2 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-40">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-900">Activity Notifications</span>
                <span className="text-[10px] font-bold text-[#3E2D68] bg-purple-50 px-2 py-0.5 rounded-full">
                  {notifications.length} live
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-gray-400 text-center">You are all caught up.</p>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setNotifOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-xs font-bold text-gray-900">{n.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{n.detail}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages / Announcements Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setMailOpen(!mailOpen);
              setNotifOpen(false);
              setUserMenuOpen(false);
            }}
            aria-label="Academic Messages"
            className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <Mail className="w-4 h-4 text-gray-600" />
          </button>

          {mailOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-40">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-900">Academic Dispatch</span>
                <Sparkles className="w-3.5 h-3.5 text-[#3E2D68]" />
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
                  <p className="font-bold text-[#3E2D68]">
                    {isFaculty ? 'Authoring Standards Active' : 'Progressive 2-Hint Policy'}
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    {isFaculty
                      ? 'Standardized Syllabus, Objectives, and Lecture templates are available in Courses & Materials.'
                      : 'Assessments unlock Hint 1 (-25%) after Attempt 1 and Hint 2 (-50%) after Attempt 2.'}
                  </p>
                </div>
                <Link
                  href={isFaculty ? '/faculty/interventions' : '/student/interventions'}
                  onClick={() => setMailOpen(false)}
                  className="block text-center text-[11px] font-bold text-[#3E2D68] hover:underline"
                >
                  Open {isFaculty ? 'Intervention Queue' : 'Personalized Study Plans'} →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Active Profile & Account Switcher */}
        <div className="relative pl-3 border-l border-gray-100">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotifOpen(false);
              setMailOpen(false);
            }}
            className="flex items-center space-x-2.5 text-left hover:bg-gray-50 rounded-xl p-1 transition-colors"
          >
            <img
              src={
                activeUser.avatar_url ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
              }
              alt={activeUser.full_name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100"
            />
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">{activeUser.full_name}</p>
              <p className="text-[11px] text-gray-500 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-[#3E2D68]" />
                <span>{isFaculty ? 'Faculty' : 'Student'}</span>
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-40">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Switch {isFaculty ? 'Faculty' : 'Student'} Account
                </p>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {roleProfiles.map((p) => {
                  const isSelected = p.id === activeUser.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveUser(p);
                        setUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-purple-50/50 transition-colors ${
                        isSelected ? 'bg-purple-50/60' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.full_name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{p.email}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#3E2D68] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
