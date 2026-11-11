'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'faculty' | 'student'>('student');

  return (
    <div className="flex min-h-screen bg-[#F4F5FA]">
      <Sidebar currentRole={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentRole={role} onRoleChange={setRole} />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
