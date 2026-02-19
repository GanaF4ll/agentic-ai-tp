# Visual Identity Redesign: Bento Grid & Warm Vibes Edition

## Goal
Repenser l'identité visuelle de l'application AlumniConnect en adoptant une structure en **Bento Grid** et une esthétique **chaleureuse et moderne**, tout en conservant l'intégralité des fonctionnalités et de la stack technique actuelle (Angular, Tailwind CSS v4, DaisyUI v5).

## Why
L'interface actuelle donne une impression **trop clinique et froide** ("médecin") à cause de sa combinaison blanc pur + bleu désaturé. La typographie Inter, bien que lisible, manque de personnalité. L'objectif est d'apporter de la chaleur, de la vie et un sentiment de communauté humaine — sans sacrifier le professionnalisme.

**Ce qu'il faut éviter :**
- Blanc pur (`#ffffff`) comme fond principal → trop stérile, trop hôpital.
- Bleu froid ou teal désaturé comme couleur primaire → trop médical / institutionnel.
- Inter Regular comme seule police → trop neutre, trop corporate sans âme.

## What
- **Structure :** Migration des listes et dashboards vers une disposition en grille de type "Bento" (tailles de blocs variables, coins arrondis prononcés).
- **Couleurs :** Palette **chaude et vibrante** — indigo profond comme primaire (startup/tech), corail comme secondaire (énergie humaine), ambre comme accent (optimisme), sur fond crème chaud (jamais blanc pur).
- **Typographie :** Remplacement de **Inter** par **Plus Jakarta Sans** (Google Fonts). Cette police a des formes légèrement arrondies et expressives qui donnent un caractère "fun & friendly" tout en restant lisible et professionnelle. Importer via `@import url(...)` dans `styles.css`.
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

### Typographie
- **Police :** `Plus Jakarta Sans` (Google Fonts, weights 400/500/600/700/800).
- **Import :** Ajouter en **toute première ligne** de `styles.css` (avant `@import 'tailwindcss'`) :
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  ```
- **Variable :** `--font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;`

### Palette de couleurs — Direction à respecter

| Rôle        | Valeur oklch               | Ressenti                                  |
|-------------|----------------------------|-------------------------------------------|
| Primary     | `oklch(58% 0.2 270)`       | Indigo profond — tech/startup, pas médical |
| Secondary   | `oklch(72% 0.14 25)`       | Corail chaud — humain, énergie            |
| Accent      | `oklch(78% 0.15 75)`       | Ambre — optimisme, vivacité               |
| Base 100    | `#FAFAF8`                  | Crème chaud — jamais blanc pur            |
| Base 200    | `#F4F2EF`                  | Fond alterné légèrement beige             |
| Border      | `#E8E4DF`                  | Gris chaud, pas froid                     |
| Text muted  | `#78716C` (stone-500)      | Gris warm, pas gris acier                 |

**Dark mode :** utiliser des fonds brun-sombre chauds (`#1C1917`, `#292524`) plutôt que le slate froid habituel.

### Design Tokens (to update in `styles.css`)
- `--radius-card`: `1.5rem` (plus arrondi pour le style Bento).
- `--color-brand`: Indigo chaud `oklch(58% 0.2 270)` — pas de bleu/teal.
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
