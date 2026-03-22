# Servcy — One For All Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FServcy%2FClient)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](./LICENSE.txt)

[Servcy](https://servcy.com) is an all-in-one project management platform that unifies issue tracking, time tracking, analytics, rich documentation, and third-party integrations in a single workspace.

> Servcy is still in its early days — not everything will be perfect yet. Please report bugs, ideas, and suggestions via [GitHub Issues](https://github.com/Servcy/Client/issues).

The easiest way to get started is by creating a [Servcy Cloud](https://web.servcy.com) account. Self-hosting is also supported under the AGPL-3.0 license.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Integrations](#integrations)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## Features

### Project Management
- **Issues** — Create, triage, and track issues with rich metadata (states, labels, estimates, assignees, priorities).
- **Cycles** — Sprint-style time-boxed iterations with progress tracking and archiving.
- **Modules** — Group related issues into deliverable modules with dedicated views.
- **Draft Issues** — Save work-in-progress issues before publishing to the team.
- **Archives** — Archive completed cycles, modules, and issues without deleting them.

### Views & Analytics
- **Workspace Views** — Cross-project issue views filterable by any combination of metadata.
- **Project Views** — Saved filters scoped to a single project.
- **Active Cycles** — Workspace-wide overview of all running sprints.
- **Analytics** — Built-in charts (bar, line, pie, calendar, scatter, Marimekko) powered by Nivo for scope, demand, and custom analysis.
- **Gantt Charts** — Timeline view for issues and modules.

### Time Tracking
- Per-issue timer (start / stop / update / delete).
- Timesheet views with configurable date ranges and filters.
- Member-wise time-logged and estimate summaries at the project level.
- Snapshot uploads per time entry.

### Pages & Documents
- Rich-text and document editor packages (`@servcy/rich-text-editor`, `@servcy/lite-text-editor`, `@servcy/document-editor`) built on top of TipTap.
- Markdown support with `react-markdown`.

### AI Assistant
- GPT-powered assistant per project for prompt-driven task generation and content suggestions.

### Notifications & Inbox
- Real-time notification inbox with read/unread management.
- Configurable notification types per integration event.

### Billing & Subscriptions
- Workspace subscription management (view plan, pause, or cancel).

### Authentication
- Email/password sign-in and sign-up with OTP support.
- OAuth: Google SSO, Microsoft SSO.
- Onboarding flow for new workspaces.

### Integrations
OAuth-based connections with granular event controls:

| Integration | Configuration |
|---|---|
| GitHub | Install Servcy GitHub App |
| Google | OAuth scope-based |
| Microsoft | Azure AD OAuth |
| Slack | Team & channel selection |
| Figma | OAuth |
| Notion | OAuth |
| Asana | OAuth |
| Jira | OAuth |
| Trello | OAuth |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | TypeScript 4.7 |
| State Management | [MobX 6](https://mobx.js.org) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) + Ant Design + MUI |
| Charts | [@nivo](https://nivo.rocks) |
| Rich Text | TipTap (custom editor packages) |
| Data Fetching | Axios + SWR |
| Forms | React Hook Form |
| Drag & Drop | @hello-pangea/dnd |
| Analytics / Observability | PostHog, Microsoft Clarity |
| Support Chat | Crisp |
| PWA | next-pwa |
| Monorepo | [Turborepo](https://turbo.build) + Yarn Workspaces |

---

## Repository Structure

```
servcy-fe/
├── web/                        # Next.js application
│   ├── app/                    # App Router pages
│   │   ├── [workspaceSlug]/    # Workspace-scoped routes
│   │   │   ├── projects/       # Project management
│   │   │   ├── analytics/      # Analytics dashboards
│   │   │   ├── active-cycles/  # Active sprint overview
│   │   │   ├── workspace-views/# Cross-project views
│   │   │   ├── time-tracker/   # Timesheet views
│   │   │   ├── settings/       # Workspace settings
│   │   │   └── profile/        # Member profiles
│   │   ├── integrations/       # OAuth integration callbacks
│   │   ├── inbox/              # Notification inbox
│   │   ├── profile/            # User profile & preferences
│   │   ├── onboarding/         # New workspace onboarding
│   │   └── login/              # Authentication screens
│   ├── components/             # Feature-level UI components
│   ├── services/               # API service classes
│   ├── store/                  # MobX stores
│   ├── hooks/                  # Custom React hooks
│   ├── helpers/                # Utility functions
│   ├── contexts/               # React contexts
│   └── wrappers/               # Higher-order component wrappers
├── packages/
│   ├── ui/                     # Shared UI component library (@servcy/ui)
│   ├── types/                  # Shared TypeScript type definitions (@servcy/types)
│   ├── editor/
│   │   ├── core/               # Editor core primitives
│   │   ├── document-editor/    # Full document editor (@servcy/document-editor)
│   │   ├── rich-text-editor/   # Rich text editor (@servcy/rich-text-editor)
│   │   └── lite-text-editor/   # Lightweight inline editor (@servcy/lite-text-editor)
│   ├── eslint-config-custom/   # Shared ESLint config
│   ├── tailwind-config-custom/ # Shared Tailwind config
│   └── tsconfig/               # Shared TypeScript config
└── turbo.json                  # Turborepo pipeline config
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [Yarn](https://classic.yarnpkg.com) 1.22+

### Install dependencies

```bash
npm i -g yarn
yarn install
```

### Configure environment variables

Copy the example below into `web/.env.local` and fill in the values (see [Environment Variables](#environment-variables)):

```bash
cp web/.env.example web/.env.local
```

### Start the development server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

All variables are prefixed with `NEXT_PUBLIC_` and are required at build time.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | Backend API base URL |
| `NEXT_PUBLIC_CLIENT_URL` | Frontend base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID (sign-in) |
| `NEXT_PUBLIC_GOOGLE_SSO_CLIENT_ID` | Google SSO client ID (workspace SSO) |
| `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` | Microsoft OAuth client ID |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `NEXT_PUBLIC_SLACK_CLIENT_ID` | Slack OAuth App client ID |
| `NEXT_PUBLIC_FIGMA_CLIENT_ID` | Figma OAuth App client ID |
| `NEXT_PUBLIC_NOTION_CLIENT_ID` | Notion OAuth App client ID |
| `NEXT_PUBLIC_ASANA_CLIENT_ID` | Asana OAuth App client ID |
| `NEXT_PUBLIC_JIRA_CLIENT_ID` | Jira OAuth App client ID |
| `NEXT_PUBLIC_TRELLO_CLIENT_ID` | Trello OAuth App client ID |
| `NEXT_PUBLIC_POSTHOG_ID` | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingestion host |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project ID |
| `NEXT_PUBLIC_CRISP_ID` | Crisp chat website ID |

---

## Available Scripts

Run from the repository root:

| Command | Description |
|---|---|
| `yarn dev` | Start all packages in development mode |
| `yarn build` | Production build of all packages |
| `yarn start` | Start the production server |
| `yarn lint` | Run ESLint across all packages |
| `yarn format` | Format all `.ts`, `.tsx`, and `.md` files with Prettier |
| `yarn clean` | Remove all build artifacts and `node_modules` |

---

## Integrations

Integrations are configured via OAuth. Each integration supports per-event configuration (enable / disable individual notification types). The OAuth flow lives at `/integrations/[slug]/oauth` and redirects back to the integrations page after connecting.

Supported integrations: **GitHub**, **Google**, **Microsoft**, **Slack**, **Figma**, **Notion**, **Asana**, **Jira**, **Trello**.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a pull request.

Key guidelines:
- Search [existing issues](https://github.com/Servcy/Client/issues) before opening a new one.
- All features and bug fixes must include tests.
- Follow the ESLint + Prettier configuration already in place.
- Submit an issue with your proposal before implementing a new feature.

---

## Security

If you discover a security vulnerability, please **do not open a public issue**. Email [contact@servcy.com](mailto:contact@servcy.com) to disclose it responsibly. See [SECURITY.md](./SECURITY.md) for more details.

---

## Community

- Discussions: [GitHub Discussions](https://github.com/Servcy/Client/discussions)
- Issues: [GitHub Issues](https://github.com/Servcy/Client/issues)
- Code of Conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

---

## License

Licensed under the [GNU Affero General Public License v3.0](./LICENSE.txt).
