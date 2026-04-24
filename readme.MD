# 🧪 TestPilot – Smart Playwright Test Orchestration Dashboard

> **Run, schedule, and analyze your Playwright end-to-end tests from a clean web UI — no terminal required.**

TestPilot is an open-source, self-hosted dashboard that transforms your Playwright test suites into an observable, shareable, and actionable engineering asset. Built for teams that want **visibility, reliability, and speed** — without relying on expensive SaaS tools.

---

## ✨ Why TestPilot?

- ✅ **Run Playwright tests from a browser** – no CLI needed  
- 🕒 **Real-time logs & live test status**  
- 📊 **Historical trends, flakiness detection & performance tracking**  
- 🖼️ **Auto-captured screenshots, videos, and trace replays** on failure  
- 🔌 **GitHub integration** – link any repo and run tests with one click  
- 🛡️ **Secure & isolated** – runs in sandboxed environments  
- 🚀 **Fast & efficient** – shared browser cache for instant execution  
- 💾 **Self-hosted & private** – your code, your data, your control  

Perfect for:
- QA Engineers & SDETs managing test suites
- Startups avoiding BrowserStack/Sauce Labs costs
- Dev teams wanting internal tooling for E2E reliability

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.x
- Git
- Playwright-compatible system (Windows, macOS, Linux)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/testpilot.git
cd testpilot
npm install
```

### 2. Pre-install Browsers (One-Time)
```bash
# Windows (Command Prompt)
set PLAYWRIGHT_BROWSERS_PATH=C:\playwright-browsers
npx playwright install chromium

# macOS / Linux
export PLAYWRIGHT_BROWSERS_PATH=~/.cache/playwright-browsers
npx playwright install chromium
```

### 3. Start the Server
```bash
npm start
```
→ Open http://localhost:8080

### 4. Run Your First Test
1. Link a GitHub repo with a Playwright test suite  
2. Click **“Run Tests”**  
3. Watch results stream in real-time  
4. Debug failures with **one-click trace replay**

---

## 🧩 Features

### 🔗 GitHub Integration
- Clone any public (or private*) repo on-demand  
- Specify branch, subdirectory, and config path  
- Validate `package.json` before install

> *Private repo support via personal access tokens (coming soon)

### ⚙️ Smart Execution Engine
- Isolated test runs with auto-cleanup  
- Shared browser cache for instant launch  
- Timeout protection & resource safety  
- `npm ci --ignore-scripts` for security

### 📈 Observability & Insights
- Pass/fail history per test  
- Duration trends & performance baselines  
- Flaky test detection (failed inconsistently)  
- Full artifact retention: screenshots, videos, traces

### 🛠️ Developer Experience
- REST API for CI/CD integration  
- Webhook support (future)  
- Docker-ready (future)

---

## 🏗️ Architecture

```
Frontend (React/Vanilla)
       ↓
Express.js Backend
       ↓
├── GitHub Cloner
├── Dependency Installer (npm ci)
├── Playwright Test Runner
├── Artifact Manager
└── MongoDB (for run history)
```

All test execution happens in **temporary, isolated workspaces** — your server stays clean and secure.

---

## 📦 Environment Variables

Create a `.env` file:

```env
PORT=3000
PLAYWRIGHT_BROWSERS_PATH=C:\\playwright-browsers  # Windows
# PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/playwright-browsers  # Linux/macOS
MONGODB_URI=mongodb://localhost:27017/testpilot  # optional
```

> 💡 On Windows, use **double backslashes** in `.env`

---

## 🛡️ Security Notes

- Never runs `npm install` — uses `npm ci --ignore-scripts`  
- All user-provided repos are cloned to temporary directories  
- Browser binaries are pre-installed and reused (no per-run download)  
- No sensitive data leaves your server

> ⚠️ For public deployments, add authentication and rate limiting.

---

## 🤝 Contributing

PRs welcome! Here’s how to help:
- Add Firefox/WebKit support
- Implement private repo auth (OAuth/GitHub App)
- Build Docker image
- Add scheduling & notifications (Slack/email)
- Improve flakiness analytics

---

## 📜 License

MIT © Muhtadi Laskar

---

## 💬 Feedback?

Built with ❤️ by a self-taught engineer who believes **your skills matter more than your degree**.

Found this useful? ⭐ Star the repo!  
Have ideas? Open an issue or reach out!

---

> **Your tests deserve visibility. Give them a cockpit.** ✈️