# Visual Identity Redesign: Glassmorphism & VivaTech Edition

## Goal
Repenser l'identité visuelle de l'application AlumniConnect en adoptant un style **Glassmorphism** inspiré de l'univers VivaTechnology (dégradé magenta → orange), tout en conservant l'intégralité des fonctionnalités et de la stack technique actuelle (Angular, Tailwind CSS v4, DaisyUI v5).

## Why
Le Glassmorphism crée une sensation de profondeur, de modernité et de premium immédiate. Combiné à la palette VivaTech (magenta + orange + or), il donne à AlumniConnect une identité forte, reconnaissable, qui tranche avec les interfaces corporate génériques.

**Ce qu'il faut éviter :**
- Fond blanc ou gris neutre sans vie derrière les composants glass.
- Bordures opaques et nettes sur les cards — briser l'effet de transparence.
- Utiliser `backdrop-filter` sans fond coloré derrière : l'effet glass ne se voit pas sur blanc.
- Trop de couches glass empilées → illisibilité. Maximum 2 niveaux de profondeur.

## What
- **Style :** Glassmorphism — surfaces semi-transparentes avec flou d'arrière-plan, bordures lumineuses subtiles, ombres douces colorées.
- **Fond :** Dégradé de fond fixe (non scrollable) inspiré VivaTech : magenta → violet → orange. Les composants glass "flottent" dessus.
- **Couleurs :** Palette VivaTech — fuchsia/magenta comme primaire, orange vif comme secondaire, or chaud comme accent. Voir `styles.css`.
- **Typographie :** **Plus Jakarta Sans** (Google Fonts, weights 400/500/600/700/800). Police déjà importée dans `styles.css`.
- **Composants :** Cards, modales, inputs, navbar en verre dépoli.

## Technical Context

### Files to Reference (read-only)
- `src/app/core/models/profile.model.ts` - Structure des données alumni.
- `PRPs/design-system.md` - Directives de design (DaisyUI + variables CSS).
- `src/styles.css` - Tokens de couleurs VivaTech déjà configurés.

### Files to Implement/Modify
- `src/styles.css` - Ajout des classes utilitaires glass + fond dégradé global.
- `src/index.html` - Fond dégradé sur `<body>` ou `<html>`.
- `src/app/features/alumni/alumni-list/alumni-list.component.ts` - Refonte layout glass.
- `src/app/shared/components/alumni/alumni-card.component.ts` - Card en verre.
- `src/app/shared/components/layout/header.component.ts` - Navbar glass.
- `src/app/features/jobs/job-list/job-list.component.ts` - Alignement glass.
- `src/app/features/events/event-list/event-list.component.ts` - Alignement glass.

### Existing Patterns to Follow
- Utilisation stricte des tokens DaisyUI et variables CSS de `styles.css`.
- Respect du mode sombre : le fond dégradé s'assombrit, les surfaces glass restent lisibles.

---

## Implementation Details

### Typographie
- **Police :** `Plus Jakarta Sans` (déjà importée dans `styles.css`).
- **Variable :** `--font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;`

### Palette de couleurs VivaTech (déjà dans `styles.css`)

| Rôle      | Light                   | Dark                    | Ressenti             |
|-----------|-------------------------|-------------------------|----------------------|
| Primary   | `oklch(55% 0.29 335)`   | `oklch(65% 0.31 335)`   | Fuchsia/magenta      |
| Secondary | `oklch(64% 0.22 38)`    | `oklch(70% 0.22 38)`    | Orange vif           |
| Accent    | `oklch(76% 0.17 72)`    | `oklch(80% 0.18 72)`    | Or chaud             |
| Base 100  | `oklch(97% 0.008 345)`  | `oklch(14% 0.035 310)`  | Rose pâle / prune    |

### Fond global (background layer)

Le glassmorphism **nécessite** un fond riche et coloré derrière les surfaces. Sans fond, l'effet `backdrop-blur` ne produit rien de visible.

