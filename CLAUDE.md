# CLAUDE.md

This file provides guidance to AI assistants (Claude and others) working in this repository.

---

## Repository Overview

- **Repository**: `mstojanovickg/doc`
- **Purpose**: Documentation repository (currently being initialized)
- **Status**: New repository — no prior commits or source files exist yet

---

## Repository Structure

As this repository is in its initial state, the structure will be established as content is added. Update this section when a layout is introduced.

Suggested structure for a documentation-focused repo:

```
/
├── CLAUDE.md          # AI assistant guidance (this file)
├── README.md          # Human-facing project overview
├── docs/              # Documentation source files
│   ├── guides/        # How-to guides
│   ├── reference/     # API / technical reference
│   └── tutorials/     # Step-by-step tutorials
└── .github/           # GitHub-specific config (workflows, templates)
```

---

## Development Workflows

### Branching Strategy

- **Main branch**: `main` (or `master`) — protected; never commit directly
- **Feature branches**: `feature/<short-description>`
- **Bug-fix branches**: `fix/<short-description>`
- **AI-session branches**: `claude/<task-slug>-<session-id>` (auto-created per session)

### Making Changes

1. Always develop on the designated branch for the current session
2. Keep commits small and focused; one logical change per commit
3. Write descriptive commit messages (see convention below)
4. Push to `origin/<branch>` when work is complete

### Commit Message Convention

Use the **imperative mood** and keep the subject line under 72 characters:

```
<type>: <short summary>

[Optional body — explain the why, not the what]
```

Types:
| Type       | When to use                              |
|------------|------------------------------------------|
| `feat`     | New content or feature                   |
| `fix`      | Corrections or bug fixes                 |
| `docs`     | Documentation-only changes               |
| `refactor` | Restructuring without behavior change    |
| `chore`    | Tooling, config, dependency updates      |

Example:
```
docs: add getting-started guide for new contributors
```

### Pull Requests

- Open a PR from your feature branch into `main`
- Include a clear description of what changed and why
- Link any related issues with `Closes #<issue-number>`

---

## Key Conventions for AI Assistants

### General Principles

1. **Read before editing** — always read existing files before modifying them
2. **Minimal footprint** — make only the changes required by the task; avoid scope creep
3. **No unnecessary files** — do not create boilerplate, READMEs, or docs unless explicitly requested
4. **Security first** — never commit secrets, credentials, or sensitive data
5. **Prefer editing over creating** — update existing files rather than creating new ones

### Git Operations

- Develop on the session branch specified in the task context (`claude/...`)
- Use `git push -u origin <branch>` for the initial push
- Retry on network failures with exponential backoff: 2 s → 4 s → 8 s → 16 s
- Never force-push to `main`/`master`
- Never skip commit hooks (`--no-verify`)

### File Operations

| Task                | Preferred tool  |
|---------------------|-----------------|
| Read a file         | `Read`          |
| Edit a file         | `Edit`          |
| Create a new file   | `Write`         |
| Search for files    | `Glob`          |
| Search file content | `Grep`          |
| Run shell commands  | `Bash` (last resort) |

### Code Quality

- Do not add comments, docstrings, or type annotations to code you did not change
- Do not add error handling for scenarios that cannot happen
- Do not add features, abstractions, or helpers beyond what is needed
- Trust framework guarantees; only validate at external boundaries

---

## Working with This Repository

Since this repository is currently empty, the first tasks will likely involve:

1. Establishing a `README.md`
2. Setting up a directory structure
3. Adding initial documentation content

When those are in place, update the **Repository Structure** and **Development Workflows** sections of this file to reflect the actual state.

---

## Updating This File

Keep this file current as the project evolves:

- Add new top-level directories to the structure diagram
- Document any build, lint, or test commands once tooling is introduced
- Record project-specific conventions that differ from the defaults above
- Remove placeholder sections once real content replaces them
