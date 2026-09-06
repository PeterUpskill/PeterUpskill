# Dana’s Tutoring prototype

Tutor directory, subject filters, and a two-step session request flow. D1 stores requests and enforces one booking per tutor/time with an atomic unique constraint. Contact details, profiles, photos, and schedules are placeholders. No emails or payments are sent. Production use still needs Dana’s actual business details, tutor schedules/time zone, and a request review/notification workflow.

## PostHog

Set Sites runtime variables POSTHOG_PROJECT_TOKEN and POSTHOG_HOST (US default https://us.i.posthog.com; EU https://eu.i.posthog.com) and redeploy. Events go through /api/events to the documented PostHog capture API. Until configured the route returns status not_configured rather than claiming delivery.

Events: page_viewed, subject_filtered, booking_started, time_selected, booking_completed. Properties are explicitly limited to tutor_id, subject, format, rate, and simulated. Parent names, emails, student names, and grade are not captured. No replay, autocapture, advertising, or person profiles. Browser identifiers are random per tab/session.

Documentation: https://posthog.com/docs/api/capture

## Validation

`npm run build`, `npx tsc --noEmit`, and `node scripts/simulate.mjs`.
The simulation runs 12 visits, saves 3 sample requests, and checks duplicate booking prevention, unavailable slots, invalid email/grade, and absence of a public booking list. Run only against a demo environment; it reserves sample slots. Set SITE_URL to change its target. Events are labeled simulated.

WebMCP exposes start_tutor_booking when document.modelContext exists. No supported WebMCP testing context was available, so this optional integration is unverified. Browser UI testing was not requested; validation used HTTP requests and type/build checks.

## Stock photo sources

Sample Maya portrait: Nolan Manning https://unsplash.com/photos/a-person-with-the-hair-pulled-back-smiling-Ll9YOG20UFI
Sample James portrait: Christoph Sixt https://unsplash.com/photos/a-man-in-a-blue-shirt-smiling-for-the-camera-02650si1HxE
Sample Sofia portrait: Malama Mushitu https://unsplash.com/photos/a-woman-with-an-afro-is-smiling-for-the-camera-MfPPSuUXNMo

Names and profile details are fictional and do not identify the people pictured.
