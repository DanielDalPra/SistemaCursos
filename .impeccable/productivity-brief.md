# Productivity course extension

Mode: Read with Operate controls. Reuse approved Aprende course identity and layouts.
User approved first course, delegated the next course while away, and requires a
commit/push for each page and each later change. No new visual direction or imagery.

Course: Tempo para o que importa, id rotina-possivel. Reading path: context-aware
routine video → original weekly workbook → short weekly planning video → five-question
formative quiz. Workbook saves five planning decisions; video two saves the review.

Sources checked against official YouTube oEmbed and public captions, 24/10/2026:
Luana Carolina nwCtVnHAEqQ (~12min) and Thais Godinho NZNuJonVK2k (~3min).
Selected for complementary practical content, attribution and context-aware advice.
No full transcripts stored in Git. Video availability/playback remains external.

Multi-course extension preserves first course URLs/data and isolates grants,
notes, progress and attempts by courseId. Admin uses a native course selector.
Student area resumes a single enrolled course or offers a course choice.

Verification: ten API tests, first-course regression browser flow, second-course
browser flow, responsive home check. All passed. Screenshots: desktop/mobile for
four lessons, result, pending access, administration and student selection, plus
print-media workbook. External iframe replaced by a fixture for browser tests.
Static detector cannot resolve root-relative CSS URLs; its default-type findings
are not a valid rendered verdict. Playwright and fresh visual review used instead.

Independent finish reviewer disposition: ship. All 17 screenshots reviewed, no
blocking findings. Print-media screenshot verifies layout, not PDF pagination.
