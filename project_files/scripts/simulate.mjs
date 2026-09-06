import assert from 'node:assert/strict';
const base = process.env.SITE_URL || 'http://localhost:3000';
const results = {
  base,
  simulatedVisitors: 12,
  pageLoads: 0,
  requestsSaved: 0,
  duplicateBlocked: false,
  invalidDetailsBlocked: false,
  takenSlotHidden: false,
  telemetry: { sent: 0, notConfigured: 0 },
  checks: [],
};
async function event(name, id, props = {}) {
  const r = await fetch(base + '/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: name,
      distinct_id: id,
      properties: { ...props, simulated: true },
    }),
  });
  const b = await r.json();
  assert.ok(r.ok, JSON.stringify(b));
  if (b.status === 'sent') results.telemetry.sent++;
  if (b.status === 'not_configured') results.telemetry.notConfigured++;
}
async function post(body) {
  return fetch(base + '/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
for (let i = 0; i < 12; i++) {
  assert.equal((await fetch(base)).status, 200);
  results.pageLoads++;
  const id = 'simulation-' + crypto.randomUUID();
  await event('page_viewed', id);
  if (i % 2 === 0) await event('subject_filtered', id, { subject: 'Math' });
  if (i < 3) {
    const tutor = ['maya', 'james', 'sofia'][i];
    await event('booking_started', id, { tutor_id: tutor });
    const availability = await fetch(base + '/api/availability?tutor=' + tutor);
    assert.equal(availability.status, 200);
    const { slots } = await availability.json();
    assert.ok(slots.length);
    const body = {
      tutorId: tutor,
      slot: slots.at(-1),
      format: 'Online · Zoom',
      grade: 5,
      subject: 'Elementary math',
      parentName: 'Demo Parent',
      studentName: 'Demo Student',
      email: 'demo@example.com',
    };
    await event('time_selected', id, { tutor_id: tutor });
    const booking = await post(body);
    assert.equal(booking.status, 201, await booking.clone().text());
    assert.ok((await booking.json()).reference);
    results.requestsSaved++;
    await event('booking_completed', id, { tutor_id: tutor });
    if (i === 0) {
      const duplicate = await post(body);
      assert.equal(duplicate.status, 409, await duplicate.clone().text());
      results.duplicateBlocked = true;
      const next = await (
        await fetch(base + '/api/availability?tutor=' + tutor)
      ).json();
      assert.ok(!next.slots.includes(body.slot));
      results.takenSlotHidden = true;
      assert.equal(
        (await post({ ...body, email: 'invalid', slot: slots[0] })).status,
        400,
      );
      assert.equal(
        (await post({ ...body, grade: 1, slot: slots[0] })).status,
        400,
      );
      results.invalidDetailsBlocked = true;
    }
  }
}
assert.equal((await fetch(base + '/api/bookings')).status, 405);
results.checks = [
  '12 successful page requests',
  '3 saved booking requests',
  'Duplicate booking rejected',
  'Reserved slot removed from availability',
  'Invalid email and incompatible grade rejected',
  'Booking data cannot be listed publicly',
];
console.log(JSON.stringify(results, null, 2));