```css
/* À ajouter dans styles.css */
body {
  background-image: linear-gradient(
    135deg,
    oklch(55% 0.29 335) 0%,   /* magenta */
    oklch(45% 0.25 295) 40%,  /* violet */
    oklch(64% 0.22 38) 100%   /* orange */
  );
  background-attachment: fixed;
  min-height: 100dvh;
}

[data-theme='dark'] body {
  background-image: linear-gradient(
    135deg,
    oklch(30% 0.22 335) 0%,   /* magenta sombre */
    oklch(20% 0.15 295) 40%,  /* violet très sombre */
    oklch(35% 0.18 38) 100%   /* orange sombre */
  );
}
```

### Recette Glass — Classes CSS utilitaires

```css
/* À ajouter dans styles.css */

/* Surface glass de base */
.glass {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Variante plus opaque — pour la lisibilité du contenu principal */
.glass-solid {
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

/* Dark mode */
[data-theme='dark'] .glass {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .glass-solid {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

### Utilisation dans les templates Angular

```html
<!-- Card alumni en verre -->
<div class="glass rounded-3xl p-6">
  <h2 class="text-white font-bold">Alice Durand</h2>
  <p class="text-white/70">Masters in AI · 2024</p>
</div>

<!-- Navbar glass sticky -->
<header class="glass sticky top-0 z-40 px-6 h-16 flex items-center">
  ...
</header>

<!-- Input glass -->
<input class="glass input border-white/20 text-white placeholder:text-white/40 focus:border-white/50" />

<!-- Badge glass -->
<span class="glass px-3 py-1 rounded-full text-white/90 text-xs font-semibold">VERIFIED</span>
```

### Règles d'accessibilité sur texte glass

- **Sur fond glass clair :** utiliser `text-white` + `font-semibold` minimum pour assurer le contraste.
- **Sur fond glass sombre :** utiliser `text-white` ou `text-white/90`.
- **Texte muted :** `text-white/60` minimum (ne pas descendre sous `/50`).
- **Ne jamais** utiliser `text-base-content` (gris sombre) sur une surface glass : illisible.
- Vérifier le contraste WCAG AA (ratio ≥ 4.5:1) sur les textes importants.

### Design Tokens à mettre à jour dans `styles.css`

| Variable          | Valeur                   | Pourquoi                              |
|-------------------|--------------------------|---------------------------------------|
| `--radius-card`   | `1.5rem`                 | Coins arrondis — essentiel au glass   |
| `--shadow-card`   | voir recette glass       | Remplacer par box-shadow glass        |
| `--blur-glass`    | `16px` (à ajouter)       | Intensité du flou backdrop            |
| `--glass-opacity` | `0.12` light / `0.06` dark | Opacité de la surface              |

---

## Validation Criteria

### Functional Requirements
- [ ] La navigation entre les pages fonctionne sans régression.
- [ ] Les filtres de recherche restent opérationnels.
- [ ] L'affichage des données (alumni, jobs, events) est complet.
- [ ] Le fond dégradé reste fixe au scroll (`background-attachment: fixed`).

### Technical Requirements
- [ ] Tailwind CSS v4 compile sans erreur.
- [ ] `backdrop-filter` appliqué uniquement sur des éléments avec fond coloré derrière eux.
- [ ] Aucune couleur hardcodée en dehors de `styles.css`.
- [ ] Le responsive est maintenu (les cards glass s'empilent sur mobile).
- [ ] Contraste texte/fond ≥ 4.5:1 (WCAG AA) sur toutes les surfaces glass.
- [ ] Pas plus de 2 niveaux de profondeur glass superposés.

### Testing Steps
1. **Fond visible :** Vérifier que le dégradé magenta→violet→orange est bien visible derrière toutes les pages.
2. **Effet blur :** Sur une card, vérifier que `backdrop-filter: blur` flou bien le fond coloré derrière.
3. **Dark mode :** Basculer en dark — le dégradé s'assombrit, les surfaces glass restent lisibles.
4. **Mobile (375px) :** Cards en colonne unique, effet glass intact.
5. **Scroll :** Le fond dégradé reste fixe, seul le contenu défile.

---

**Créé :** 2026-02-19
**Statut :** Actif
