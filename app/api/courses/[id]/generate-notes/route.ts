import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateModuleNotes } from '@/lib/ai/notes-generator';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = db.getCourse(params.id);
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const targetModuleId = body.moduleId as string | undefined;

    // Fetch approved learning materials for course
    const materials = db.getMaterials(params.id, true).filter(
      (m) => m.extracted_text && m.extracted_text.trim().length > 0
    );

    if (materials.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No course materials uploaded yet. Please upload course notes or a syllabus first.' },
        { status: 400 }
      );
    }

    const modules = db.getModules(params.id);
    if (modules.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No curriculum modules defined for this course.' },
        { status: 400 }
      );
    }

    const targetModules = targetModuleId
      ? modules.filter((m) => m.id === targetModuleId)
      : modules;

    const updated: any[] = [];

    for (const mod of targetModules) {
      // Find module-specific materials if available, otherwise use all materials
      const modMaterials = materials.filter((m) => m.module_id === mod.id);
      const groundingMaterials = modMaterials.length > 0 ? modMaterials : materials;

      const groundingText = groundingMaterials
        .map((m) => `=== DOCUMENT: ${m.filename} ===\n${m.extracted_text}`)
        .join('\n\n');

      const notes = await generateModuleNotes({
        courseTitle: `${course.code}: ${course.title}`,
        moduleTitle: mod.title,
        moduleOrder: mod.order_index,
        moduleDescription: mod.description,
        learningObjectives: mod.learning_objectives,
        groundingText,
      });

      const updatedMod = db.updateModule(mod.id, { notes_markdown: notes });
      if (updatedMod) updated.push(updatedMod);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated study notes for ${updated.length} module(s).`,
      modules: db.getModules(params.id),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

