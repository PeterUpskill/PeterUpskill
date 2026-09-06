import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
export const bookings = sqliteTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    tutorId: text('tutor_id').notNull(),
    slot: text('slot').notNull(),
    format: text('format').notNull(),
    parentName: text('parent_name').notNull(),
    email: text('email').notNull(),
    studentName: text('student_name').notNull(),
    grade: integer('grade').notNull(),
    subject: text('subject').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [uniqueIndex('tutor_slot_unique').on(t.tutorId, t.slot)],
);
