import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromBuffer } from '@/lib/documents/parser';
import { extractSyllabus } from '@/lib/ai/syllabus-extractor';

export async function POST(req: NextRequest) {
  try {
    let syllabusText = '';
    let filename = 'Syllabus.txt';
    let fileType: 'pdf' | 'docx' | 'pptx' | 'txt' | 'md' = 'txt';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const textContent = formData.get('textContent') as string | null;
      filename = (formData.get('filename') as string) || (file ? file.name : filename);

      const lowerName = filename.toLowerCase();
      if (lowerName.endsWith('.pdf')) fileType = 'pdf';
      else if (lowerName.endsWith('.docx')) fileType = 'docx';
      else if (lowerName.endsWith('.pptx')) fileType = 'pptx';
      else if (lowerName.endsWith('.md')) fileType = 'md';

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const parseType = fileType === 'md' ? 'txt' : fileType;
        const extraction = await extractTextFromBuffer(buffer, parseType);
        if (!extraction.success) {
          return NextResponse.json({ success: false, error: extraction.error }, { status: 400 });
        }
        syllabusText = extraction.text;
      } else if (textContent) {
        syllabusText = textContent.trim();
      }
    } else {
      const body = await req.json().catch(() => ({}));
      syllabusText = body.syllabusText || body.textContent || '';
    }

    if (!syllabusText || syllabusText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'No syllabus text or file provided.' },
        { status: 400 }
      );
    }

    const extracted = await extractSyllabus({ syllabusText });

    return NextResponse.json({
      success: true,
      extracted,
      rawText: syllabusText.slice(0, 5000),
      filename,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

