import { getRawDb } from '@/db';
import { slotsFor, tutors } from '@/lib/tutors';
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('tutor') || '';
  if (!tutors.some((t) => t.id === id))
    return Response.json({ error: 'Unknown tutor' }, { status: 400 });
  try {
    const { results: taken } = await getRawDb()
      .prepare('SELECT slot FROM bookings WHERE tutor_id = ?')
      .bind(id)
      .all<{ slot: string }>();
    return Response.json(
      { slots: slotsFor(id).filter((s) => !taken.some((t) => t.slot === s)) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json(
      { error: 'Availability is temporarily unavailable' },
      { status: 503 },
    );
  }
}
