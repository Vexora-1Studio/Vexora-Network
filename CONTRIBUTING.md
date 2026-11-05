# Contributing to VEXORA NETWORK

Thank you for your interest in contributing to **VEXORA NETWORK**! We welcome bug reports, feature proposals, and pull requests to help make this the premier gaming and community platform.

---

## 🚀 Getting Started

1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/vexora-network.git
   cd vexora-network
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Setup Environment**:
   ```bash
   cp .env.example .env
   ```
5. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🛠️ Development Guidelines

- **Branching**: Create a feature branch with a descriptive name:
  ```bash
  git checkout -b feat/your-feature-name
  # or
  git checkout -b fix/issue-description
  ```
- **Type Safety**: Use TypeScript. Verify there are no type errors:
  ```bash
  npm run lint
  ```
- **Building**: Ensure production build succeeds before committing:
  ```bash
  npm run build
  ```
- **Styling**: Use Tailwind CSS classes. Follow the futuristic cyberpunk dark theme (cyan `#00f2fe`, electric blue, deep navy, gold badges).

---

## 📬 Submitting a Pull Request

1. Push your branch to your GitHub fork:
   ```bash
   git push -u origin feat/your-feature-name
   ```
2. Open a Pull Request against the `main` branch.
3. Fill in the provided PR template with details of your changes and test results.
4. Await review from project maintainers.

Thank you for helping build VEXORA NETWORK! ⚡
