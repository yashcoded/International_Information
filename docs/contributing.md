## Contributing (Simple Version)

Think of this like **joining a group project in school**.  
Here’s how to play nicely with others.

### 1. Fork and clone

1. **Fork the repo** on GitHub: open [https://github.com/yashcoded/International_Information](https://github.com/yashcoded/International_Information), click **Fork**, and choose your account.
2. **Clone your fork** (replace `YOUR_USERNAME` with your GitHub username):

```bash
git clone https://github.com/YOUR_USERNAME/International_Information.git
cd International_Information
```

### 2. Create a branch

```bash
git checkout -b feature/my-change
```

Pick a name that says what you’re doing:

- `feature/add-weather-widget`
- `fix/trip-planner-layout`
- `test/add-playwright-cases`

### 3. Install and run

```bash
pnpm install
pnpm dev
```

Run tests:

```bash
pnpm test
```

### 4. Coding style

- Use **TypeScript** for all new code.
- Use **CSS Modules** for styles (e.g. `TripPlanner.module.css`).
- Keep functions **small and focused**.
- No secrets in code – use **`.env.local`**.

### 5. Commit messages

Use short, clear prefixes:

- `feat:` new feature
- `fix:` bug fix
- `docs:` docs only
- `test:` tests only
- `refactor:` internal change, no behavior change

Examples:

- `feat: add weather tool to agent`
- `test: add trip planner ui tests`

### 6. Open a Pull Request

Before opening:

```bash
pnpm lint
pnpm test
```

Then:

- Push your branch.
- Open a PR against `main`.
- In the PR description, explain:
  - What you changed.
  - How to test it.
  - Any screenshots for UI changes.

