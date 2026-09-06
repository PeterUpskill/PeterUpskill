export const tutors = [
  {
    id: 'maya',
    name: 'Maya Chen',
    focus: 'Making math click',
    subjects: ['Elementary math', 'Pre-algebra', 'Algebra I', 'Algebra II'],
    grades: [5, 6, 7, 8, 9, 10, 11, 12],
    rate: 55,
    availability: 'Mon–Thu · afternoons',
    bio: 'A patient, step-by-step approach that helps students understand the why behind every answer.',
    color: 'blue',
  },
  {
    id: 'james',
    name: 'James Wilson',
    focus: 'A little curiosity goes a long way',
    subjects: ['Science', 'Elementary math', 'Pre-algebra'],
    grades: [4, 5, 6, 7, 8],
    rate: 45,
    availability: 'Tue–Fri · afternoons',
    bio: 'Connecting classroom ideas to everyday life, with space to ask questions and try again.',
    color: 'orange',
  },
  {
    id: 'sofia',
    name: 'Sofia Rivera',
    focus: 'Small steps. Growing confidence.',
    subjects: ['Elementary reading', 'Elementary math'],
    grades: [1, 2, 3, 4, 5],
    rate: 40,
    availability: 'Mon, Wed, Fri · afternoons',
    bio: 'Encouraging young learners with thoughtful practice and a pace that feels right for them.',
    color: 'pink',
  },
];
export function slotsFor(id: string) {
  const out: string[] = [];
  const t = tutors.find((x) => x.id === id);
  if (!t) return out;
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + i);
    const day = d.getUTCDay();
    if (
      (id === 'maya'
        ? [1, 2, 3, 4]
        : id === 'james'
          ? [2, 3, 4, 5]
          : [1, 3, 5]
      ).includes(day)
    ) {
      for (const hour of ['15:00', '16:30'])
        out.push(d.toISOString().slice(0, 10) + 'T' + hour + ':00');
    }
  }
  return out;
}
export const slotLabel = (s: string) =>
  new Date(s).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
