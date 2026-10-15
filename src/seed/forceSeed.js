import { sequelize, Course, Lesson, Badge, User, Question } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function forceSeed() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database reset');

    await Badge.bulkCreate([
      { name: 'First Steps', description: 'Complete your first lesson', image: 'badge-first-steps.png', requirement: 'Complete 1 lesson', requirementType: 'lessons_completed', requirementValue: 1, category: 'beginner', xpBonus: 10 },
      { name: '7 Day Streak', description: 'Maintain a 7-day learning streak', image: 'badge-streak.png', requirement: '7 day streak', requirementType: 'streak_days', requirementValue: 7, category: 'intermediate', xpBonus: 25 },
      { name: 'Project Builder', description: 'Complete 3 projects', image: 'badge-project-builder.png', requirement: 'Complete 3 projects', requirementType: 'projects_completed', requirementValue: 3, category: 'intermediate', xpBonus: 30 }
    ]);
    console.log('✅ Badges created');

    const courses = await Course.bulkCreate([
      { pathId: 'web-dev-fundamentals', title: 'Web Development Fundamentals', description: 'Learn HTML, CSS, and JavaScript', icon: '🌐', category: 'Web Development', difficulty: 'Beginner', order: 1 },
      { pathId: 'python-essentials', title: 'Python Essentials', description: 'Start coding with Python', icon: '🐍', category: 'Programming', difficulty: 'Beginner', order: 2 },
      { pathId: 'javascript-mastery', title: 'JavaScript Mastery', description: 'Deepen your JavaScript skills', icon: '⚡', category: 'Web Development', difficulty: 'Intermediate', order: 3 },
      { pathId: 'zero-to-developer', title: 'From Zero to Developer', description: 'Complete roadmap', icon: '🚀', category: 'Full Stack', difficulty: 'Beginner', order: 4 }
    ]);
    console.log('✅ Courses created');

    const getCourse = (pathId) => courses.find(c => c.pathId === pathId);

    const lessonData = [
      // ============ ZERO TO DEVELOPER ============
      { 
        id: 'a9564270-b532-4a87-bd66-2376b1f1fed6', 
        courseId: getCourse('zero-to-developer').id, 
        title: 'Development Environment Setup', 
        content: `# Development Environment Setup

Setting up your development environment is the **first step** to becoming a developer.

## What You'll Need

### 1. Code Editor
The most popular choice is **VS Code** (Visual Studio Code):
- Free and open-source
- Huge extension marketplace
- Built-in terminal
- Git integration

**Download:** [code.visualstudio.com](https://code.visualstudio.com)

### 2. Node.js & npm
Node.js lets you run JavaScript outside the browser.

**Check if installed:**
\\\`\\\`\\\`bash
node -v
npm -v
\\\`\\\`\\\`

### 3. Terminal Basics
Essential commands you'll use daily:
\\\`\\\`\\\`bash
ls          # List files (Mac/Linux)
dir         # List files (Windows)
cd folder   # Change directory
mkdir name  # Create folder
pwd         # Show current path
\\\`\\\`\\\`

### 4. VS Code Extensions
Install these essential extensions:
- **Prettier** - Code formatter
- **ESLint** - Code quality
- **GitLens** - Git superpowers
- **Live Server** - Preview HTML

### 5. Keyboard Shortcuts
Master these VS Code shortcuts:
| Shortcut | Action |
|----------|--------|
| Ctrl + backtick | Open terminal |
| Ctrl + P | Quick file open |
| Ctrl + Shift + P | Command palette |
| Ctrl + / | Toggle comment |

## Your First Project

\\\`\\\`\\\`bash
mkdir my-first-project
cd my-first-project
npm init -y
\\\`\\\`\\\`

This creates a package.json file for your project.

## Pro Tips
- **Learn the terminal** - It's faster than clicking
- **Use Git from day one**
- **Set up a consistent folder structure**`,
        xpValue: 10, 
        order: 1, 
        type: 'lesson' 
      },
      
      { 
        id: '03fa1637-a979-4f53-bf4b-c2cf3f6bec15', 
        courseId: getCourse('zero-to-developer').id, 
        title: 'Git and GitHub Basics', 
        content: `# Git and GitHub Basics

**Git** is a version control system. **GitHub** is a cloud platform for hosting Git repositories.

## Why Version Control?

- **Track changes** - See what changed and when
- **Collaborate** - Multiple people work on same code
- **Revert mistakes** - Go back to previous versions
- **Branch** - Work on features safely

## Essential Git Commands

### Setup (once)
\\\`\\\`\\\`bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
\\\`\\\`\\\`

### Daily Workflow
\\\`\\\`\\\`bash
git init                    # Initialize repo
git add .                   # Stage all changes
git add file.js             # Stage specific file
git commit -m "message"     # Commit with message
git push origin main        # Push to GitHub
git pull                    # Get latest changes
\\\`\\\`\\\`

### Branching
\\\`\\\`\\\`bash
git checkout -b feature-login   # Create & switch
git branch                      # List branches
git checkout main               # Switch to main
git merge feature-login         # Merge branch
\\\`\\\`\\\`

### Check Status
\\\`\\\`\\\`bash
git status          # See what's changed
git log             # See commit history
git diff            # See line-by-line changes
\\\`\\\`\\\`

## The Workflow

Working Directory → git add → Staging Area → git commit → Repository → git push → GitHub

## Common Scenarios

### Undo Last Commit (Keep Changes)
\\\`\\\`\\\`bash
git reset --soft HEAD~1
\\\`\\\`\\\`

### Discard Changes in File
\\\`\\\`\\\`bash
git checkout -- file.js
\\\`\\\`\\\`

### See Remote URL
\\\`\\\`\\\`bash
git remote -v
\\\`\\\`\\\`

## .gitignore

Never commit these:
\\\`\\\`\\\`
node_modules/
.env
*.log
.DS_Store
dist/
build/
\\\`\\\`\\\`

## Best Practices
1. **Commit often** - Small, focused commits
2. **Write clear messages** - "Fix login button" not "update"
3. **Pull before push** - Avoid conflicts
4. **Use branches** - Never commit directly to main
5. **Never commit secrets** - Use .env files`,
        xpValue: 10, 
        order: 2, 
        type: 'lesson' 
      },
      
      { 
        id: '45513aa1-a64c-4e0b-8acd-42c360f0747f', 
        courseId: getCourse('zero-to-developer').id, 
        title: 'Deploy Your First App', 
        content: `# Deploy Your First App

Deploying means making your app **publicly accessible** on the internet.

## Deployment Platforms

### For Static Sites
- **Netlify** - Best for static sites
- **Vercel** - Great for React/Next.js
- **GitHub Pages** - Free for public repos

### For Full-Stack Apps
- **Render** - Free tier available
- **Railway** - Easy deployment
- **Heroku** - Classic choice

### For Databases
- **Neon** - Serverless PostgreSQL
- **Supabase** - Open-source Firebase alternative
- **MongoDB Atlas** - Cloud MongoDB

## Deploying to Vercel (Frontend)

### 1. Install Vercel CLI
\\\`\\\`\\\`bash
npm install -g vercel
\\\`\\\`\\\`

### 2. Deploy
\\\`\\\`\\\`bash
vercel
\\\`\\\`\\\`

Follow the prompts. Your app is live in seconds!

### 3. Deploy from GitHub
- Push code to GitHub
- Go to vercel.com
- Click "Import Project"
- Select your repo
- Click Deploy

## Deploying to Render (Backend)

### 1. Create account at render.com

### 2. Create New Web Service
- Connect GitHub repo
- Select your backend repo

### 3. Configure
| Setting | Value |
|---------|-------|
| Environment | Node |
| Build Command | npm install |
| Start Command | npm start |

### 4. Add Environment Variables
\\\`\\\`\\\`
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
NODE_ENV=production
\\\`\\\`\\\`

### 5. Click "Create Web Service"

## Common Deployment Issues

### Issue: App crashes after deploy
**Cause:** Environment variables missing
**Fix:** Add all .env variables to platform

### Issue: CORS errors
**Cause:** Frontend URL not allowed
**Fix:** Add frontend URL to backend CORS config

### Issue: Database connection fails
**Cause:** Wrong DATABASE_URL or SSL
**Fix:** Add ?sslmode=require to connection string

### Issue: Build fails
**Cause:** Missing dependencies
**Fix:** Check package.json has all deps

## Post-Deployment Checklist
- [ ] App loads without errors
- [ ] Database connects
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Images/assets load
- [ ] Environment variables set
- [ ] CORS configured
- [ ] HTTPS enabled`,
        xpValue: 15, 
        order: 3, 
        type: 'lesson' 
      },
      
      { 
        id: '45b3329d-9816-48f5-bf58-41edce7eb72c', 
        courseId: getCourse('zero-to-developer').id, 
        title: 'Build a Portfolio Website', 
        content: `# Build a Portfolio Website

Your portfolio is your **digital handshake**. Make it count.

## What Recruiters Look For

1. **Real projects** you can explain
2. **Clean code** on GitHub
3. **Live demos** they can try
4. **Clear communication** in descriptions
5. **Professional presentation**

## Essential Sections

### 1. Hero Section
- Your name
- What you do (e.g., "Full-Stack Developer")
- Call-to-action button
- Your photo or avatar

### 2. About Me
- Short bio (2-3 paragraphs)
- Your skills
- What you're learning
- What you're passionate about

### 3. Projects (Most Important!)
For each project, include:
- **Title** and short description
- **Screenshot** or demo GIF
- **Tech stack** used
- **Live demo** link
- **GitHub repo** link
- **Your role** (especially if team project)
- **Problem it solves**

### 4. Skills
Categorize them:
- **Languages:** JavaScript, Python, HTML, CSS
- **Frameworks:** React, Node.js, Express
- **Tools:** Git, VS Code, Figma
- **Databases:** PostgreSQL, MongoDB

### 5. Contact
- Email
- LinkedIn
- GitHub
- Twitter

## Project Selection Criteria

**DO include:**
- 3-5 complete projects
- Projects that solve real problems
- Projects with clean code
- Projects you can talk about deeply

**DON'T include:**
- Tutorial clones (calculator, todo)
- Incomplete projects
- Projects you can't explain
- Too many projects (dilutes quality)

## Tech Stack Recommendations

### Beginner
- HTML, CSS, JavaScript
- Simple deployment (Netlify)

### Intermediate
- React or Vue
- Node.js + Express
- PostgreSQL or MongoDB

### Advanced
- Next.js or Remix
- TypeScript
- Prisma or Drizzle ORM
- TailwindCSS

## Design Tips

- **Keep it simple** - Less is more
- **Mobile-first** - Most recruiters check on phone
- **Fast loading** - Optimize images
- **Consistent colors** - Pick 2-3 primary colors
- **Readable fonts** - Sans-serif, 16px minimum
- **White space** - Let content breathe

## Deployment

\\\`\\\`\\\`bash
# Deploy to Vercel (recommended)
npm install -g vercel
vercel
\\\`\\\`\\\`

## Portfolio Checklist
- [ ] Loads in under 3 seconds
- [ ] Works on mobile
- [ ] Has 3-5 quality projects
- [ ] Each project has live demo
- [ ] Contact info is current
- [ ] No broken links
- [ ] Professional email address
- [ ] Custom domain (bonus)

## Pro Tips
1. **Update regularly** - Add new projects as you build
2. **Get feedback** - Ask developers to review
3. **Track analytics** - See what recruiters view
4. **Keep it fresh** - Redesign every 6 months`,
        xpValue: 25, 
        order: 4, 
        type: 'project' 
      },
      
      // ============ WEB DEVELOPMENT FUNDAMENTALS ============
      { 
        id: '7b9c9961-2588-4a6b-b157-2b986ad0a602', 
        courseId: getCourse('web-dev-fundamentals').id, 
        title: 'Introduction to HTML', 
        content: `# Introduction to HTML

HTML (**HyperText Markup Language**) is the **skeleton** of every website.

## What is HTML?

HTML uses **tags** to structure content. Tags tell the browser what each element is.

\\\`\\\`\\\`html
<tagname>Content goes here</tagname>
\\\`\\\`\\\`

## Basic HTML Structure

Every HTML page follows this structure:

\\\`\\\`\\\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
\\\`\\\`\\\`

## Essential HTML Tags

### Headings
\\\`\\\`\\\`html
<h1>Largest Heading</h1>
<h2>Second Largest</h2>
<h3>Third</h3>
\\\`\\\`\\\`

### Paragraphs & Text
\\\`\\\`\\\`html
<p>This is a paragraph.</p>
<strong>Bold text</strong>
<em>Italic text</em>
<br>
\\\`\\\`\\\`

### Links
\\\`\\\`\\\`html
<a href="https://google.com">Visit Google</a>
<a href="/about">About Us</a>
<a href="#section">Jump to Section</a>
\\\`\\\`\\\`

### Images
\\\`\\\`\\\`html
<img src="photo.jpg" alt="Description" width="300">
\\\`\\\`\\\`

**Always include alt text** for accessibility!

### Lists
\\\`\\\`\\\`html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>

<ol>
    <li>First</li>
    <li>Second</li>
</ol>
\\\`\\\`\\\`

## Semantic HTML

Use meaningful tags instead of generic divs:

| Tag | Purpose |
|-----|---------|
| header | Page header |
| nav | Navigation menu |
| main | Main content |
| article | Article/blog post |
| section | Section of content |
| aside | Sidebar |
| footer | Page footer |

**Example:**
\\\`\\\`\\\`html
<header>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>
</header>

<main>
    <article>
        <h1>My Blog Post</h1>
        <p>Content here...</p>
    </article>
</main>

<footer>
    <p>&copy; 2026 My Site</p>
</footer>
\\\`\\\`\\\`

## Forms

\\\`\\\`\\\`html
<form action="/submit" method="POST">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    
    <button type="submit">Submit</button>
</form>
\\\`\\\`\\\`

## Common Mistakes

❌ **Unclosed tags**
❌ **Wrong nesting**
❌ **Missing alt attributes**

## Practical Example

\\\`\\\`\\\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Portfolio</title>
</head>
<body>
    <header>
        <h1>John Doe</h1>
        <nav>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
        </nav>
    </header>
    
    <main>
        <section id="about">
            <h2>About Me</h2>
            <p>I'm a <strong>web developer</strong> learning HTML.</p>
        </section>
    </main>
    
    <footer>
        <p>Contact: <a href="mailto:john@example.com">john@example.com</a></p>
    </footer>
</body>
</html>
\\\`\\\`\\\``,
        xpValue: 10, 
        order: 1, 
        type: 'lesson' 
      },
      
      { 
        id: '8fc1266d-14bf-4db3-a048-8d1ff42754da', 
        courseId: getCourse('web-dev-fundamentals').id, 
        title: 'CSS Styling Basics', 
        content: `# CSS Styling Basics

CSS (**Cascading Style Sheets**) makes your HTML beautiful.

## Three Ways to Add CSS

### 1. Inline (avoid)
### 2. Internal (in head)
### 3. External (best practice!)

\\\`\\\`\\\`html
<link rel="stylesheet" href="styles.css">
\\\`\\\`\\\`

## CSS Syntax

\\\`\\\`\\\`css
selector {
    property: value;
}
\\\`\\\`\\\`

## Selectors

\\\`\\\`\\\`css
p { color: blue; }           /* Element */
.btn { color: blue; }         /* Class */
#header { color: blue; }      /* ID */
* { margin: 0; }              /* Universal */
\\\`\\\`\\\`

## Box Model

Every element has:
- Content
- Padding (inside)
- Border
- Margin (outside)

\\\`\\\`\\\`css
.box {
    width: 200px;
    padding: 20px;
    border: 2px solid black;
    margin: 10px;
}
\\\`\\\`\\\`

**Box sizing trick:**
\\\`\\\`\\\`css
* {
    box-sizing: border-box;
}
\\\`\\\`\\\`

## Colors

\\\`\\\`\\\`css
color: red;                    /* Named */
color: #ff0000;                /* Hex */
color: rgb(255, 0, 0);         /* RGB */
color: rgba(255, 0, 0, 0.5);   /* With opacity */
\\\`\\\`\\\`

## Layout with Flexbox

\\\`\\\`\\\`css
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}
\\\`\\\`\\\`

## Layout with Grid

\\\`\\\`\\\`css
.grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
}
\\\`\\\`\\\`

## Practical Example

\\\`\\\`\\\`css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background: #f8fafc;
}

.navbar {
    display: flex;
    justify-content: space-between;
    padding: 16px 24px;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    transition: transform 0.2s;
}

.card:hover {
    transform: translateY(-4px);
}
\\\`\\\`\\\`

## Responsive Design

\\\`\\\`\\\`css
.container {
    width: 100%;
    padding: 16px;
}

@media (min-width: 768px) {
    .container {
        max-width: 720px;
        margin: 0 auto;
    }
}
\\\`\\\`\\\`

## Best Practices

1. **External CSS** - Keep styles separate
2. **Mobile-first** - Start with mobile styles
3. **Use classes** - Not IDs for styling
4. **Consistent naming** - BEM or similar
5. **Avoid !important** - Use specificity properly`,
        xpValue: 10, 
        order: 2, 
        type: 'lesson' 
      },
      
      { 
        id: 'c1fde0ed-7f42-4659-84da-160bb22de6a6', 
        courseId: getCourse('web-dev-fundamentals').id, 
        title: 'JavaScript Fundamentals', 
        content: `# JavaScript Fundamentals

JavaScript makes your websites **interactive**.

## Variables

\\\`\\\`\\\`javascript
let name = "Alice";        // Can be reassigned
const age = 25;            // Cannot be reassigned
var old = "avoid";         // Old way, avoid using
\\\`\\\`\\\`

## Data Types

\\\`\\\`\\\`javascript
let string = "Hello";           // String
let number = 42;                // Number
let boolean = true;             // Boolean
let nothing = null;             // Null
let notDefined = undefined;     // Undefined
let array = [1, 2, 3];          // Array
let object = { name: "Alice" }; // Object
\\\`\\\`\\\`

## Operators

\\\`\\\`\\\`javascript
// Arithmetic
5 + 3   // 8
5 - 3   // 2
5 * 3   // 15
5 / 3   // 1.666...
5 % 3   // 2 (remainder)
5 ** 3  // 125 (exponent)

// Comparison
5 == "5"    // true (loose)
5 === "5"   // false (strict - USE THIS!)
\\\`\\\`\\\`

## Conditionals

\\\`\\\`\\\`javascript
const age = 18;

if (age >= 18) {
    console.log("Adult");
} else if (age >= 13) {
    console.log("Teenager");
} else {
    console.log("Child");
}

// Ternary
const status = age >= 18 ? "Adult" : "Minor";
\\\`\\\`\\\`

## Loops

\\\`\\\`\\\`javascript
// For
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// For...of (arrays)
const fruits = ["apple", "banana"];
for (const fruit of fruits) {
    console.log(fruit);
}
\\\`\\\`\\\`

## Functions

\\\`\\\`\\\`javascript
// Regular function
function greet(name) {
    return "Hello, " + name;
}

// Arrow function (modern)
const greet = (name) => "Hello, " + name;
\\\`\\\`\\\`

## Arrays

\\\`\\\`\\\`javascript
const fruits = ["apple", "banana", "orange"];

fruits[0];              // "apple"
fruits.length;          // 3
fruits.push("grape");   // Add to end
fruits.pop();           // Remove from end

// Methods (important!)
const numbers = [1, 2, 3, 4, 5];
numbers.map(n => n * 2);           // [2, 4, 6, 8, 10]
numbers.filter(n => n > 2);        // [3, 4, 5]
numbers.reduce((a, b) => a + b);   // 15
\\\`\\\`\\\`

## Objects

\\\`\\\`\\\`javascript
const person = {
    name: "Alice",
    age: 25,
    greet() {
        return "Hi, I'm " + this.name;
    }
};

person.name;         // "Alice"
person["age"];       // 25

// Destructuring
const { name, age } = person;
\\\`\\\`\\\`

## Async/Await

\\\`\\\`\\\`javascript
async function fetchData() {
    try {
        const response = await fetch("https://api.example.com/data");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
    }
}
\\\`\\\`\\\`

## Common Mistakes

❌ **Using var** - Use let/const
❌ **== instead of ===** - Always use ===
❌ **Modifying const** - Won't work
❌ **Forgetting return** - Functions return undefined

## Best Practices

1. **Use const by default**
2. **Use === always**
3. **Descriptive names**
4. **Small functions**
5. **Handle errors** - Always try/catch async`,
        xpValue: 10, 
        order: 3, 
        type: 'lesson' 
      },
      
      { 
        id: 'c2b5fb67-1622-431d-94b2-14b503528143', 
        courseId: getCourse('web-dev-fundamentals').id, 
        title: 'Build a Calculator', 
        content: `# Build a Calculator

Apply everything you've learned to build a working calculator.

## What You'll Build

A calculator with:
- Number buttons (0-9)
- Operator buttons (+, -, *, /)
- Equals button (=)
- Clear button (C)
- Display screen

## Step 1: HTML Structure

\\\`\\\`\\\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Calculator</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="calculator">
        <div class="display" id="display">0</div>
        <div class="buttons">
            <button class="clear" onclick="clearDisplay()">C</button>
            <button onclick="appendNumber('7')">7</button>
            <button onclick="appendNumber('8')">8</button>
            <button onclick="appendNumber('9')">9</button>
            <button class="operator" onclick="setOperator('/')">/</button>
            
            <button onclick="appendNumber('4')">4</button>
            <button onclick="appendNumber('5')">5</button>
            <button onclick="appendNumber('6')">6</button>
            <button class="operator" onclick="setOperator('*')">*</button>
            
            <button onclick="appendNumber('1')">1</button>
            <button onclick="appendNumber('2')">2</button>
            <button onclick="appendNumber('3')">3</button>
            <button class="operator" onclick="setOperator('-')">-</button>
            
            <button onclick="appendNumber('0')">0</button>
            <button onclick="appendNumber('.')">.</button>
            <button class="equals" onclick="calculate()">=</button>
            <button class="operator" onclick="setOperator('+')">+</button>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
\\\`\\\`\\\`

## Step 2: CSS Styling

\\\`\\\`\\\`css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: 'Segoe UI', sans-serif;
}

.calculator {
    background: #1e293b;
    border-radius: 20px;
    padding: 24px;
}

.display {
    background: #0f172a;
    color: white;
    font-size: 48px;
    text-align: right;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
}

.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

button {
    padding: 20px;
    font-size: 24px;
    border: none;
    border-radius: 12px;
    background: #334155;
    color: white;
    cursor: pointer;
}

.operator {
    background: #0ea5e9;
}

.equals {
    background: #22c55e;
}

.clear {
    background: #ef4444;
}
\\\`\\\`\\\`

## Step 3: JavaScript Logic

\\\`\\\`\\\`javascript
let display = '0';
let firstOperand = null;
let operator = null;
let waitingForSecond = false;

const displayEl = document.getElementById('display');

function updateDisplay() {
    displayEl.textContent = display;
}

function appendNumber(num) {
    if (waitingForSecond) {
        display = num;
        waitingForSecond = false;
    } else {
        display = display === '0' ? num : display + num;
    }
    updateDisplay();
}

function setOperator(op) {
    if (operator !== null) {
        calculate();
    }
    firstOperand = parseFloat(display);
    operator = op;
    waitingForSecond = true;
}

function calculate() {
    if (operator === null || waitingForSecond) return;
    
    const secondOperand = parseFloat(display);
    let result;
    
    switch (operator) {
        case '+':
            result = firstOperand + secondOperand;
            break;
        case '-':
            result = firstOperand - secondOperand;
            break;
        case '*':
            result = firstOperand * secondOperand;
            break;
        case '/':
            if (secondOperand === 0) {
                display = 'Error';
                updateDisplay();
                return;
            }
            result = firstOperand / secondOperand;
            break;
    }
    
    display = String(Math.round(result * 100000000) / 100000000);
    firstOperand = result;
    operator = null;
    waitingForSecond = true;
    updateDisplay();
}

function clearDisplay() {
    display = '0';
    firstOperand = null;
    operator = null;
    waitingForSecond = false;
    updateDisplay();
}
\\\`\\\`\\\`

## Testing Checklist
- [ ] Add: 5 + 3 = 8
- [ ] Subtract: 10 - 4 = 6
- [ ] Multiply: 6 * 7 = 42
- [ ] Divide: 20 / 4 = 5
- [ ] Division by zero shows "Error"
- [ ] Clear works

## What You've Learned

- HTML structure
- CSS Grid
- JavaScript functions
- DOM manipulation
- Event handling
- State management`,
        xpValue: 25, 
        order: 4, 
        type: 'project' 
      },
      
      // ============ JAVASCRIPT MASTERY ============
      { 
        id: '50b8d062-5112-4348-b0d6-6918467df7c9', 
        courseId: getCourse('javascript-mastery').id, 
        title: 'Advanced JavaScript', 
        content: `# Advanced JavaScript

Take your JavaScript skills to the next level.

## Closures

A closure is a function that **remembers** its outer scope.

\\\`\\\`\\\`javascript
function counter() {
    let count = 0;
    return function() {
        count++;
        return count;
    };
}

const increment = counter();
increment();  // 1
increment();  // 2
\\\`\\\`\\\`

## The this Keyword

\\\`\\\`\\\`javascript
const obj = {
    name: "Alice",
    greet: function() {
        console.log(this.name);  // "Alice"
    }
};

// Explicit binding
function greet() {
    console.log(this.name);
}
greet.call({ name: "Bob" });     // "Bob"
greet.apply({ name: "Carol" });  // "Carol"

const bound = greet.bind({ name: "Dave" });
bound();  // "Dave"
\\\`\\\`\\\`

## Promises

\\\`\\\`\\\`javascript
const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("Success!"), 1000);
});

promise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log("Done"));

// Promise.all - wait for all
Promise.all([fetchA(), fetchB()])
    .then(([a, b]) => console.log(a, b));
\\\`\\\`\\\`

## Async/Await

\\\`\\\`\\\`javascript
async function fetchUser(id) {
    try {
        const response = await fetch('/api/users/' + id);
        if (!response.ok) throw new Error("User not found");
        const user = await response.json();
        return user;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
\\\`\\\`\\\`

## Destructuring

\\\`\\\`\\\`javascript
// Object
const { name, age, city = "Unknown" } = person;

// Array
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Function params
function greet({ name, age }) {
    console.log(name + " is " + age);
}
\\\`\\\`\\\`

## Spread & Rest

\\\`\\\`\\\`javascript
// Spread
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 };

// Rest
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}
\\\`\\\`\\\`

## Map & Set

\\\`\\\`\\\`javascript
// Map - any key type
const map = new Map();
map.set("key", "value");
map.set(42, "number key");

// Set - unique values
const set = new Set([1, 2, 3, 3, 3]);
set.size;  // 3

// Remove duplicates
const unique = [...new Set([1, 1, 2, 2, 3])];  // [1, 2, 3]
\\\`\\\`\\\`

## Generators

\\\`\\\`\\\`javascript
function* idGenerator() {
    let id = 1;
    while (true) {
        yield id++;
    }
}

const gen = idGenerator();
gen.next().value;  // 1
gen.next().value;  // 2
\\\`\\\`\\\`

## Modules (ES6)

\\\`\\\`\\\`javascript
// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default class Calculator {}

// app.js
import Calculator, { PI, add } from './math.js';
\\\`\\\`\\\`

## Pro Tips

1. **Use === always**
2. **Prefer const**
3. **Template literals**
4. **Async/await over .then()**
5. **Spread for immutable updates**
6. **Optional chaining** - user?.address?.city
7. **Nullish coalescing** - value ?? defaultValue`,
        xpValue: 15, 
        order: 1, 
        type: 'lesson' 
      },
      
      { 
        id: '142552c3-7c04-4a95-a608-0d29c96c987d', 
        courseId: getCourse('javascript-mastery').id, 
        title: 'DOM Manipulation', 
        content: `# DOM Manipulation

The **DOM** (Document Object Model) is your JavaScript interface to HTML.

## Selecting Elements

\\\`\\\`\\\`javascript
const header = document.getElementById("header");
const firstBtn = document.querySelector(".btn");
const allBtns = document.querySelectorAll(".btn");

// Convert NodeList to Array
const btnArray = [...allBtns];
\\\`\\\`\\\`

## Reading & Changing Content

\\\`\\\`\\\`javascript
const el = document.querySelector("#myElement");

// Text content (safe)
el.textContent = "New text";

// HTML content (dangerous - XSS risk)
el.innerHTML = "<strong>Bold</strong>";

// Classes
el.classList.add("active");
el.classList.remove("hidden");
el.classList.toggle("open");

// Styles
el.style.color = "red";
\\\`\\\`\\\`

## Creating & Removing Elements

\\\`\\\`\\\`javascript
const div = document.createElement("div");
div.textContent = "New element";
div.className = "card";

document.body.appendChild(div);
element.remove();
\\\`\\\`\\\`

## Events

\\\`\\\`\\\`javascript
const button = document.querySelector("#myBtn");

button.addEventListener("click", (event) => {
    console.log("Clicked!");
    console.log(event.target);
});

// Once - fires only once
button.addEventListener("click", handler, { once: true });
\\\`\\\`\\\`

## Common Events

\\\`\\\`\\\`javascript
// Mouse
element.addEventListener("click", handler);
element.addEventListener("mouseenter", handler);

// Keyboard
document.addEventListener("keydown", (e) => {
    console.log(e.key);
    console.log(e.ctrlKey);
});

// Form
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
});

// Window
window.addEventListener("resize", handler);
\\\`\\\`\\\`

## Event Delegation

\\\`\\\`\\\`javascript
// One listener for all items
document.querySelector(".list").addEventListener("click", (e) => {
    if (e.target.classList.contains("item")) {
        console.log("Item clicked:", e.target.textContent);
    }
});
\\\`\\\`\\\`

## Event Bubbling

\\\`\\\`\\\`javascript
parent.addEventListener("click", () => console.log("Parent"));
child.addEventListener("click", (e) => {
    console.log("Child");
    e.stopPropagation();  // Prevent bubbling
});
\\\`\\\`\\\`

## Forms

\\\`\\\`\\\`javascript
const form = document.querySelector("#loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            window.location.href = "/dashboard";
        }
    } catch (error) {
        console.error("Login failed");
    }
});
\\\`\\\`\\\`

## Performance Tips

### 1. Cache DOM Queries
\\\`\\\`\\\`javascript
const item = document.querySelector(".item");
for (let i = 0; i < 100; i++) {
    item.style.color = "red";
}
\\\`\\\`\\\`

### 2. Use DocumentFragment
\\\`\\\`\\\`javascript
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
    const li = document.createElement("li");
    li.textContent = "Item " + i;
    fragment.appendChild(li);
}
list.appendChild(fragment);
\\\`\\\`\\\`

### 3. Debounce Events
\\\`\\\`\\\`javascript
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

window.addEventListener("scroll", debounce(() => {
    console.log("Scrolled");
}, 200));
\\\`\\\`\\\`

## Best Practices

1. **Use addEventListener** - Not inline handlers
2. **Cache selectors** - Don't query repeatedly
3. **Event delegation** - For dynamic lists
4. **Debounce/throttle** - For scroll/resize
5. **Use classes** - Not inline styles
6. **textContent over innerHTML** - XSS safety`,
        xpValue: 15, 
        order: 2, 
        type: 'lesson' 
      },
      
      { 
        id: 'afe58df5-56aa-4793-a104-d352c7fa7b82', 
        courseId: getCourse('javascript-mastery').id, 
        title: 'Build a Weather App', 
        content: `# Build a Weather App

Build a real weather app that fetches data from an API.

## What You'll Learn

- Fetching data from APIs
- Handling async operations
- Error handling
- Loading states

## Setup

### 1. Get an API Key

Sign up at [OpenWeatherMap](https://openweathermap.org/api):
1. Create free account
2. Go to API Keys section
3. Copy your key

### 2. Project Structure

\\\`\\\`\\\`
weather-app/
├── index.html
├── style.css
└── script.js
\\\`\\\`\\\`

## HTML Structure

\\\`\\\`\\\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Weather App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app">
        <h1>Weather</h1>
        
        <div class="search">
            <input type="text" id="cityInput" placeholder="Enter city...">
            <button id="searchBtn">Search</button>
        </div>
        
        <div id="loading" class="loading hidden">
            <div class="spinner"></div>
        </div>
        
        <div id="error" class="error hidden"></div>
        
        <div id="weather" class="weather hidden">
            <h2 id="cityName"></h2>
            <p id="date"></p>
            <div class="main">
                <img id="weatherIcon" src="" alt="">
                <div>
                    <span id="temperature"></span>
                    <span id="description"></span>
                </div>
            </div>
            <div class="details">
                <div>Humidity: <span id="humidity"></span></div>
                <div>Wind: <span id="wind"></span></div>
                <div>Feels Like: <span id="feelsLike"></span></div>
                <div>Pressure: <span id="pressure"></span></div>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
\\\`\\\`\\\`

## CSS Styling

\\\`\\\`\\\`css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.app {
    background: white;
    border-radius: 24px;
    padding: 32px;
    max-width: 480px;
    width: 100%;
}

.search {
    display: flex;
    gap: 12px;
    margin: 24px 0;
}

.search input {
    flex: 1;
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
}

.search button {
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
}

.hidden {
    display: none !important;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e2e8f0;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
\\\`\\\`\\\`

## JavaScript Logic

\\\`\\\`\\\`javascript
const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const weatherEl = document.getElementById('weather');

function showLoading() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    weatherEl.classList.add('hidden');
}

function hideLoading() {
    loadingEl.classList.add('hidden');
}

function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    weatherEl.classList.add('hidden');
}

async function getWeather(city) {
    if (!city.trim()) {
        showError('Please enter a city name');
        return;
    }
    
    showLoading();
    
    try {
        const url = BASE_URL + '/weather?q=' + encodeURIComponent(city) + '&appid=' + API_KEY + '&units=metric';
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) throw new Error('City not found');
            if (response.status === 401) throw new Error('Invalid API key');
            throw new Error('Failed to fetch weather');
        }
        
        const data = await response.json();
        displayWeather(data);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayWeather(data) {
    document.getElementById('cityName').textContent = data.name + ', ' + data.sys.country;
    document.getElementById('date').textContent = new Date().toLocaleDateString();
    document.getElementById('temperature').textContent = Math.round(data.main.temp) + '°C';
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('weatherIcon').src = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png';
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('wind').textContent = data.wind.speed + ' m/s';
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like) + '°C';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    
    weatherEl.classList.remove('hidden');
}

searchBtn.addEventListener('click', () => getWeather(cityInput.value));
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') getWeather(cityInput.value);
});

// Load default city
getWeather('London');
\\\`\\\`\\\`

## Common Issues & Fixes

### Issue: CORS Error
**Solution:** Use a proxy or backend server

### Issue: API Key Exposed
**Solution:** Move API calls to backend

### Issue: Rate Limited
**Solution:** Cache responses

## Testing Checklist
- [ ] Search for a city
- [ ] Invalid city shows error
- [ ] Loading spinner shows
- [ ] Weather displays correctly
- [ ] Icons load
- [ ] Mobile responsive

## What You've Learned

- Async/await and Promises
- Fetch API and HTTP requests
- Error handling
- Loading states
- DOM manipulation
- Responsive design`,
        xpValue: 25, 
        order: 3, 
        type: 'project' 
      },
      
      // ============ PYTHON ESSENTIALS ============
      { 
        id: '8a2050c3-eb06-474a-9725-9d4b465f49ce', 
        courseId: getCourse('python-essentials').id, 
        title: 'Python Introduction', 
        content: `# Python Introduction

Python is a **versatile, beginner-friendly** programming language.

## Why Python?

- **Easy to learn** - Clean, readable syntax
- **Versatile** - Web, data science, AI, automation
- **Huge community** - Tons of libraries
- **In-demand** - Top jobs require Python

## Installing Python

### Windows
1. Download from [python.org](https://python.org)
2. Check "Add Python to PATH"
3. Install

### Verify
\\\`\\\`\\\`bash
python --version
\\\`\\\`\\\`

## Your First Program

\\\`\\\`\\\`python
print("Hello, World!")
\\\`\\\`\\\`

## Variables

\\\`\\\`\\\`python
# Strings
name = "Alice"
message = 'Hello'

# Numbers
age = 25
price = 19.99

# Booleans
is_active = True

# Multiple assignment
x, y, z = 1, 2, 3

# Constants (convention)
PI = 3.14159
\\\`\\\`\\\`

## Data Types

\\\`\\\`\\\`python
text = "Hello"       # String
number = 42          # Integer
decimal = 3.14       # Float
flag = True          # Boolean
nothing = None       # None

# Check type
type(text)      # <class 'str'>
type(number)    # <class 'int'>
\\\`\\\`\\\`

## Strings

\\\`\\\`\\\`python
name = "Alice"

# f-strings (modern)
greeting = f"Hello, {name}!"
print(greeting)  # "Hello, Alice!"

# Common methods
name.upper()           # "ALICE"
name.lower()           # "alice"
name.replace("A", "E") # "Elice"
len(name)              # 5
\\\`\\\`\\\`

## Numbers

\\\`\\\`\\\`python
x = 10
y = 3

x + y      # 13
x - y      # 7
x * y      # 30
x / y      # 3.3333...
x // y     # 3 (integer division)
x % y      # 1 (remainder)
x ** y     # 1000 (exponent)
\\\`\\\`\\\`

## Input & Output

\\\`\\\`\\\`python
# Output
print("Hello")

# Input (always returns string)
name = input("Enter your name: ")
age = int(input("Enter your age: "))
\\\`\\\`\\\`

## Conditionals

\\\`\\\`\\\`python
age = 18

if age >= 18:
    print("Adult")
elif age >= 13:
    print("Teenager")
else:
    print("Child")

# Ternary
status = "Adult" if age >= 18 else "Minor"
\\\`\\\`\\\`

## Loops

\\\`\\\`\\\`python
# For loop
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# Loop through list
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)

# While loop
count = 0
while count < 5:
    print(count)
    count += 1
\\\`\\\`\\\`

## Lists

\\\`\\\`\\\`python
fruits = ["apple", "banana", "orange"]

# Access
fruits[0]      # "apple"
fruits[-1]     # "orange"

# Modify
fruits.append("grape")     # Add to end
fruits.remove("banana")    # Remove by value
fruits.sort()              # Sort in place

# List comprehension
squares = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]
\\\`\\\`\\\`

## Dictionaries

\\\`\\\`\\\`python
person = {
    "name": "Alice",
    "age": 25,
    "city": "NYC"
}

# Access
person["name"]         # "Alice"
person.get("age")      # 25
person.get("email", "")  # Default value

# Iterate
for key, value in person.items():
    print(key, value)
\\\`\\\`\\\`

## Common Mistakes

❌ **Forgetting indentation**
❌ **Mixing tabs and spaces**
❌ **Integer division confusion**
❌ **Modifying list while iterating**

## Best Practices (PEP 8)

1. **Use snake_case** - my_variable
2. **4 spaces** for indentation
3. **Descriptive names**
4. **Comments** - Use #
5. **Docstrings** - Use triple quotes`,
        xpValue: 10, 
        order: 1, 
        type: 'lesson' 
      },
      
      { 
        id: '0089ea1d-8a32-452d-b510-aa452ec10d43', 
        courseId: getCourse('python-essentials').id, 
        title: 'Python Functions', 
        content: `# Python Functions

Functions are **reusable blocks of code** that perform specific tasks.

## Why Functions?

- **DRY Principle** - Don't Repeat Yourself
- **Organization** - Break code into pieces
- **Testing** - Easier to test small units
- **Reusability** - Use same function many times

## Defining Functions

\\\`\\\`\\\`python
def greet():
    print("Hello!")

greet()  # Call it
\\\`\\\`\\\`

## Parameters & Arguments

\\\`\\\`\\\`python
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")  # "Hello, Alice!"

def add(a, b):
    return a + b

result = add(5, 3)  # 8
\\\`\\\`\\\`

## Return Values

\\\`\\\`\\\`python
def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # 8

# Return multiple values
def get_user():
    return "Alice", 25

name, age = get_user()

# No return = None
def greet(name):
    print(f"Hello, {name}")

result = greet("Alice")
print(result)  # None
\\\`\\\`\\\`

## Default Parameters

\\\`\\\`\\\`python
def greet(name="World"):
    print(f"Hello, {name}!")

greet()          # "Hello, World!"
greet("Alice")   # "Hello, Alice!"

def create_user(name, role="user", active=True):
    return {"name": name, "role": role, "active": active}

create_user("Alice")                       # Defaults
create_user("Bob", role="admin")           # Override
\\\`\\\`\\\`

## Keyword Arguments

\\\`\\\`\\\`python
def create_user(name, age, city):
    return {"name": name, "age": age, "city": city}

# Positional
create_user("Alice", 25, "NYC")

# Keyword (clearer)
create_user(name="Alice", age=25, city="NYC")
\\\`\\\`\\\`

## *args and **kwargs

\\\`\\\`\\\`python
# *args - variable positional arguments
def sum_all(*numbers):
    return sum(numbers)

sum_all(1, 2, 3)        # 6
sum_all(1, 2, 3, 4, 5)  # 15

# **kwargs - variable keyword arguments
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25, city="NYC")
\\\`\\\`\\\`

## Scope

\\\`\\\`\\\`python
global_var = "I'm global"

def my_func():
    local_var = "I'm local"
    print(global_var)  # Can access global
    print(local_var)   # Can access local

my_func()

# Modifying globals (avoid)
count = 0

def increment():
    global count
    count += 1
\\\`\\\`\\\`

## Lambda Functions

\\\`\\\`\\\`python
# Regular function
def square(x):
    return x ** 2

# Lambda equivalent
square = lambda x: x ** 2

# Common use: sort with key
users = [
    {"name": "Alice", "age": 25},
    {"name": "Bob", "age": 30}
]

users.sort(key=lambda u: u["age"])

# With map, filter
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))
\\\`\\\`\\\`

## Higher-Order Functions

\\\`\\\`\\\`python
def apply_twice(func, value):
    return func(func(value))

def add_five(x):
    return x + 5

result = apply_twice(add_five, 10)  # 20
\\\`\\\`\\\`

## Docstrings

\\\`\\\`\\\`python
def calculate_area(length, width):
    """
    Calculate the area of a rectangle.
    
    Args:
        length (float): The length
        width (float): The width
    
    Returns:
        float: The area
    """
    return length * width

help(calculate_area)
\\\`\\\`\\\`

## Type Hints

\\\`\\\`\\\`python
def greet(name: str) -> str:
    return f"Hello, {name}"

def add(a: int, b: int) -> int:
    return a + b
\\\`\\\`\\\`

## Practical Examples

### 1. Input Validation
\\\`\\\`\\\`python
def get_positive_number(prompt):
    while True:
        try:
            num = float(input(prompt))
            if num > 0:
                return num
            print("Must be positive")
        except ValueError:
            print("Invalid number")
\\\`\\\`\\\`

### 2. Data Processing
\\\`\\\`\\\`python
def process_scores(scores):
    if not scores:
        return None
    
    return {
        "count": len(scores),
        "average": sum(scores) / len(scores),
        "highest": max(scores),
        "lowest": min(scores)
    }
\\\`\\\`\\\`

## Common Mistakes

❌ **Mutable default arguments**
\\\`\\\`\\\`python
# Bad
def add_item(item, items=[]):
    items.append(item)
    return items

# Good
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
\\\`\\\`\\\`

❌ **Forgetting return**
❌ **Shadowing built-ins**

## Best Practices

1. **Single responsibility** - One job per function
2. **Descriptive names** - calculate_total not calc
3. **Keep short** - Under 20 lines ideally
4. **Use docstrings**
5. **Type hints**
6. **Pure functions** - No side effects when possible`,
        xpValue: 10, 
        order: 2, 
        type: 'lesson' 
      },
      
      { 
        id: '9e54cb2c-9741-4637-add0-a5f7e7d5e063', 
        courseId: getCourse('python-essentials').id, 
        title: 'Data Structures in Python', 
        content: `# Data Structures in Python

Python provides powerful **built-in data structures** to organize and manipulate data.

## Lists

**Ordered, mutable** collections.

\\\`\\\`\\\`python
# Create
fruits = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]

# Access
fruits[0]       # "apple"
fruits[-1]      # "orange"
fruits[1:3]     # ["banana", "orange"]

# Modify
fruits.append("grape")       # Add to end
fruits.insert(0, "kiwi")     # Insert at index
fruits.remove("banana")      # Remove by value
fruits.pop()                 # Remove & return last

# Find
fruits.index("apple")        # Index of item
"apple" in fruits            # True/False

# Sort
fruits.sort()                # In-place
sorted(fruits)               # New sorted list

# List comprehension
squares = [x**2 for x in range(5)]
evens = [x for x in range(10) if x % 2 == 0]
\\\`\\\`\\\`

## Tuples

**Ordered, immutable** collections.

\\\`\\\`\\\`python
# Create
point = (3, 5)
colors = ("red", "green", "blue")
single = (42,)  # Note the comma!

# Access
point[0]     # 3
colors[1:]   # ("green", "blue")

# Unpacking
x, y = point

# Why tuples?
# - Immutable (can't change)
# - Faster than lists
# - Can be dictionary keys
\\\`\\\`\\\`

## Dictionaries

**Key-value pairs**.

\\\`\\\`\\\`python
# Create
person = {
    "name": "Alice",
    "age": 25,
    "city": "NYC"
}

# Access
person["name"]           # "Alice"
person.get("age")        # 25
person.get("email", "")  # Default value

# Modify
person["email"] = "alice@example.com"
person.update({"age": 26})
del person["city"]

# Iterate
for key in person:
    print(key)

for key, value in person.items():
    print(f"{key}: {value}")

# Dict comprehension
squares = {x: x**2 for x in range(5)}

# Nested dicts
users = {
    "alice": {"age": 25, "role": "admin"},
    "bob": {"age": 30, "role": "user"}
}
\\\`\\\`\\\`

## Sets

**Unordered, unique** elements.

\\\`\\\`\\\`python
# Create
fruits = {"apple", "banana", "orange"}
numbers = set([1, 2, 3, 3, 3])  # {1, 2, 3}
empty = set()  # Note: {} creates dict!

# Add/Remove
fruits.add("grape")
fruits.remove("apple")
fruits.discard("nonexistent")  # No error

# Operations
a = {1, 2, 3}
b = {3, 4, 5}

a | b           # Union: {1, 2, 3, 4, 5}
a & b           # Intersection: {3}
a - b           # Difference: {1, 2}
a ^ b           # Symmetric difference

# Check
3 in a          # True

# Use cases
# - Remove duplicates
unique = list(set([1, 1, 2, 2, 3]))  # [1, 2, 3]
# - Fast membership tests
\\\`\\\`\\\`

## When to Use What

| Structure | Use When |
|-----------|----------|
| **List** | Ordered data, will change |
| **Tuple** | Fixed data, won't change |
| **Dict** | Key-value lookup |
| **Set** | Unique items, membership tests |

## Comprehensions

\\\`\\\`\\\`python
# List comprehension
squares = [x**2 for x in range(10)]
evens = [x for x in range(10) if x % 2 == 0]

# Dict comprehension
squares = {x: x**2 for x in range(5)}

# Set comprehension
evens = {x for x in range(10) if x % 2 == 0}

# Generator (lazy - memory efficient)
gen = (x**2 for x in range(1000000))
\\\`\\\`\\\`

## Practical Examples

### 1. Count Word Frequency
\\\`\\\`\\\`python
text = "the quick brown fox jumps over the lazy dog the fox"
words = text.split()

frequency = {}
for word in words:
    frequency[word] = frequency.get(word, 0) + 1

# Better with Counter
from collections import Counter
Counter(words).most_common(3)
\\\`\\\`\\\`

### 2. Group by Category
\\\`\\\`\\\`python
from collections import defaultdict

products = [
    {"name": "Laptop", "category": "Electronics"},
    {"name": "Shirt", "category": "Clothing"}
]

by_category = defaultdict(list)
for product in products:
    by_category[product["category"]].append(product["name"])
\\\`\\\`\\\`

### 3. Find Duplicates
\\\`\\\`\\\`python
def find_duplicates(items):
    seen = set()
    duplicates = set()
    for item in items:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)
    return duplicates
\\\`\\\`\\\`

### 4. Merge Dictionaries
\\\`\\\`\\\`python
# Python 3.9+
dict1 = {"a": 1, "b": 2}
dict2 = {"c": 3, "d": 4}
merged = dict1 | dict2

# Older versions
merged = {**dict1, **dict2}
\\\`\\\`\\\`

## Collections Module

\\\`\\\`\\\`python
from collections import Counter, defaultdict, deque, namedtuple

# Counter - count occurrences
Counter("hello")  # Counter({'l': 2, 'h': 1, 'e': 1, 'o': 1})

# defaultdict - auto-create missing keys
dd = defaultdict(list)
dd["fruits"].append("apple")  # No KeyError

# deque - fast append/pop from both ends
dq = deque([1, 2, 3])
dq.appendleft(0)

# namedtuple - readable tuples
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 5)
\\\`\\\`\\\`

## Common Mistakes

❌ **Modifying list while iterating**
\\\`\\\`\\\`python
# Bad
for item in list:
    if condition:
        list.remove(item)

# Good
for item in list.copy():
    if condition:
        list.remove(item)
\\\`\\\`\\\`

❌ **Using list as dict key**
❌ **Shallow copy confusion**

## Performance

| Operation | List | Dict/Set | Tuple |
|-----------|------|----------|-------|
| Index | O(1) | O(1) | O(1) |
| Search | O(n) | O(1) | O(n) |
| Insert | O(n) | O(1) | N/A |

**Rule of thumb:**
- Need fast lookup? Set/Dict
- Need ordered? List/Tuple
- Need immutable? Tuple
- Need unique? Set

## Best Practices

1. **Choose the right structure**
2. **Use comprehensions**
3. **Prefer tuples for fixed data**
4. **Use sets for membership tests**
5. **Use dict.get() for safety**
6. **Consider collections module**`,
        xpValue: 10, 
        order: 3, 
        type: 'lesson' 
      },
    ];
    await Lesson.bulkCreate(lessonData);
    console.log('✅ Lessons created with rich content');

    for (const course of courses) {
      const lessonCount = await Lesson.count({ where: { courseId: course.id } });
      const totalXp = await Lesson.sum('xpValue', { where: { courseId: course.id } });
      await course.update({ totalLessons: lessonCount, totalXp: totalXp || 0 });
    }

    const q = (lessonTitle, question, options, correctIndex, explanation, order) => {
      const lesson = lessonData.find(l => l.title === lessonTitle);
      return { lessonId: lesson.id, question, options, correctIndex, explanation, order };
    };

    await Question.bulkCreate([
      q('Development Environment Setup', 'Which keyboard shortcut opens the integrated terminal in VS Code?', ['Ctrl + T', 'Ctrl + backtick', 'Ctrl + Alt + T', 'Ctrl + Shift + T'], 1, 'Ctrl + backtick opens the integrated terminal.', 1),
      q('Development Environment Setup', 'What command checks your Node.js version?', ['node -v', 'node --check', 'npm version', 'node version'], 0, 'node -v displays the installed version.', 2),
      q('Development Environment Setup', 'Which file specifies Node version requirements?', ['.nodeversion', '.nvmrc', 'node.config', 'version.json'], 1, '.nvmrc is the standard file.', 3),
      q('Git and GitHub Basics', 'How do you commit only 1 of 3 changed files?', ['git commit -a', 'git add file then git commit', 'git commit --all', 'git push'], 1, 'Stage only that file before committing.', 1),
      q('Git and GitHub Basics', 'You committed a sensitive API key. What FIRST?', ['Delete repo', 'Revoke key and rewrite history', 'Push to GitHub', 'Ignore'], 1, 'Revoke the exposed key immediately.', 2),
      q('Git and GitHub Basics', 'What does git pull do vs git fetch?', ['Nothing', 'fetch + merge', 'Only fetch', 'Only merge'], 1, 'git pull = git fetch + git merge.', 3),
      q('Git and GitHub Basics', 'Command to create and switch to new branch?', ['git branch new', 'git checkout -b feature', 'git create', 'git switch new'], 1, 'git checkout -b creates and switches.', 4),
      q('Git and GitHub Basics', 'What file markers indicate a merge conflict?', ['[CONFLICT]', '<<<<<<< ======= >>>>>>>', '--- START ---', '{{ conflict }}'], 1, 'Git uses these markers.', 5),
      q('Deploy Your First App', 'React app deployed but styles broken. Most likely cause?', ['CSS broken', 'Base path config issue', 'Browser issue', 'Slow internet'], 1, 'Build tools need proper base path config.', 1),
      q('Deploy Your First App', 'Difference between build and deploy?', ['Nothing', 'Build compiles, deploy uploads', 'Deploy compiles', 'Same'], 1, 'Build compiles. Deploy uploads.', 2),
      q('Deploy Your First App', 'App works locally but crashes on deploy. Common cause?', ['Bad WiFi', 'Env variables not set', 'Wrong browser', 'Slow server'], 1, 'Env vars need to be set on hosting platform.', 3),
      q('Build a Portfolio Website', 'Most important element of a dev portfolio?', ['Animations', 'Real projects that show skills', 'Long bio', 'Social links'], 1, 'Recruiters care about what you built.', 1),
      q('Build a Portfolio Website', 'How many projects to showcase?', ['10-15', '3-5 high-quality projects', '1 only', 'As many as possible'], 1, 'Quality over quantity.', 2),
      q('Introduction to HTML', 'Correct semantic element for navigation?', ['<div>', '<nav>', '<menu>', '<ul>'], 1, '<nav> is semantic for navigation.', 1),
      q('Introduction to HTML', 'Correct HTML for clickable link?', ['<link>Google</link>', '<a href="url">Google</a>', '<href>Google</href>', '<url>Google</url>'], 1, '<a> tag with href creates links.', 2),
      q('Introduction to HTML', 'Which is largest heading?', ['<h6>', '<h1>', '<heading>', '<header>'], 1, '<h1> is largest heading.', 3),
      q('CSS Styling Basics', 'Selector for all elements with class "btn"?', ['#btn', '.btn', 'btn', 'button.btn'], 1, '.btn selects by class.', 1),
      q('CSS Styling Basics', 'CSS property for space INSIDE an element?', ['margin', 'padding', 'border', 'spacing'], 1, 'padding adds space inside.', 2),
      q('CSS Styling Basics', 'What does CSS stand for?', ['Creative Style', 'Cascading Style Sheets', 'Colorful Style', 'Computer Style'], 1, 'CSS = Cascading Style Sheets.', 3),
      q('CSS Styling Basics', 'Purpose of Flexbox?', ['Style fonts', 'Create flexible layouts', 'Add colors', 'Handle forms'], 1, 'Flexbox creates flexible layouts.', 4),
      q('JavaScript Fundamentals', 'What does typeof [] return?', ['array', 'object', 'list', 'undefined'], 1, 'Arrays are objects in JS.', 1),
      q('JavaScript Fundamentals', 'Result of "5" + 3?', ['8', '"53"', 'NaN', 'Error'], 1, 'String + number concatenates.', 2),
      q('JavaScript Fundamentals', 'Difference between == and ===?', ['None', '=== checks type too', '== checks type', '=== faster'], 1, '=== checks value AND type.', 3),
      q('JavaScript Fundamentals', 'What does [1,2,3].map(x => x * 2) return?', ['[1,2,3,1,2,3]', '[2,4,6]', '6', '[1,4,9]'], 1, 'map applies function to each element.', 4),
      q('Build a Calculator', 'parseInt("10px") returns?', ['10px', '10', 'NaN', 'Error'], 1, 'parseInt stops at non-numeric.', 1),
      q('Build a Calculator', 'How to handle division by zero?', ['Show Infinity', 'Check and show error', 'Ignore', 'Crash'], 1, 'Always check for division by zero.', 2),
      q('Advanced JavaScript', 'What is a closure?', ['A loop', 'Function remembering outer scope', 'CSS property', 'Array type'], 1, 'Closures remember outer scope.', 1),
      q('Advanced JavaScript', 'Purpose of Promise.all()?', ['Wait for all promises', 'Reject all', 'Run serially', 'Create promise'], 0, 'Promise.all runs in parallel.', 2),
      q('Advanced JavaScript', 'What does async keyword do?', ['Makes faster', 'Returns Promise automatically', 'Blocks execution', 'Adds timeouts'], 1, 'async functions return Promises.', 3),
      q('Advanced JavaScript', 'Difference between null and undefined?', ['None', 'null is assigned, undefined is default', 'undefined is assigned', 'null is string'], 1, 'null is intentional, undefined is default.', 4),
      q('DOM Manipulation', 'Difference between querySelector and querySelectorAll?', ['None', 'First match vs all matches', 'All vs first', 'Same'], 1, 'querySelector returns first match.', 1),
      q('DOM Manipulation', 'How to add click listener?', ['onClick', 'addEventListener', '.click()', '.on()'], 1, 'addEventListener is modern way.', 2),
      q('DOM Manipulation', 'What does innerHTML do?', ['Gets/sets HTML', 'Text only', 'Deletes', 'Copies'], 0, 'innerHTML gets/sets HTML content.', 3),
      q('DOM Manipulation', 'What is event bubbling?', ['Event goes to root', 'Event goes down', 'Event stops', 'Event loops'], 0, 'Events bubble up to ancestors.', 4),
      q('Build a Weather App', '401 error from weather API means?', ['Wrong URL', 'Invalid API key', 'No internet', 'Browser issue'], 1, '401 means unauthorized.', 1),
      q('Build a Weather App', 'Why use env variables for API keys?', ['Speed', 'Keep keys secure', 'Faster requests', 'Not needed'], 1, 'Never commit API keys.', 2),
      q('Build a Weather App', 'What does Fetch API return?', ['Data', 'A Promise', 'Array', 'Object'], 1, 'fetch returns a Promise.', 3),
      q('Python Introduction', 'Output of print(type(5))?', ['<class int>', '<class number>', 'integer', '5'], 0, 'type() returns class.', 1),
      q('Python Introduction', 'Correct way to define variable?', ['var x = 5', 'x = 5', 'let x = 5', 'int x = 5'], 1, 'Python uses dynamic typing.', 2),
      q('Python Introduction', 'Output of print(10 / 3) in Python 3?', ['3', '3.3333...', '4', 'Error'], 1, '/ always returns float.', 3),
      q('Python Introduction', 'How to create multiline string?', ['"string"', "'string'", 'Three quotes', '#string'], 2, 'Triple quotes for multiline.', 4),
      q('Python Functions', 'Correct syntax to define function?', ['function myFunc():', 'def myFunc():', 'func myFunc():', 'define myFunc():'], 1, 'Python uses def keyword.', 1),
      q('Python Functions', 'What does function return without return statement?', ['0', 'None', 'undefined', 'Error'], 1, 'Returns None by default.', 2),
      q('Python Functions', 'Purpose of *args?', ['Fixed args', 'Variable positional args', 'Keyword args', 'None'], 1, '*args accepts variable args.', 3),
      q('Data Structures in Python', 'Output of print([1,2,3] + [4,5])?', ['[1,2,3,4,5]', '[5,7,8]', 'Error', '[1,2,3,[4,5]]'], 0, '+ concatenates lists.', 1),
      q('Data Structures in Python', 'Difference between list and tuple?', ['None', 'List mutable, tuple immutable', 'Tuple mutable', 'List immutable'], 1, 'Lists can change, tuples cannot.', 2),
      q('Data Structures in Python', 'How to add element to end of list?', ['list.add()', 'list.append()', 'list.push()', 'list.insert()'], 1, 'append() adds to end.', 3),
      q('Data Structures in Python', 'What does {"name": "Alice"} create?', ['List', 'Tuple', 'Dictionary', 'String'], 2, 'Curly braces create dict.', 4),
      q('Data Structures in Python', 'How to access "name" in dict d?', ['d.name', 'd["name"]', 'd(name)', 'd->name'], 1, 'Use square brackets.', 5),
    ]);

    console.log('✅ 50 Real Practical Questions created');

    const hashedPassword = await bcrypt.hash('test123', 10);
    await User.create({ email: 'alex@codepath.com', username: 'Alex', password: hashedPassword, level: 20, totalXp: 820, streak: 7, avatar: 'alex-avatar.png', bio: 'Passionate developer', lastActivity: new Date() });
    console.log('✅ Test user created');

    console.log('🎉 Database seeded! Test user: alex@codepath.com / test123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

forceSeed();