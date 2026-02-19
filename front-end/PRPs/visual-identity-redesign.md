# Visual Identity Redesign: Bento Grid & Pastel Edition

## Goal
Repenser l'identité visuelle de l'application AlumniConnect en adoptant une structure en **Bento Grid** et une esthétique **Pastel** haut de gamme, tout en conservant l'intégralité des fonctionnalités et de la stack technique actuelle (Angular, Tailwind CSS v4, DaisyUI v5).

## Why
L'interface actuelle, bien que fonctionnelle, manque de caractère "premium". L'adoption d'un style Bento Grid permettra une meilleure hiérarchisation de l'information, tandis que la palette pastel apportera une douceur et une modernité typiques des plateformes SaaS haut de gamme.

## What
- **Structure :** Migration des listes et dashboards vers une disposition en grille de type "Bento" (tailles de blocs variables, coins arrondis prononcés).
- **Couleurs :** Remplacement des teintes vives par une palette pastel (soft blues, mints, lavenders) pour les fonds et les accents.
- **Typographie :** Optimisation de la police **Inter** (déjà présente) avec une hiérarchie plus audacieuse (font-weights contrastés).
- **Composants :** Mise à jour des `cards`, `inputs` et `nav` pour refléter ce nouveau style.

## Technical Context

### Files to Reference (read-only)
- `src/app/core/models/profile.model.ts` - Structure des données alumni.
- `PRPs/design-system.md` - Directives actuelles de design (à faire évoluer).
- `package.json` - Vérification des versions de Tailwind et DaisyUI.

### Files to Implement/Modify
- `src/styles.css` - Mise à jour des variables CSS (couleurs pastel, radius Bento).
- `src/app/features/alumni/alumni-list/alumni-list.component.ts` - Refonte du layout en Bento Grid.
- `src/app/shared/components/alumni/alumni-card.component.ts` - Adaptation du design de la carte.
- `src/app/features/jobs/job-list/job-list.component.ts` - Alignement visuel sur le style Bento.
- `src/app/features/events/event-list/event-list.component.ts` - Alignement visuel sur le style Bento.

### Existing Patterns to Follow
- Utilisation stricte des tokens DaisyUI via les classes Tailwind.
- Respect du mode sombre (adaptation des teintes pastel pour rester lisibles sur fond sombre).

## Implementation Details

### Design Tokens (to update in `styles.css`)
- `--radius-card`: `1.5rem` (plus arrondi pour le style Bento).
- `--color-brand`: Teinte pastel (ex: `oklch(85% 0.05 200)` pour un bleu pastel).
- `--shadow-card`: `0 10px 30px -10px rgba(0,0,0,0.05)` (ombre très douce).

### Bento Layout Logic
- Utilisation de `grid-cols-1 md:grid-cols-4 lg:grid-cols-6` pour permettre des spans variables (`col-span-2`, `col-span-3`, etc.).
- Les éléments importants (ex: Stats, Featured Alumni) occupent plus d'espace que les éléments de liste standards.

## Validation Criteria

### Functional Requirements
- [ ] La navigation entre les pages fonctionne sans régression.
- [ ] Les filtres de recherche restent opérationnels.
- [ ] L'affichage des données (alumni, jobs, events) est complet.

### Technical Requirements
- [ ] Tailwind CSS v4 compile sans erreur.
- [ ] Aucune couleur "hardcoded" (utilisation des variables CSS ou tokens DaisyUI).
- [ ] Le responsive est maintenu (passage fluide de la grille Bento à une colonne sur mobile).
- [ ] Contraste suffisant pour l'accessibilité (normes WCAG sur les tons pastel).

### Testing Steps
1. Vérifier le rendu sur mobile (375px) : la grille doit s'empiler verticalement.
2. Basculer entre le mode clair et le mode sombre : les couleurs pastel doivent s'ajuster (teintes plus désaturées en sombre).
3. Naviguer de la liste Alumni vers les Jobs : la cohérence visuelle Bento doit être préservée.
