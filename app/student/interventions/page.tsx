'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  CheckSquare,
  ArrowRight,
  HelpCircle,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StudentInterventionsPage() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      const res = await fetch(
        '/api/interventions?studentId=00000000-0000-0000-0000-000000000101&onlyReleased=true'
      );
      const data = await res.json();
      setInterventions(data.interventions || []);
      if (data.interventions?.[0]) {
        setSelectedIntervention(data.interventions[0]);
      }
    }
    loadData();
  }, []);

  const toggleCheck = (idx: number) => {
    setCheckedItems({
      ...checkedItems,
      [idx]: !checkedItems[idx],
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Personalized Learning Center</h1>
        <p className="text-sm text-gray-500 font-medium">
          Faculty-approved study guides and targeted analogies grounded in your course materials.
        </p>
      </div>

      {selectedIntervention ? (
        <div className="space-y-6">
          {/* Top Banner */}
          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-r from-[#3E2D68] to-[#553E8A] text-white p-6 sm:p-8 space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant="emerald" className="text-xs font-bold uppercase">
                Faculty Approved & Released
              </Badge>
              <span className="text-xs text-purple-200">By Dr. Aris Thorne</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black leading-tight">
              {selectedIntervention.material?.title || 'State Space Search & Heuristic Admissibility'}
            </h2>

            <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
              {selectedIntervention.faculty_notes ||
                'Tailored study module designed to resolve diagnostic friction in Graph Search Decomposition.'}
            </p>
          </Card>

          {/* Identified Gap & Walkthrough */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Walkthrough (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Learning Gap Diagnostic */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 flex items-start space-x-3 text-xs text-amber-950">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 mb-0.5">Diagnosed Learning Gap</h4>
                  <p className="leading-relaxed">{selectedIntervention.material?.learning_gap_summary}</p>
                </div>
              </div>

              {/* Grounded Walkthrough Markdown */}
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                  <BookOpen className="w-5 h-5 text-[#3E2D68]" />
                  <CardTitle className="text-base font-bold text-gray-900">Conceptual Walkthrough</CardTitle>
                </div>
                <div className="text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-wrap bg-gray-50/50 p-4 rounded-2xl">
                  {selectedIntervention.material?.explanation_markdown}
                </div>
              </Card>

              {/* Worked Examples */}
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base font-bold text-gray-900">Step-by-Step Worked Examples</CardTitle>
                </div>
                <div className="space-y-3">
                  {selectedIntervention.material?.worked_examples?.map((ex: any, i: number) => (
                    <div key={i} className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs">
                      <span className="font-bold text-[#3E2D68] mr-2">Step {ex.step}:</span>
                      <span className="text-gray-800">{ex.description}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar Checklists & Next Steps (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Mental Analogies */}
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-base font-bold text-gray-900">Mental Analogies</CardTitle>
                </div>
                <div className="space-y-3">
                  {selectedIntervention.material?.analogies?.map((an: any, i: number) => (
                    <div key={i} className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 text-xs space-y-1">
                      <p className="font-bold text-amber-900">{an.concept}</p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">{an.analogy}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Interactive Revision Checklist */}
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                  <CheckSquare className="w-5 h-5 text-[#3E2D68]" />
                  <CardTitle className="text-base font-bold text-gray-900">Revision Checklist</CardTitle>
                </div>
                <div className="space-y-2.5">
                  {selectedIntervention.material?.revision_checklist?.map((item: string, i: number) => {
                    const isChecked = checkedItems[i] || false;
                    return (
                      <div
                        key={i}
                        onClick={() => toggleCheck(i)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 line-through'
                            : 'bg-white border-gray-100 text-gray-800 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="mt-0.5 rounded text-emerald-600"
                        />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-gray-50">
                  <Link href="/student/practice">
                    <Button className="w-full rounded-2xl text-xs font-bold bg-[#3E2D68]">
                      Go to Practice Quiz <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center text-gray-400 text-xs">
          No released personalized learning packages available yet. Your faculty will release one after diagnostic
          review.
        </Card>
      )}
    </div>
  );
}
