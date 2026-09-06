'use client';
import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Video,
  MapPin,
  Clock,
  Check,
  Mail,
  Phone,
  ChevronLeft,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { tutors, slotLabel } from '@/lib/tutors';
import {demoRequest,track} from '@/lib/demo-api';
function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v || '')}>
      <SelectTrigger aria-label={label} className="choice">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((v) => (
          <SelectItem key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export default function Home() {
  const [subject, setSubject] = useState('All subjects'),
    [tutor, setTutor] = useState<(typeof tutors)[number] | null>(null),
    [step, setStep] = useState(1),
    [slots, setSlots] = useState<string[]>([]),
    [slot, setSlot] = useState(''),
    [format, setFormat] = useState('Online · Zoom'),
    [grade, setGrade] = useState(''),
    [requested, setRequested] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [reference, setReference] = useState('');
  useEffect(() => {
    try {if (!sessionStorage.getItem('visitor')) sessionStorage.setItem('visitor', crypto.randomUUID());} catch {}
    track('page_viewed');
  }, []);
  async function book(t: (typeof tutors)[number]) {
    setTutor(t);
    setStep(1);
    setSlot('');
    setGrade('');
    setRequested('');
    setError('');
    setSlots([]);
    track('booking_started', { tutor_id: t.id });
    try {
      const r = await demoRequest('/api/availability?tutor=' + t.id);
      if (!r.ok) throw Error();
      setSlots(((await r.json()) as { slots: string[] }).slots);
    } catch {
      setError(
        'We couldn’t load available times. Close this window and try again.',
      );
    }
  }
  useEffect(() => {
    const context = (
      document as unknown as {
        modelContext?: {
          registerTool: (tool: unknown, options: unknown) => void;
        };
      }
    ).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    try {
      context.registerTool(
        {
          name: 'start_tutor_booking',
          description:
            'Open the booking form for a sample tutor and load available times. Does not submit a request.',
          inputSchema: {
            type: 'object',
            properties: {
              tutorId: { type: 'string', enum: ['maya', 'james', 'sofia'] },
            },
            required: ['tutorId'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: async (input: unknown) => {
            const id = (input as { tutorId?: string })?.tutorId;
            const t = tutors.find((t) => t.id === id);
            if (!t) throw new Error('Unknown tutor');
            await book(t);
            return { status: 'booking_form_opened', tutorId: t.id };
          },
        },
        { signal: lifecycle.signal },
      );
    } catch {}
    return () => lifecycle.abort();
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!grade || !requested) {
      setError('Please choose a grade and subject.');
      return;
    }
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      const r = await demoRequest('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: tutor!.id,
          slot,
          format,
          grade: Number(grade),
          subject: requested,
          parentName: f.get('parentName'),
          email: f.get('email'),
          studentName: f.get('studentName'),
        }),
      });
      const data = (await r.json()) as { error?: string; reference: string };
      if (!r.ok) throw Error(data.error || 'Unable to save. Please try again.');
      setReference(data.reference);
      setStep(3);
      track('booking_completed', {
        tutor_id: tutor!.id,
        format,
        rate: tutor!.rate,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="nav">
        <a href="#" className="brand">
          <span className="brand-icon">
            <BookOpen size={23} />
          </span>
          Dana’s<span className="brand-light">tutoring</span>
        </a>
        <nav>
          <a href="#tutors">Our tutors</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">
            Contact <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>
      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span /> MORE CONFIDENCE, ONE SESSION AT A TIME
            </div>
            <h1>
              A little help.
              <br />A big <em>“I get it.”</em>
            </h1>
            <p>
              Find the right support for your child, from elementary reading to
              Algebra II. Good people, patient teaching, and a time that works
              for you.
            </p>
            <a className="primary" href="#tutors">
              Find your tutor <ArrowRight size={18} />
            </a>
          </div>
          <aside className="intro-note">
            <span className="note-index">01 / A GOOD PLACE TO START</span>
            <h2>
              Learning feels better{' '}
              <br />
              with someone{' '}
              <br />
              in your corner.
            </h2>
            <div className="note-bottom">
              <span>
                <Video size={19} /> Online via Zoom
              </span>
              <span>
                <MapPin size={19} /> At home or a local spot
              </span>
            </div>
          </aside>
        </section>
        <section id="tutors" className="tutors-section">
          <div className="section-top">
            <div>
              <div className="eyebrow">YOUR CHILD’S NEXT TEAMMATE</div>
              <h2>Meet your tutors.</h2>
            </div>
            <Choice
              label="Filter tutors by subject"
              value={subject}
              onChange={(v) => {
                setSubject(v);
                track('subject_filtered', { subject: v });
              }}
              options={[
                'All subjects',
                'Math',
                'Science',
                'Elementary reading',
              ]}
            />
          </div>
          <p className="sample-note">
            Meet the possibilities: profiles, photos, and availability below are
            samples for this prototype.
          </p>
          <div className="tutor-grid">
            {tutors
              .filter(
                (t) =>
                  subject === 'All subjects' ||
                  t.subjects.some((s) =>
                    subject === 'Math'
                      ? /math|algebra/i.test(s)
                      : s === subject,
                  ),
              )
              .map((t, i) => (
                <article className={'tutor-card ' + t.color} key={t.id}>
                  <div className="portrait">
                    <img
                      src={'./tutor-' + t.id + '.jpg'}
                      alt={'Sample portrait for ' + t.name}
                    />
                    <span className="portrait-tag">
                      {t.id === 'sofia'
                        ? 'ELEMENTARY LEARNERS'
                        : 'MIDDLE SCHOOL & BEYOND'}
                    </span>
                  </div>
                  <div className="card-content">
                    <div className="card-heading">
                      <h3>{t.name}</h3>
                      <span className="rate">
                        ${t.rate}
                        <small> / hr</small>
                      </span>
                    </div>
                    <p className="focus">{t.focus}</p>
                    <div className="tags">
                      {t.subjects.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                    <p className="bio">{t.bio}</p>
                    <div className="details">
                      <span>
                        <BookOpen size={16} /> Grades {t.grades[0]}–
                        {t.grades.at(-1)}
                      </span>
                      <span>
                        <Clock size={16} />
                        {t.availability}
                      </span>
                    </div>
                    <button className="book-button" onClick={() => book(t)}>
                      Choose a time <ArrowUpRight size={18} />
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>
        <section className="how" id="how">
          <h2>
            A simpler way
            <br />
            to get support.
          </h2>
          {[
            [
              '01',
              'Find your fit',
              'Choose a tutor by subject, grade, and hourly rate.',
            ],
            [
              '02',
              'Make some time',
              'Pick an available one-hour session, online or in person.',
            ],
            [
              '03',
              'Leave the rest to Dana',
              'Submit a request. Dana confirms the details and invoices you directly.',
            ],
          ].map(([n, h, p]) => (
            <div key={n}>
              <span className="step-number">{n}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </section>
        <section className="bottom-grid">
          <div id="pricing" className="pricing">
            <div className="eyebrow">CLEAR FROM THE START</div>
            <h2>
              $40–$55 <span>/ hour</span>
            </h2>
            <p>
              Each tutor’s rate is listed above. Sessions are one hour. Dana
              handles invoicing directly—no online payment needed.
            </p>
          </div>
          <div id="contact" className="contact">
            <div className="eyebrow">LET’S TALK IT THROUGH</div>
            <h2>A question before you book?</h2>
            <p>Contact Dana for help finding the right fit.</p>
            <div>
              <span>
                <Mail size={18} /> hello@example.com
              </span>
              <span>
                <Phone size={18} /> (555) 010-0100
              </span>
            </div>
            <small>Placeholder contact details · not monitored</small>
          </div>
        </section>
      </main>
      <footer>
        <a className="brand" href="#">
          Dana’s<span className="brand-light">tutoring</span>
        </a>
        <span>Room to learn. Space to grow.</span>
        <small>Prototype · demo bookings stay in this browser</small>
      </footer>
      <Dialog
        open={!!tutor}
        onOpenChange={(v) => {
          if (!v) setTutor(null);
        }}
      >
        <DialogContent className="booking-dialog">
          <DialogTitle className="dialog-title">
            {step === 3
              ? 'Your demo request is saved.'
              : `Book with ${tutor?.name.split(' ')[0]}`}
          </DialogTitle>
          <DialogDescription>
            {step === 3
              ? 'Saved in this browser only. Dana has not received a request, and no real session or email has been scheduled.'
              : `Step ${step} of 2 · One hour · $${tutor?.rate} · No payment now`}
          </DialogDescription>
          {step === 1 ? (
            <>
              <label className="field-label">
                Where would you like to meet?
              </label>
              <Choice
                label="Session format"
                value={format}
                onChange={setFormat}
                options={[
                  'Online · Zoom',
                  'In person · family home or local spot',
                ]}
              />
              <p className="field-label">Choose an available time</p>
              <p className="small-text">
                Sample schedule · times in your local time zone
              </p>
              <div className="slots">
                {slots.map((s) => (
                  <button
                    key={s}
                    className={slot === s ? 'selected' : ''}
                    onClick={() => {
                      setSlot(s);
                      track('time_selected', { tutor_id: tutor!.id });
                    }}
                  >
                    {slotLabel(s)}
                  </button>
                ))}
              </div>
              {!slots.length && !error && <p>Loading available times…</p>}
              <button
                className="primary"
                disabled={!slot}
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight size={18} />
              </button>
            </>
          ) : step === 2 ? (
            <form onSubmit={submit}>
              <button
                type="button"
                className="back"
                onClick={() => {
                  setStep(1);
                  setSlot('');
                  demoRequest('/api/availability?tutor=' + tutor!.id)
                    .then((r) => r.json())
                    .then((d) => setSlots((d as { slots: string[] }).slots))
                    .catch(() =>
                      setError(
                        'Unable to refresh times. Please reopen booking.',
                      ),
                    );
                }}
              >
                <ChevronLeft size={16} /> Change time
              </button>
              <div className="summary">
                {slotLabel(slot)}
                <br />
                {format} · ${tutor?.rate}
              </div>
              <label className="field-label">
                Parent’s name
                <input
                  name="parentName"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </label>
              <label className="field-label">
                Parent’s email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  maxLength={200}
                />
              </label>
              <label className="field-label">
                Student’s first name
                <input name="studentName" required maxLength={80} />
              </label>
              <div className="form-grid">
                <div>
                  <label className="field-label">Student’s grade</label>
                  <Choice
                    label="Select grade"
                    value={grade}
                    onChange={setGrade}
                    options={tutor!.grades.map(String)}
                  />
                </div>
                <div>
                  <label className="field-label">Requested subject</label>
                  <Choice
                    label="Select subject"
                    value={requested}
                    onChange={setRequested}
                    options={tutor!.subjects}
                  />
                </div>
              </div>
              <p className="small-text">
                Use sample information for this prototype. Only the sample tutor and time are saved in this browser. Names and email are not saved or sent.
              </p>
              <button className="primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save demo request'}{' '}
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <div className="success">
              <span className="success-icon">
                <Check />
              </span>
              <h3>One step closer to “I get it.”</h3>
              <p>
                {tutor?.name} · {slotLabel(slot)}
                <br />
                {format} · ${tutor?.rate}
              </p>
              <p className="summary">Request reference: {reference}</p>
              <button className="primary" onClick={() => setTutor(null)}>
                Back to tutors
              </button>
            </div>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
