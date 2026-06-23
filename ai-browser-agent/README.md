# AI Browser Agent

A production-quality desktop application for AI-powered browser automation — built for personal productivity and learning.

Automate legitimate browser workflows, understand visible content, generate structured study materials, and export results — all while respecting authentication, user permissions, and security best practices.

---

## Features

- **Natural Language Task Execution** — describe what you want in plain English; Claude converts it into browser actions
- **Study Mode** — generate summaries, flashcards, quizzes, revision notes, Mermaid diagrams, and more from any web page
- **General AI Mode** — summarize, extract tables, draft emails, create checklists
- **Session Management** — save and restore browsing sessions with full task history
- **Bookmarks & Templates** — reusable workflows for SAP PRESS, LinkedIn Learning, Jira, and more
- **Export** — Markdown, PDF, JSON
- **Security-first** — credentials never logged, displayed, or exported; MFA/captcha always paused for user
- **Action Approval** — manual, semi-automatic, or automatic approval modes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Electron |
| UI | React + TypeScript + TailwindCSS |
| Browser Automation | Playwright |
| AI | Anthropic Claude API |
| Database | SQLite via Prisma |
| State | Zustand |
| Validation | Zod |
| Exports | Markdown, PDFKit, JSON |

---

## Architecture

```
ai-browser-agent/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts             # App entry point
│   │   ├── preload.ts           # Secure IPC bridge
│   │   ├── ipc/                 # IPC channel handlers
│   │   │   ├── browser.handlers.ts
│   │   │   ├── ai.handlers.ts
│   │   │   ├── database.handlers.ts
│   │   │   ├── settings.handlers.ts
│   │   │   ├── export.handlers.ts
│   │   │   └── env.handlers.ts
│   │   └── services/
│   │       ├── browser.service.ts   # Playwright wrapper
│   │       ├── database.service.ts  # Prisma + SQLite
│   │       └── settings.service.ts  # App settings
│   ├── renderer/                # React UI
│   │   ├── components/
│   │   │   ├── layout/          # AppLayout, BottomPanel
│   │   │   ├── toolbar/         # TopToolbar
│   │   │   ├── browser/         # BrowserView, TaskInput, StudyModePanel
│   │   │   ├── sidebar/         # Left (sessions/bookmarks/templates/history)
│   │   │   │                      Right (AI output)
│   │   │   ├── ai/              # AiOutputPanel (markdown renderer)
│   │   │   ├── settings/        # SettingsModal
│   │   │   └── common/          # MfaAlert, ActionApprovalModal, ExportMenu, Toaster
│   │   ├── store/               # Zustand global state
│   │   ├── hooks/               # useElectron, useAutomation
│   │   └── styles/              # TailwindCSS
│   ├── ai/                      # AI engine
│   │   ├── claude-client.ts     # Anthropic SDK wrapper
│   │   ├── task-interpreter.ts  # NL → browser actions
│   │   ├── study-mode.ts        # Study material generation
│   │   └── prompt-builder.ts    # System prompts and user prompts
│   ├── automation/
│   │   └── extractors/
│   │       └── content.extractor.ts  # DOM + text extraction
│   ├── exports/
│   │   ├── markdown.exporter.ts
│   │   ├── pdf.exporter.ts
│   │   └── json.exporter.ts
│   ├── plugins/                 # Site-specific adapters
│   │   ├── base-plugin.ts
│   │   ├── plugin-registry.ts
│   │   └── adapters/
│   │       ├── sap-press.plugin.ts
│   │       └── linkedin-learning.plugin.ts
│   └── shared/
│       ├── types/index.ts       # Shared TypeScript types + Zod schemas
│       └── utils/
│           ├── logger.ts        # Credential-safe logger
│           └── cn.ts            # Tailwind class merger
├── prisma/
│   └── schema.prisma            # SQLite schema
├── tests/
│   ├── unit/                    # Jest unit tests
│   └── e2e/                     # Playwright e2e tests
├── .env.example                 # Environment variable template
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-browser-agent

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Copy and configure environment
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional — pre-fill the URL input
WEBSITE_URL=https://your-site.com

# Optional — only used if user explicitly enables auto-login in the UI
LOGIN_USERNAME=
LOGIN_EMAIL=
LOGIN_PASSWORD=

# Optional — override defaults
HEADLESS_MODE=false
CLAUDE_MODEL=claude-opus-4-8
AUTOMATION_SPEED_MS=500
EXPORT_DIR=./exports
```

