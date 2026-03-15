import { NextResponse } from 'next/server';
import { getValue } from '@/lib/kv';
import type { Student } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const students = await getValue<Student[]>('students', []);
  return NextResponse.json(students, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
