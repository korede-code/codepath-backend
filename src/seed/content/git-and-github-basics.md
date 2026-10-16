# Git and GitHub Basics

**Git** is a version control system. **GitHub** is a cloud platform for hosting Git repositories.

## Why Version Control?

- **Track changes** — see what changed and when
- **Collaborate** — multiple people work on same code
- **Revert mistakes** — go back to previous versions
- **Branch** — work on features safely

## Essential Git Commands

### Setup (once)

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### Daily Workflow

```bash
git init                    # Initialize repo
git add .                   # Stage all changes
git add file.js             # Stage specific file
git commit -m "message"     # Commit with message
git push origin main        # Push to GitHub
git pull                    # Get latest changes
```

### Branching

```bash
git checkout -b feature-login   # Create & switch
git branch                      # List branches
git checkout main               # Switch to main
git merge feature-login         # Merge branch
```

### Check Status

```bash
git status          # See what's changed
git log             # See commit history
git diff            # See line-by-line changes
```

## The Workflow

```
Working Directory → git add → Staging Area → git commit → Repository → git push → GitHub
```

## Common Scenarios

### Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

### Discard Changes in File

```bash
git checkout -- file.js
```

### See Remote URL

```bash
git remote -v
```

## .gitignore

Never commit these:

```
node_modules/
.env
*.log
.DS_Store
dist/
build/
```

## Best Practices

1. **Commit often** — small, focused commits
2. **Write clear messages** — "Fix login button" not "update"
3. **Pull before push** — avoid conflicts
4. **Use branches** — never commit directly to main
5. **Never commit secrets** — use .env files