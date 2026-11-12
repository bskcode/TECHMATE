'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  CheckSquare,
  FileUp,
  BrainCircuit,
  Bell,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useApp } from '@/components/providers/app-provider';

interface CalendarEvent {
  day: number;
  month: number;
  year: number;
  title: string;
  type: 'diagnostic' | 'intervention' | 'final';
}

function MiniCalendar({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const firstDay = new Date(current.year, current.month, 1).getDay();
  const monthName = new Date(current.year, current.month, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const prev = () => {
    setSelectedDay(null);
    setCurrent((c) => {
      const d = new Date(c.year, c.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };
  const next = () => {
    setSelectedDay(null);
    setCurrent((c) => {
      const d = new Date(c.year, c.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const monthEvents = events.filter(
    (e) => e.year === current.year && e.month === current.month
  );

  const getDayBadge = (day: number) => {
    const ev = monthEvents.find((e) => e.day === day);
    if (!ev) return null;
    if (ev.type === 'diagnostic') return 'bg-[#FF6B72] text-white';
    if (ev.type === 'intervention') return 'bg-amber-400 text-white';
    return 'bg-[#3E2D68] text-white';
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number | null) =>
    d === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();

  const selectedEvents = selectedDay
    ? monthEvents.filter((e) => e.day === selectedDay)
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prev}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-sm font-bold text-gray-800">{monthName}</span>
        <button
          onClick={next}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 pb-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          const badge = d ? getDayBadge(d) : null;
          return (
            <div key={i} className="flex items-center justify-center">
              {d ? (
                <button
                  onClick={() => setSelectedDay(d)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                    badge
                      ? badge
                      : isToday(d)
                      ? 'ring-2 ring-[#3E2D68] text-[#3E2D68] font-bold'
                      : selectedDay === d
                      ? 'bg-purple-100 text-[#3E2D68] font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {d}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="mt-3 p-2.5 rounded-xl bg-[#F4F5FA] text-[11px]">
          <p className="font-bold text-[#3E2D68]">
            {new Date(current.year, current.month, selectedDay).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-gray-500 mt-0.5">No scheduled assessments or interventions.</p>
          ) : (
            <ul className="mt-1 space-y-0.5 text-gray-700">
              {selectedEvents.map((ev, idx) => (
                <li key={idx} className="font-medium">
                  • {ev.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3">
        <div className="flex items-center space-x-2 text-[11px] text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B72] shrink-0" />
          <span>Diagnostic Assessment</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
          <span>Intervention Review</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3E2D68] shrink-0" />
          <span>Module / Final Exam</span>
        </div>
      </div>
    </div>
  );
}

export default function FacultyDashboard() {
  const { getActiveUser } = useApp();
  const activeFaculty = getActiveUser('faculty');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const [cRes, nRes] = await Promise.all([
          fetch(`/api/courses?userId=${activeFaculty.id}&role=faculty`),
          fetch(`/api/notifications?userId=${activeFaculty.id}&role=faculty`),
        ]);
        const cData = await cRes.json();
        const nData = await nRes.json();
        const list = cData.courses || [];
        setCourses(list);
        setNotifications(nData.notifications || []);
        if (list.length > 0) {
          setSelectedCourseId(list[0].id);
        } else {
          setSelectedCourseId('');
          setAnalytics(null);
          setAssessments([]);
          setInterventions([]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [activeFaculty.id]);

  useEffect(() => {
    if (!selectedCourseId) return;
    async function loadCourseDetails() {
      const [aRes, asRes, iRes] = await Promise.all([
        fetch(`/api/courses/${selectedCourseId}/analytics`),
        fetch(`/api/courses/${selectedCourseId}/assessments`),
        fetch(`/api/interventions?courseId=${selectedCourseId}`),
      ]);
      const [aData, asData, iData] = await Promise.all([aRes.json(), asRes.json(), iRes.json()]);
      setAnalytics(aData.analytics || null);
      setAssessments(asData.assessments || []);
      setInterventions(iData.interventions || []);
    }
    loadCourseDetails();
  }, [selectedCourseId]);

  const traitChartData = (analytics?.traitData || []).map((t: any) => ({
    name: t.trait,
    score: t.classAverage,
    fill:
      t.classAverage >= 80
        ? '#3E2D68'
        : t.classAverage >= 65
        ? '#22C55E'
        : t.classAverage >= 55
        ? '#F7B928'
        : '#FF6B72',
  }));

  const weakTraits = traitChartData.filter((t: any) => t.score > 0 && t.score < 65);
  const publishedCount = assessments.filter((a) => a.status === 'published').length;
  const draftCount = assessments.length - publishedCount;
  const pendingInterventions = interventions.filter(
    (i) => i.status === 'pending_approval' || i.status === 'generated'
  ).length;

  const calendarEvents: CalendarEvent[] = [
    ...assessments.map((a) => {
      const d = new Date(a.published_at || a.created_at);
      return {
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        title: `${a.title} (${a.status})`,
        type: (a.assessment_type === 'diagnostic' ? 'diagnostic' : 'final') as 'diagnostic' | 'final',
      };
    }),
    ...interventions.map((i) => {
      const d = new Date(i.created_at);
      return {
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        title: `Intervention: ${i.student?.full_name || 'Student'}`,
        type: 'intervention' as const,
      };
    }),
  ];

  const topPerformers: Array<{ student: any; score: number }> = analytics?.topPerformers || [];
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Welcome to <span className="text-[#3E2D68]">AdaptiveLearn AI</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            {activeFaculty.institution} • Fall 2026 • {activeFaculty.full_name}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {courses.length > 0 && (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 shadow-sm"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          )}
          <Link href="/faculty/assessments">
            <Button variant="default" className="flex items-center space-x-2 text-xs font-bold rounded-xl shadow-sm">
              <BrainCircuit className="w-4 h-4 text-purple-300" />
              <span>Assessment Builder</span>
            </Button>
          </Link>
          <Link href="/faculty/materials">
            <Button variant="outline" className="flex items-center space-x-2 text-xs font-semibold rounded-xl bg-white shadow-sm">
              <FileUp className="w-4 h-4 text-gray-600" />
              <span>Upload Material</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Live Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden flex">
          <div className="w-1.5 shrink-0 bg-[#FF6B72] rounded-l-2xl" />
          <CardContent className="p-5 flex items-center justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Courses</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{loading ? '…' : courses.length}</h3>
              <p className="text-[11px] text-[#FF6B72] font-semibold mt-1 truncate max-w-[140px]">
                {courses.map((c) => c.code).join(', ') || 'No courses yet'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#FF6B72]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden flex">
          <div className="w-1.5 shrink-0 bg-[#3E2D68] rounded-l-2xl" />
          <CardContent className="p-5 flex items-center justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enrolled Students</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{analytics?.studentCount ?? 0}</h3>
              <p className="text-[11px] text-[#3E2D68] font-semibold mt-1">
                {selectedCourse?.code || 'Course'} · {analytics?.totalAttempts ?? 0} attempts
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#3E2D68]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden flex">
          <div className="w-1.5 shrink-0 bg-[#F7B928] rounded-l-2xl" />
          <CardContent className="p-5 flex items-center justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assessments</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{assessments.length}</h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                {publishedCount} published · {draftCount} draft
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-[#F7B928]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden flex">
          <div className="w-1.5 shrink-0 bg-[#22C55E] rounded-l-2xl" />
          <CardContent className="p-5 flex items-center justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Class Mastery</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">
                {analytics?.classMastery ? `${analytics.classMastery}%` : '—'}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {analytics?.avgGrowth ? `+${analytics.avgGrowth}pp avg growth` : 'Awaiting evaluations'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#22C55E]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Calendar + Activity Feed */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-2 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-900">Calendar &amp; Assessment Schedule</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <MiniCalendar events={calendarEvents} />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-900">Activities Notification</CardTitle>
              <Link href="/faculty/interventions">
                <Button variant="outline" size="sm" className="rounded-full text-xs font-bold text-gray-600 px-4">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No recent activity yet.</p>
              ) : (
                notifications.slice(0, 4).map((n) => (
                  <Link key={n.id} href={n.href} className="flex items-start space-x-3 hover:bg-gray-50 p-1.5 rounded-xl transition-colors">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        n.type === 'success'
                          ? 'bg-emerald-500'
                          : n.type === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-[#3E2D68]'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{n.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{n.detail}</p>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(n.time).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Performance Chart + Top Scorer Podium */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">
                  Bloom&apos;s Trait Performance — {selectedCourse?.code || 'Course'}
                </CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">Class average scores per cognitive dimension (%)</p>
              </div>
              <div className="flex items-center space-x-3 text-[10px] font-semibold text-gray-500">
                <span className="flex items-center space-x-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#3E2D68]" /><span>Strong</span></span>
                <span className="flex items-center space-x-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#F7B928]" /><span>Fair</span></span>
                <span className="flex items-center space-x-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#FF6B72]" /><span>Weak</span></span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {analytics?.totalAttempts === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 text-xs">
                  <p className="font-semibold text-gray-600">No evaluated student attempts yet for {selectedCourse?.code}.</p>
                  <p className="mt-1">Publish an assessment and have students complete it to populate Bloom trait mastery.</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={traitChartData} barGap={6} margin={{ left: -10 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(v: any) => [`${v}%`, 'Class Avg']}
                        contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF', fontSize: 12 }}
                      />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={42}>
                        {traitChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {weakTraits.length > 0 && (
                <div className="mt-4 p-3 bg-rose-50/80 rounded-2xl border border-rose-200/60 flex items-start space-x-3 text-xs text-rose-900">
                  <Bell className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Faculty Action Required: </span>
                    Class shows weakness in{' '}
                    {weakTraits.map((t: any, idx: number) => (
                      <span key={t.name}>
                        <span className="font-bold underline">{t.name} ({t.score}%)</span>
                        {idx < weakTraits.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                    . {pendingInterventions} remediation package(s) pending review under Interventions.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-900">Top Trait Performers</CardTitle>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {selectedCourse?.term || 'Fall 2026'}
              </span>
            </CardHeader>
            <CardContent className="pt-6">
              {topPerformers.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No evaluated student scores yet in {selectedCourse?.code || 'this course'}.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topPerformers.map((p, idx) => {
                    const styles = [
                      'bg-[#22C55E] text-white',
                      'bg-[#4E3788] text-white',
                      'bg-[#F7B928] text-gray-900',
                    ][idx] || 'bg-gray-800 text-white';
                    const rank = ['1st', '2nd', '3rd'][idx];
                    return (
                      <div
                        key={p.student.id}
                        className={`${styles} rounded-2xl p-4 flex flex-col items-center text-center shadow-md hover:-translate-y-1 transition-transform`}
                      >
                        <img
                          src={p.student.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={p.student.full_name}
                          className="w-14 h-14 rounded-full object-cover border-[3px] border-white/80 shadow"
                        />
                        <p className="text-xs font-bold mt-2">{p.student.full_name}</p>
                        <p className="text-[10px] opacity-80">{selectedCourse?.code}</p>
                        <div className="mt-2 text-xl font-black">{p.score}%</div>
                        <span className="mt-1 text-[10px] font-extrabold uppercase bg-white/20 px-3 py-0.5 rounded-full">
                          {rank}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  {
                    label: 'Avg Improvement',
                    value: analytics?.avgGrowth ? `+${analytics.avgGrowth}pp` : '0pp',
                    color: 'text-emerald-600',
                  },
                  {
                    label: 'Interventions Active',
                    value: String(interventions.length),
                    color: 'text-amber-600',
                  },
                  {
                    label: 'Draft Assessments',
                    value: String(draftCount),
                    color: 'text-[#3E2D68]',
                  },
                ].map((s) => (
                  <div key={s.label} className="bg-[#F4F5FA] rounded-2xl p-3">
                    <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
