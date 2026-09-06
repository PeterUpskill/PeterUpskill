import { env } from 'cloudflare:workers';
const events = [
  'page_viewed',
  'subject_filtered',
  'booking_started',
  'time_selected',
  'booking_completed',
];
export async function POST(req: Request) {
  if (
    req.headers.get('origin') &&
    req.headers.get('origin') !== new URL(req.url).origin
  )
    return Response.json({ error: 'Invalid origin' }, { status: 403 });
  let b: Record<string, any>;
  try {
    b = (await req.json()) as Record<string, any>;
    if (!b || typeof b !== 'object') throw Error();
  } catch {
    return Response.json({ error: 'Invalid event' }, { status: 400 });
  }
  if (!events.includes(b.event))
    return Response.json({ error: 'Unknown event' }, { status: 400 });
  const config = env as unknown as Record<string, string>;
  if (!config.POSTHOG_PROJECT_TOKEN)
    return Response.json({ status: 'not_configured' }, { status: 202 });
  const properties: Record<string, unknown> = {
    prototype: true,
    $process_person_profile: false,
  };
  for (const k of ['tutor_id', 'subject', 'format', 'rate', 'simulated']) {
    if (['string', 'number', 'boolean'].includes(typeof b.properties?.[k]))
      properties[k] = String(b.properties[k]).slice(0, 80);
  }
  const host = config.POSTHOG_HOST || 'https://us.i.posthog.com';
  try {
    const r = await fetch(host + '/i/v0/e/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: config.POSTHOG_PROJECT_TOKEN,
        event: b.event,
        distinct_id:
          typeof b.distinct_id === 'string'
            ? b.distinct_id.slice(0, 80)
            : 'anonymous',
        properties,
        timestamp: new Date().toISOString(),
      }),
    });
    if (!r.ok) throw Error();
    return Response.json({ status: 'sent' });
  } catch {
    return Response.json(
      { error: 'Telemetry delivery failed' },
      { status: 502 },
    );
  }
}
