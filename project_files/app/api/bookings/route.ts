import { getRawDb } from '@/db';
import { slotsFor, tutors } from '@/lib/tutors';
export async function POST(req: Request) {
  if (
    req.headers.get('origin') &&
    req.headers.get('origin') !== new URL(req.url).origin
  )
    return Response.json({ error: 'Invalid origin' }, { status: 403 });
  let b: Record<string, any>;
  try {
    if (Number(req.headers.get('content-length')) > 5000) throw Error();
    b = (await req.json()) as Record<string, any>;
    if (!b || typeof b !== 'object') throw Error();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
  const t = tutors.find((t) => t.id === b.tutorId);
  if (
    !t ||
    !slotsFor(t.id).includes(b.slot) ||
    !t.grades.includes(b.grade) ||
    !t.subjects.includes(b.subject) ||
    !['Online · Zoom', 'In person · family home or local spot'].includes(
      b.format,
    ) ||
    !['parentName', 'studentName', 'email'].every(
      (k) =>
        typeof b[k] === 'string' &&
        b[k].trim().length > 0 &&
        b[k].length <= 200,
    ) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)
  )
    return Response.json(
      {
        error: 'Please check your details, subject, grade, and selected time.',
      },
      { status: 400 },
    );
  const id = crypto.randomUUID();
  try {
    const inserted = await getRawDb()
      .prepare(
        'INSERT INTO bookings (id,tutor_id,slot,format,parent_name,email,student_name,grade,subject,created_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(tutor_id,slot) DO NOTHING RETURNING id',
      )
      .bind(
        id,
        t.id,
        b.slot,
        b.format,
        b.parentName.trim(),
        b.email.trim(),
        b.studentName.trim(),
        b.grade,
        b.subject,
        new Date().toISOString(),
      )
      .first();
    if (!inserted)
      return Response.json(
        {
          error:
            'That time was just taken. Please go back and choose another time.',
        },
        { status: 409 },
      );
    return Response.json(
      { reference: id.slice(0, 8).toUpperCase() },
      { status: 201 },
    );
  } catch (e) {
    if (String(e).includes('UNIQUE'))
      return Response.json(
        {
          error:
            'That time was just taken. Please go back and choose another time.',
        },
        { status: 409 },
      );
    return Response.json(
      { error: 'Your request could not be saved. Please try again.' },
      { status: 503 },
    );
  }
}
