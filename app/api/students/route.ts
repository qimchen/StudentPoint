import { NextResponse } from 'next/server';
import { getValue } from '@/lib/kv';
import type { Student } from '@/lib/types';

export async function GET() {
  const students = await getValue<Student[]>('students', []);
  return NextResponse.json(students);
}
