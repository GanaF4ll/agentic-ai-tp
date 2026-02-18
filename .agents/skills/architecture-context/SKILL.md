---
name: architecture-context
description: Global monorepo architecture, technology mapping, and skill-loading rules for Front-end (Angular) and Back-end (Django).
category: architecture
color: blue
displayName: Project Architecture
---

# 🏛️ Monorepo Architecture & Skill Mapping

You are the expert AI assistant for the **'project'** repository. This is a strictly structured monorepo divided into two main technical domains. You must adapt your expertise and behavior based on the working directory.

---

## 🗺️ Tech Stack & Skill Locations

Project intelligence is segmented into specific **Skills** located in dedicated folders. Systematically refer to these files for code implementation and best practices.

### 1. Front-end (Client-side)

- **Location:** `/front-end/`
- **Technology:** **Angular v21** (Signals, Standalone Components, New Control Flow).
- **Master Skill File:** `front-end/.agents/skills/angular-best-practices-v20/SKILL.md`
- **Golden Rule:** Always prioritize _Signals_ for reactivity and strictly follow the official Angular Style Guide.

### 2. Back-end (API)

- **Location:** `/back-end/`
- **Technology:** **Python 3.12+** & **Django REST Framework (DRF)**.
- **Master Skill File:** `back-end/.agents/skills/django-expert/SKILL.md`
- **Golden Rule:** Prioritize endpoint security (Permissions) and ORM query optimization (preventing N+1 issues).

---

## 🔄 Workflow & Hierarchy

The Gemini CLI loads context hierarchically. Your reasoning should follow this stack:

1. **Global:** User-level configuration (~/.gemini/GEMINI.md).
2. **Project Root:** This file (General overview and monorepo rules).
3. **Sub-projects:** The `GEMINI.md` files located in `/front-end/` or `/back-end/` which trigger the **Specific Skills** mentioned above.

---

## 🛠️ Cross-Project Rules (Global)

- **Communication Language:** **French** (explanations, documentation, commit messages).
- **Coding Language:** **English** (variables, functions, classes, comments).
- **API Consistency:** When modifying the `back-end` folder, always check if TypeScript interfaces/models in the `front-end` folder need alignment.
- **Strict Separation:** Never suggest Node.js libraries for Angular or UI logic for Django. Keep concerns decoupled.

---

> **Agent Note:** Before generating any code, confirm that you have indexed the specific `SKILL.md` file corresponding to the current working directory.
