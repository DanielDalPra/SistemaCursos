---
name: Aprende
description: Confident type, stone surfaces and blueprint blue for a clear course catalogue.
colors:
  primary: "#2456d6"
  primary-deep: "#153fae"
  ground: "#dfdedb"
  surface: "#d3d2ce"
  ink: "#26251e"
  on-accent: "#ffffff"
  field: "#ecebe8"
  surface-hover: "#c2c0bb"
  placeholder: "#56544e"
typography:
  display:
    fontFamily: "Epilogue, Arial, sans-serif"
    fontSize: "clamp(64px, 9vw, 96px)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Epilogue, Arial, sans-serif"
    fontSize: "clamp(35px, 4.7vw, 64px)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Epilogue, Arial, sans-serif"
    fontSize: "clamp(28px, 3.2vw, 46px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  lead:
    fontFamily: "Epilogue, Arial, sans-serif"
    fontSize: "clamp(21px, 2.1vw, 30px)"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Epilogue, Arial, sans-serif"
    fontSize: "clamp(16px, 1.3vw, 19px)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Epilogue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
rounded:
  square: "0px"
spacing:
  gutter: "32px"
  gutter-mobile: "20px"
  control-gap: "8px"
  section-gap: "140px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.square}"
    padding: "23px 27px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-account:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    padding: "14px 18px"
  filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "13px 15px"
  filter-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-accent}"
  search:
    backgroundColor: "{colors.field}"
    padding: "13px 16px"
  course-summary:
    backgroundColor: "{colors.surface}"
    padding: "16px 20px"
---

# Design System: Aprende

## Overview

**Creative North Star: "The Typographic Prospectus"**

Large, assured Epilogue typography gives the interface its voice. Warm stone fields, dark ink and blueprint blue make a spacious, direct system whose hierarchy comes from scale, placement and clear interactive states.

Photography is illustrative and cropped into unrounded rectangles. This documents the implemented comparison home, not a final client identity: the name, stock photographs and sample course content remain provisional. The direction replaces the previous generic split hero and decorative cards on this surface; that composition choice is recorded in `.impeccable/home-brief.md` rather than imposed on every future screen.

**Key Characteristics:**
- Heavy display type with restrained medium-weight headings.
- Flat stone surfaces and a single blue accent.
- Open photographic rows and square controls.
- Visible keyboard focus and motion that respects reduced-motion preferences.

## Colors

Warm greys and brown-black ink support one saturated blue; the frontmatter holds the exact source values.

### Primary
- **Blueprint Blue** (`primary`): primary actions, selected category filters, selection highlight, scrollbars and the full-width enrolment explanation.
- **Deep Blueprint Blue** (`primary-deep`): primary action hover on fine pointers.

### Neutral
- **Stone Ground** (`ground`): page canvas and reversed footer text.
- **Stone Surface** (`surface`): filters, disclosure summaries, photo fallback and empty state.
- **Dark Ink** (`ink`): text, account action and footer field.
- **White on Blue** (`on-accent`): text on blue controls and fields.
- **Pale Stone Field** (`field`): search and expanded course details.
- **Pressed Stone** (`surface-hover`): unselected filter and disclosure hover.
- **Muted Ink** (`placeholder`): readable search hint.

## Typography

**Display Font:** Epilogue (Arial, sans-serif fallback).
**Body Font:** Epilogue (Arial, sans-serif fallback).

**Character:** One locally hosted family supplies both the forceful invitation and practical reading text. Font files cover weights 400, 500, 700 and 900; the current hierarchy chiefly uses 400, 500 and 900. The display font file is preloaded and all faces use swap.

