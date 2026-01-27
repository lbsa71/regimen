# Contributing to regimen

Thank you for your interest in contributing to regimen! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

regimen is a combined frontend + backend Node/TypeScript/React application. Before contributing, please familiarize yourself with:

- The [README.md](README.md) for project overview and core concepts
- The project's philosophy of simplicity and consistency over complexity

---

## Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Docker (for containerized development/testing)
- A Google OAuth client ID (for authentication testing)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/regimen.git
   cd regimen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root with the required configuration:
   - Google OAuth credentials
   - Any other environment-specific settings

4. **Run the development server**
   ```bash
   npm run dev
   ```

### Docker Development

To test the containerized version:

```bash
docker build -t regimen:local .
docker run -p 3000:3000 -v /path/to/data:/data regimen:local
```

---

## Code Style

### TypeScript

- Use TypeScript for all new code (both frontend and backend)
- Enable strict mode in TypeScript configuration
- Prefer explicit type annotations for function parameters and return types
- Avoid using `any` type; use `unknown` or proper typing instead

### React (Frontend)

- Use functional components with hooks
- Keep components small and focused on a single responsibility
- Co-locate related files (component, styles, tests)

### Node.js (Backend)

- Use async/await for asynchronous operations
- Handle errors explicitly with try/catch blocks
- Keep API endpoints RESTful and intuitive

### General Guidelines

- Use meaningful variable and function names
- Keep functions small and focused
- Add comments only when the code's intent is not obvious
- Avoid premature optimization
- Follow the existing patterns in the codebase

---

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation changes
- `refactor/description` - for code refactoring

### Commit Messages

Write clear, concise commit messages:
- Use the imperative mood ("Add feature" not "Added feature")
- Keep the subject line under 50 characters
- Add a blank line before the body if more detail is needed
- Reference issues when applicable

Example:
```
Add weight conversion display

Show both kg and lbs values when entering weight.
This improves usability for users familiar with either unit.

Fixes #123
```

### Testing

- Write tests for new features and bug fixes
- Ensure existing tests pass before submitting a PR
- Test both frontend and backend changes appropriately

---

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Keep changes focused and atomic
   - Follow the code style guidelines
   - Add or update tests as needed

3. **Test your changes**
   - Run the test suite
   - Test manually in the browser
   - Verify Docker build if applicable

4. **Push and create a PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

5. **PR Description**
   - Clearly describe what the PR does
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

6. **Review Process**
   - PRs require review before merging
   - Address feedback promptly
   - Keep discussions focused and constructive

7. **Merging**
   - Squash commits if the history is messy
   - Ensure CI passes before merging
   - Delete the branch after merging

---

## Reporting Issues

### Bug Reports

When reporting bugs, please include:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser/environment information
- Screenshots if applicable

### Feature Requests

For feature requests:
- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider how it fits with the project's philosophy of simplicity

---

## Philosophy Reminder

When contributing, remember that regimen intentionally avoids complexity. Features should prioritize:

- **Simplicity** over configurability
- **Consistency** over optimization
- **Showing up** over perfect tracking

If a proposed change adds significant complexity, it may not align with the project's goals. When in doubt, open an issue to discuss before implementing.

---

## Questions?

If you have questions about contributing, feel free to open an issue or reach out to the maintainers.

Thank you for contributing to regimen!
