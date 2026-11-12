import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractTextFromBuffer } from '@/lib/documents/parser';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const onlyApproved = searchParams.get('onlyApproved') === 'true';

  const materials = db.getMaterials(params.id, onlyApproved);
  return NextResponse.json({ success: true, materials });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const textContent = formData.get('textContent') as string | null;
    const filename = (formData.get('filename') as string) || (file ? file.name : 'Course_Material.txt');
    const uploader_id = (formData.get('uploader_id') as string) || '00000000-0000-0000-0000-000000000001';
    const module_id = (formData.get('module_id') as string) || undefined;

    let extractedText = '';
    let characterCount = 0;
    let fileType: 'pdf' | 'docx' | 'pptx' | 'txt' | 'md' = 'txt';

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
      extractedText = extraction.text;
      characterCount = extraction.characterCount;
    } else if (textContent) {
      extractedText = textContent.trim();
      characterCount = extractedText.length;
    } else {
      return NextResponse.json({ success: false, error: 'No file or text provided' }, { status: 400 });
    }

    const material = db.addMaterial({
      course_id: params.id,
      module_id,
      uploader_id,
      filename,
      storage_path: `materials/${params.id}/${filename}`,
      file_type: fileType,
      file_size_bytes: file ? file.size : Buffer.byteLength(extractedText),
      extracted_text: extractedText,
      character_count: characterCount,
      processing_status: 'completed',
      approval_status: 'approved', // Auto-approved for fast authoring, or pending
    });

    return NextResponse.json({ success: true, material });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