**Security rules:**
- `.env` is in `.gitignore` — never committed
- Credentials are **never** logged, displayed, or exported
- The API key is only accessed in the main process
- Only non-sensitive config is sent to the renderer

---

## Running Locally

```bash
# Development (hot reload)
npm run dev

# In another terminal, launch Electron
npm run electron

# Or build and run
npm start
```

---

## Building for Distribution

```bash
npm run build
npx electron-builder
# Output → release/
```

---

## Usage

### Basic Workflow

1. Enter a URL in the top toolbar and click **Go**
2. The browser launches (visible or headless per settings)
3. If the site requires login, authenticate manually in the browser window (or enable auto-login)
4. In the **Task Input** at the bottom of the browser view, describe what you want

### Example Natural Language Tasks

```
Open My Library. Search for "ABAP RESTful Application Programming Model".
Open the first result. Read Chapter 1. Summarize every section.
Create flashcards. Export Markdown.
```

```
Navigate to the invoices section. Find the latest invoice. Extract the table data.
```

```
Open the current sprint in Jira. List all in-progress tickets with their assignees.
Generate a status report.
```

### Study Mode

1. Navigate to the page you want to study
2. Click the **Study Mode** tab in the task input
3. Select which outputs to generate (summary, flashcards, quiz, etc.)
4. Click **Generate**
5. Review in the right AI panel and export

### Approval Modes

| Mode | Behavior |
|------|---------|
| Manual | Every action requires your approval |
| Semi-Auto | Only high-risk actions (form submits, downloads) require approval |
| Automatic | Read-only navigation and extraction proceed without prompts |

### MFA & Captcha

When multi-factor authentication or a captcha is detected, automation **automatically pauses** and displays an alert. Complete the challenge in the browser window, then click **Continue Automation**.

---

## Task Templates

Built-in templates are available in the left sidebar under **Templates**:

| Template | Description |
|---------|-------------|
| SAP PRESS Study | Open library → read chapter → generate notes → export |
| LinkedIn Learning | Open course → extract transcript → summarize → quiz |
| Jira Sprint Report | Open sprint → extract tickets → generate report |

---

## Export Formats

| Format | Contents |
|--------|---------|
| Markdown | Full AI output with metadata header |
| PDF | Formatted PDF document |
| JSON | Structured data with all summaries, flashcards, quiz items |

Exports are saved to the configured export directory (default: `./exports`).

---

## Plugin System

Site-specific plugins provide optimised extraction for specific platforms. Current plugins:

- **SAP PRESS** — e-library reader
- **LinkedIn Learning** — course transcript extraction

To add a new plugin, extend `BasePlugin` and register it in `plugin-registry.ts`.

---

## Tests

```bash
# Unit tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e

# Type checking
npm run typecheck
```

---

## Security Design

- **No arbitrary code execution** — Claude only produces validated browser action types
- **Action validation** — all AI-generated actions are validated with Zod before execution
- **No credential exposure** — credentials are read from `.env` in the main process only; renderer never sees them
- **No bypassing of auth** — MFA, captcha, paywalls, and access controls are always respected
- **Destructive action confirmation** — form submits, downloads, and high-risk actions require user approval
- **Only visible content** — extraction operates only on DOM-visible content, never hidden data

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `ANTHROPIC_API_KEY is not set` | Add key to `.env` file |
| Browser doesn't launch | Ensure Playwright browsers are installed: `npx playwright install chromium` |
| Database errors | Run `npm run db:migrate` to apply migrations |
| Prisma client not found | Run `npm run db:generate` |
| MFA loop | Complete authentication in the browser window, then click Continue |
| Export directory missing | The app creates it automatically; check the path in Settings |

---

## Contributing

This project follows clean architecture principles:

- **UI** is fully separated from business logic
- **Services** are injectable singletons
- **Types** are shared between main and renderer via `src/shared/`
- **Plugins** are independently testable
- **No credentials** in code, logs, or exports — ever

---

## License

MIT — for personal productivity and educational use.

> This application is designed solely for automating tasks on websites you have legitimate permission to access. Always respect website terms of service, rate limits, and access controls.