### Hierarchy
- **Display:** the frontmatter display role drives the two-line hero. Mobile overrides its size with `clamp(43px, 9vw, 64px)`.
- **Headline:** section headings use the headline role; mobile uses `clamp(34px, 7vw, 48px)`.
- **Title:** course titles use the title role, constrained to 18ch; they become 35px at the intermediate breakpoint and 31px/20ch on mobile.
- **Lead:** introductory text uses the lead role, constrained to 37ch. Mobile hero copy is 20px with 1.5 line height; the general mobile lead token is 23px.
- **Body:** the frontmatter body role is the default. Longer course and supporting copy use 1.65 line height and approximately 38–45ch measures.
- **Label:** navigation, metadata, search and disclosure copy use the label role. Filters are 13px, becoming 12px on mobile. Labels remain sentence case.
- **Wordmark:** header uses 30px/900 with -1.6px tracking (25px mobile). The footer wordmark uses `clamp(70px, 18.5vw, 290px)`, 900 weight, 1 line height and -0.06em tracking; mobile uses 18.5vw.

## Layout

The shared frame is centred, full width and capped at 1600px, with the frontmatter gutter values. Desktop header height is 108px. The hero begins 65px below it; its lower text and action align on a shared flex row. Category shortcuts follow as a horizontal index.

The catalogue has 130px top and 140px bottom padding. Course rows pair image and copy in a `1.15fr 1fr` grid with 7.5% gap; rows are separated by 80px. Images use a 1.65 aspect ratio. The blue explanation and student area use equal columns with 9% gaps. Student imagery has a 1.2 ratio. The explanation has 100px vertical padding; the student section uses 140px.

At max-width 1100px the toolbar stacks, search caps at 420px, catalogue top padding becomes 100px and row spacing becomes 65px. At max-width 760px the desktop nav disappears while account access remains. Hero, category index, catalogue, explanation and footer become single-column flows. Course images use 1.4 aspect ratio; course rows have 60px separation. Catalogue and student sections use 85px vertical spacing; the explanation uses 70px. Mobile search fills its available width.

## Elevation & Depth

There are no shadows. Depth comes from tonal changes between ground, surface and pale fields, plus large blue and dark-ink sections. Photographs stay in their rectangular viewport. The image hover adds a small scale change and restores colour without lifting the row.

## Shapes

Controls and containers have square corners, with no decorative border or enclosing course-card shell. Overflow clips photographs and hero text animation. Icons are open strokes with rounded line caps and joins (1.6 stroke width); default icons are 24px, with smaller 18–20px variants.

## Components

### Buttons
Direct rectangular actions. Primary uses the frontmatter assignment with 16px/500 text, a 40px internal gap and 64px minimum height. Mobile padding is 19px 21px and minimum height 60px. Fine-pointer hover darkens blue and moves arrow icons 3px right and 3px up. Press scales to .97. Account access uses dark ink and becomes blue on hover. All interactive elements use a 3px current-colour focus outline offset by 6px.

### Chips
Category filters are square, borderless buttons, at least 44px high. Unselected filters use stone; the active filter uses blue and white. Selection is reflected in `aria-pressed`. Filtering and accent-insensitive search combine; category shortcuts clear search and select their category. A polite status announces result counts.

### Cards / Containers
Courses are open editorial rows rather than raised cards. Image, category, title, description and native disclosure form each row. The empty state uses stone, centred text and a blue reset action; reset clears both controls and restores search focus.

### Inputs / Fields
Search is a pale, borderless rectangle with a stroke icon and transparent input. The caret is blue and placeholder uses muted ink. Mobile input text is 16px. Keyboard focus retains the shared outline, with 2px offset on the input. No error or disabled treatment is implemented.

### Navigation
Header navigation is small sentence-case text with underline on fine-pointer hover; the wordmark sits left and account access right. Mobile hides the two header section links, retaining the wordmark and account action. Footer navigation stacks and stays available. A focus-revealed skip link precedes the header.

### Course disclosure
Native `details` uses a stone summary, 54px minimum height and plus icon that rotates 45 degrees when open. Expanded copy sits on pale stone and links to the existing login. The footer photo credits use another native disclosure with underlined text.

