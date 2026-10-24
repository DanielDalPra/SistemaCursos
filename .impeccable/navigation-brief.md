# Learner navigation extension

Mode: Operate, with existing Read lesson surfaces. User approved the proposed
sidebar, course states/resume, account/logout and manual access improvements.
Extend the approved Epilogue, stone, ink and blue world; no new brand direction.

Shared navigation: Meus cursos, incomplete-course resume, native account/logout,
conditional admin and public catalogue. Native details menu collapses at 760px;
course outline remains available. Course selection always lives at /cursos.
Courses use flat rows, explicit state/progress, pressed-button filters and
actionable empty/error states. Admin searches active accounts, selects or types
email, reviews course/action, then saves; revocation preserves progress.

Evidence: navigation-browser.cjs isolated memory database and screenshots at
1440/390 covering pending/empty/active/completed/offline, menu open, lesson,
admin search/grant/revoke review/course switch. Three complete course browser
flows, eleven API checks, seven resilience scenarios and home checks run.
No credentials, user-session access or production enrollments used in tests.

Detector run once; root-relative CSS unresolved by file scanner, so it reported
default black/16px hierarchy. Rendered captures and source CSS are authoritative.
No shipped raster assets added. Account/logout link destinations verified from
Wiki.js controllers; fixture tests do not exercise native account operations.

Fresh finish reviewer navigation_finish_reviewer: ship. Reviewed all 21 captures,
no material fixes identified within this extension. No approved comp or formal
QUALITY BAR was supplied; existing DESIGN.md and rendered identity were the
reference. Native mobile select truncation accepted because the full selected
course is repeated immediately below. Focus/admin-error/exceptionally-long-copy
and individual pending-access captures were outside the reviewed evidence.
