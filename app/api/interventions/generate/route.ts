import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePersonalizedPackage } from '@/lib/ai/intervention-generator';
import { BloomTrait } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, course_id, diagnostic_attempt_id, weak_traits, weak_outcomes } = body;

    if (!student_id || !course_id) {
      return NextResponse.json(
        { success: false, error: 'Student ID and Course ID are required' },
        { status: 400 }
      );
    }

    const student = db.getProfile(student_id);
    const course = db.getCourse(course_id);
    if (!student || !course) {
      return NextResponse.json({ success: false, error: 'Student or Course not found' }, { status: 404 });
    }

    // Get grounding text from approved course materials
    const approvedMaterials = db.getMaterials(course_id, true);
    let groundingText = approvedMaterials
      .map((m) => `[Document: ${m.filename}]\n${m.extracted_text || ''}`)
      .join('\n\n');

    if (!groundingText.trim()) {
      groundingText = `Course: ${course.code} - ${course.title}. ${course.description || ''}`;
    }

    const attempt = diagnostic_attempt_id ? db.getAttempt(diagnostic_attempt_id) : undefined;
    const score = attempt?.percentage ?? 55;

    // Generate package grounded in course materials
    const pkg = await generatePersonalizedPackage({
      studentName: student.full_name,
      courseTitle: `${course.code}: ${course.title}`,
      weakTraits: (weak_traits || ['analysis', 'creativity']) as BloomTrait[],
      weakOutcomes: weak_outcomes || ['CO3'],
      groundingText,
      diagnosticScore: score,
    });

    // Save into database with status = 'pending_approval' (or 'generated')
    const saved = db.saveIntervention(
      {
        student_id,
        course_id,
        diagnostic_attempt_id,
        weak_traits: (weak_traits || ['analysis', 'creativity']) as BloomTrait[],
        weak_outcomes: weak_outcomes || ['CO3'],
        status: 'pending_approval',
        faculty_notes: `Remediation package generated for ${student.full_name} targeting ${weak_traits?.join(', ')}. Requires faculty approval before student release.`,
      },
      {
        title: pkg.title,
        learning_gap_summary: pkg.learning_gap_summary,
        explanation_markdown: pkg.explanation_markdown,
        worked_examples: pkg.worked_examples,
        analogies: pkg.analogies,
        revision_checklist: pkg.revision_checklist,
        recommended_next_steps: pkg.recommended_next_steps,
        grounding_material_ids: approvedMaterials.map((m) => m.id),
      },
      pkg.practice_questions.map((pq) => ({
        order_index: 1,
        question_text: pq.question_text,
        options: pq.options,
        correct_answer: pq.correct_answer,
        explanation: pq.explanation,
        trait: pq.trait as BloomTrait,
      }))
    );

    const fullIntervention = db.getIntervention(saved.id);

    return NextResponse.json({
      success: true,
      message: 'Personalized learning package generated. Pending faculty review and approval.',
      intervention: fullIntervention,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