### Motion
Hero lines enter from 105% vertical displacement over 800ms, with the second line delayed 100ms. Introductory copy enters over 650ms after 140ms. One-time intersection reveals use threshold .12: figures scale .98 to 1 over 700ms; other selected content rises 18px over 550ms. These use the observed ease `cubic-bezier(.23,1,.32,1)`. Control press transitions last 150ms; filter colour changes 160ms; disclosure icon 180ms; arrow movement 200ms; photograph colour/scale 600ms. Fine-pointer course hover scales images 1.025 and removes greyscale. Reduced-motion disables CSS animations, transitions and smooth scrolling, and prevents JavaScript reveal observers from being created. Content remains present without animation or JavaScript.

### Course learning extension

The approved Epilogue/stone/ink/blue world now also covers four authenticated lesson pages, quiz results, pending access and access administration. This is a reading surface with working controls, not a new identity. The original home descriptions above remain scoped to that home.

**Reading tokens:** `--lesson-paper` (#f4f3f0) is the reading canvas/current step; `--lesson-panel` (#e9e8e3) groups prompts, comparison blocks, secondary actions, quiz choices and access entries; `--lesson-line` (#d1d0c8) supplies rules and progress tracks. Success uses `--success` (#25553c) on #e0eadf; errors use `--error` (#94362a) on #f4e6e0. Bordered notes/admin fields use #fffefa with #aaa99f borders and #636259 placeholders. Selected quiz choices use #dbe3f7. These extend the home palette without replacing its tokens.

**Reading hierarchy and layout:** body copy is 16px/1.7, generally capped at 70ch; introductory copy is 18px/1.65 at 64ch. Lesson headings are 40px/700/1.13 with -0.035em tracking, followed by introduction and smaller metadata. Secondary headings are 25px/500/1.25; tertiary headings are 19px/500/1.35. A 282px stone sidebar sits beside a flexible reading column, whose content is capped at 1250px and padded 42px 5vw 65px. At max-width 1050px the sidebar narrows to 235px, main padding becomes 35px 28px 55px and the heading becomes 34px. At max-width 760px the outline stacks above the content in a two-column step grid; main padding is 28px 20px 45px, heading size 30px, secondary heading 23px and introduction 16px. Access screens use a centred 780px maximum width; the administration form caps at 650px.

**Learning controls:** progress is a native 5px bar with blue fill and explicit saved step counts. Current navigation uses `aria-current="page"`; completed steps gain a blue square check marker and completion text. Lesson buttons are square, 50px minimum height with 15px 20px padding and 14px text; disabled controls use .55 opacity and suppress press transforms. Completion is an explicit action, subject to prior-step/access availability. Notes show unsaved/saved text, save to the account and warn before leaving with unsaved edits. Edits made during a save remain marked as an unsaved draft; saving an earlier version does not clear that state. Save and completion failures also appear beside their controls, preserving the entered text for retry. Native labelled inputs and vertically resizable textareas retain visible focus. The quiz uses required radio groups with fieldset/legend, blue native accents and an outlined focused choice; server responses produce scores and explanation rows, then focus the result region. A practice attempt below the passing score explicitly retains and explains any previously recorded approval. Administrative grant/revoke controls show loading, success and error text and disable submit while requests run.

**Media, motion and print:** video frames load only after the student presses the load action; an external YouTube link remains available. Frames use 16:9 on desktop and 1.4 aspect ratio on mobile. This extension adds no entrance animation; it inherits the existing control motion and reduced-motion override. Print hides navigation, sidebar, video, status and operational controls; reading content becomes a full-width white page with 11pt body, 26pt/18pt/14pt headings, complete notes mirrored as text and retained comparison blocks. Printed notes preserve line breaks, wrap long text and flow across pages without textarea clipping; empty fields read “Não preenchido.” Original material, external-video credits and preview/affiliation limits remain visible in the course content.

## Do's and Don'ts

### Do:
- **Do** use the observed Epilogue hierarchy, square controls and stone/blue assignments when extending this visual world.
- **Do** retain visible keyboard focus, native disclosures and reduced-motion support.
- **Do** identify sample content and illustrative photography honestly until actual client assets exist.

### Don't:
- **Don't** add shadows or rounded card shells to these existing flat course rows.
- **Don't** imply the stock imagery depicts the teacher or actual students.
- **Don't** present the comparison home as a confirmed final client identity.
