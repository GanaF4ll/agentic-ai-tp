# Design System PRP — Tailwind CSS + DaisyUI

> **Règle absolue pour tout agent IA :** Ce fichier définit les contraintes de design non négociables pour le front-end AlumniConnect. Toute génération de code HTML/template Angular **doit** respecter ces directives avant d'écrire la première ligne.

---

## Stack de Design

| Outil          | Version   | Rôle                                                     |
| -------------- | --------- | -------------------------------------------------------- |
| Tailwind CSS   | `^4.1.12` | Utilitaires CSS (layout, spacing, typography, …)         |
| DaisyUI        | `^5.0.0`  | Bibliothèque de composants sémantiques (plugin Tailwind) |
| `styles.css`   | —         | Variables CSS globales + configuration des thèmes        |
| lucide-angular | latest    | Icônes SVG                                               |

---

## Règle n°0 — Variables CSS dans `styles.css`

**Toutes les valeurs de design réutilisables (espacements, rayons, couleurs, ombres, typographie) sont déclarées comme variables CSS dans `front-end/src/styles.css`. Ne jamais les hardcoder dans un composant.**

### Fichier de référence : `front-end/src/styles.css`

Ce fichier contient trois blocs :

1. **`:root`** — variables CSS indépendantes du thème (espacements, rayons, transitions, typographie, largeurs max).
2. **`[data-theme="light"]`** — tokens de couleurs pour le thème clair.
3. **`[data-theme="dark"]`** — tokens de couleurs pour le thème sombre.

### Variables disponibles

#### Indépendantes du thème (`:root`)

| Variable                  | Valeur par défaut       | Usage                        |
| ------------------------- | ----------------------- | ---------------------------- |
| `--spacing-page-x`        | `1.5rem`                | Padding horizontal des pages |
| `--spacing-section`       | `2rem`                  | Espace entre sections        |
| `--spacing-card`          | `1.5rem`                | Padding interne des cards    |
| `--radius-card`           | `1rem`                  | Rayon des cards              |
| `--radius-badge`          | `9999px`                | Rayon des badges             |
| `--radius-input`          | `0.5rem`                | Rayon des inputs             |
| `--transition-fast`       | `150ms ease-in-out`     | Transitions rapides          |
| `--transition-base`       | `250ms ease-in-out`     | Transitions standards        |
| `--shadow-card`           | ombre légère            | Ombre des cards              |
| `--max-w-page`            | `1280px`                | Largeur max des pages        |
| `--max-w-form`            | `480px`                 | Largeur max des formulaires  |
| `--max-w-modal`           | `560px`                 | Largeur max des modales      |
| `--font-sans`             | `Inter, system-ui`      | Police principale            |
| `--font-size-hero`        | `2.25rem`               | Titre hero                   |
| `--font-size-section-title` | `1.5rem`              | Titre de section             |
| `--line-height-body`      | `1.6`                   | Interligne du corps          |

#### Dépendantes du thème (`light` / `dark`)

| Variable               | Thème clair                  | Thème sombre                  | Usage                         |
| ---------------------- | ---------------------------- | ----------------------------- | ----------------------------- |
| `--color-brand`        | cyan (#2FB9C6)               | cyan lumineux                 | Couleur principale de marque  |
| `--color-brand-hover`  | cyan foncé                   | cyan plus vif                 | Hover sur éléments de marque  |
| `--color-surface`      | blanc                        | gris très foncé               | Fond des pages                |
| `--color-surface-alt`  | gris très clair              | gris foncé                    | Fond des sections/sidebar     |
| `--color-border`       | gris clair                   | gris sombre                   | Bordures                      |
| `--color-text-muted`   | gris moyen                   | gris clair                    | Texte secondaire / placeholders |
| `--color-overlay`      | noir semi-transparent        | noir plus opaque              | Fond des modales              |

### Utilisation dans les templates

```html
<!-- Utiliser une variable CSS en style inline ponctuel (exceptionnel) -->
<div style="border-radius: var(--radius-card)">...</div>

<!-- Préférer les classes utilitaires Tailwind avec les variables -->
<div class="page-container">...</div>
```

```css
/* Dans styles.css uniquement — exemple d'ajout d'une nouvelle règle globale */
.my-custom-element {
  padding: var(--spacing-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: opacity var(--transition-base);
}
```

### Règles d'évolution

- **Ajouter** une variable → la déclarer dans `:root` (si indépendante du thème) ou dans les deux blocs `[data-theme]`.
- **Modifier** une valeur de design → toujours modifier dans `styles.css`, jamais dans le composant.
- **Ne jamais** dupliquer une valeur déjà définie comme variable CSS dans un composant.

---

## Règle n°1 — DaisyUI en priorité absolue

**Utilise toujours un composant DaisyUI existant avant d'écrire du CSS personnalisé.**

> Si un composant DaisyUI couvre le besoin (même partiellement), utilise-le. N'invente pas de classes CSS, ne crée pas de styles inline, ne génère pas de fichier `.css` séparé pour ce qui peut être fait avec les classes DaisyUI + Tailwind.

Exemples :

- Bouton → `btn btn-primary` / `btn btn-ghost` / `btn btn-sm` (pas de `<button style="...">`)
- Carte → `card card-body` (pas de `<div class="p-4 rounded shadow border">`)
- Alerte → `alert alert-success` / `alert alert-error` (pas de div coloré custom)
- Chargement → `skeleton` (pas de spinner CSS fait main)
- Modal → `modal modal-open` + `modal-box` (pas de div overlay positionné en absolute)

---

## Règle n°2 — Tailwind pour la mise en page et les ajustements

Tailwind est autorisé pour tout ce que DaisyUI ne couvre pas directement :

- **Layout :** `flex`, `grid`, `gap-*`, `items-*`, `justify-*`, `col-span-*`
- **Espacement :** `p-*`, `m-*`, `space-y-*`, `space-x-*`
- **Responsive :** `sm:`, `md:`, `lg:`, `xl:` breakpoints
- **Typographie :** `text-sm`, `font-semibold`, `truncate`, `line-clamp-*`
- **Dimensions :** `w-*`, `h-*`, `max-w-*`, `min-h-*`
- **Overrides DaisyUI :** Ajouter des classes Tailwind *en complément* des classes DaisyUI, jamais à la place.

---

## Règle n°3 — Thème et tokens sémantiques

Utilise **exclusivement** les couleurs sémantiques DaisyUI. Ne hardcode jamais de couleurs Tailwind brutes (`text-blue-500`, `bg-gray-100`, etc.).

| Token DaisyUI       | Usage                          |
| ------------------- | ------------------------------ |
| `bg-base-100/200/300` | Arrière-plans des pages/sections |
| `text-base-content` | Texte principal                |
| `bg-primary` / `text-primary` | Actions principales, CTAs |
| `bg-secondary` / `text-secondary` | Actions secondaires       |
| `bg-accent`         | Mises en avant, badges         |
| `bg-neutral`        | Éléments neutres               |
| `text-success/warning/error/info` | Statuts et feedbacks   |

Le thème actif est défini via `data-theme` sur `<html>` dans `index.html`. Ne pas modifier les tokens dans les composants.

---

## Référence — Composants DaisyUI à utiliser par contexte

### Navigation

```html
<!-- Navbar principale -->
<div class="navbar bg-base-100 shadow-sm">...</div>

<!-- Drawer sidebar (responsive) -->
<div class="drawer lg:drawer-open">...</div>

<!-- Tabs internes -->
<div class="tabs tabs-bordered">
  <a class="tab tab-active">Profil</a>
  <a class="tab">Expériences</a>
</div>
```

### Contenus

```html
<!-- Card générique -->
<div class="card bg-base-100 shadow-xl border border-base-300">
  <div class="card-body">
    <h2 class="card-title text-primary">Titre</h2>
    <p class="text-base-content/70">Description</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary btn-sm">Action</button>
    </div>
  </div>
</div>

<!-- Table de données -->
<div class="overflow-x-auto">
  <table class="table table-zebra">
    <thead><tr><th>Nom</th><th>Statut</th></tr></thead>
    <tbody>...</tbody>
  </table>
</div>

<!-- Stats (dashboard) -->
<div class="stats shadow">
  <div class="stat">
    <div class="stat-title">Alumni total</div>
    <div class="stat-value text-primary">1 240</div>
  </div>
</div>
```

### Formulaires

```html
<!-- Champ texte -->
<fieldset class="fieldset">
  <legend class="fieldset-legend">Email</legend>
  <input type="email" class="input input-bordered w-full" placeholder="nom@ecole.fr" />
</fieldset>

<!-- Select -->
<select class="select select-bordered w-full">
  <option disabled selected>Promotion</option>
  <option>2024</option>
</select>

<!-- Boutons -->
<button class="btn btn-primary">Soumettre</button>
<button class="btn btn-ghost">Annuler</button>
<button class="btn btn-error btn-outline btn-sm">Supprimer</button>
```

### Feedback & Statuts

```html
<!-- Badges de statut profil -->
<span class="badge badge-warning">DRAFT</span>
<span class="badge badge-success">VERIFIED</span>
<span class="badge badge-primary">ADMIN</span>

<!-- Alertes -->
<div class="alert alert-success">
  <span>Profil validé avec succès.</span>
</div>
<div class="alert alert-error">
  <span>Une erreur est survenue.</span>
</div>

<!-- Toast (notification temporaire) -->
<div class="toast toast-end">
  <div class="alert alert-info"><span>Sauvegarde en cours…</span></div>
</div>

<!-- Skeleton (état de chargement) -->
<div class="skeleton h-32 w-full rounded-xl"></div>
<div class="skeleton h-4 w-48 mt-2"></div>
```

### Modales

```html
<!-- Déclencheur -->
<button class="btn btn-primary" onclick="my_modal.showModal()">Ouvrir</button>

<!-- Modale -->
<dialog id="my_modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Confirmer la validation</h3>
    <p class="py-4">Cette action est irréversible.</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn btn-ghost">Annuler</button>
        <button class="btn btn-success">Confirmer</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop"><button>Fermer</button></form>
</dialog>
```

### Pagination

```html
<div class="join">
  <button class="join-item btn">«</button>
  <button class="join-item btn btn-active">1</button>
  <button class="join-item btn">2</button>
  <button class="join-item btn">3</button>
  <button class="join-item btn">»</button>
</div>
```

---

## Règle n°4 — Mode sombre et mode clair

Le projet supporte **deux thèmes DaisyUI** : `light` (défaut) et `dark` (activé automatiquement si `prefers-color-scheme: dark`).

### Configuration (déjà en place dans `styles.css`)

```css
@plugin "daisyui" {
  themes: light --default, dark --prefersdark;
}
```

Le thème actif est contrôlé par l'attribut `data-theme` sur `<html>` dans `index.html` ou piloté dynamiquement via un service Angular.

### Règles pour les agents

1. **Utilise toujours les tokens sémantiques DaisyUI** (`bg-base-100`, `text-base-content`, etc.) — ils basculent automatiquement entre les deux thèmes. Tu n'as rien à faire de spécial pour le dark mode de base.

2. **Pour les couleurs custom** (tokens `--color-*` de `styles.css`), les deux variantes sont déjà déclarées dans `[data-theme="light"]` et `[data-theme="dark"]`. Référence-les toujours via `var(--color-*)`.

3. **Ne jamais** utiliser des classes Tailwind brutes qui ne s'adaptent pas au thème (`bg-white`, `text-gray-900`, `bg-gray-800`) si un token DaisyUI ou une variable CSS existe.

4. **Icônes et SVG** : utilise `currentColor` pour que les icônes héritent de la couleur du texte et changent automatiquement avec le thème.

5. **Toggle de thème** : l'agent doit pouvoir générer un composant `ThemeToggle` qui applique `document.documentElement.setAttribute('data-theme', theme)` et persiste le choix dans `localStorage`.

### Exemple — Composant adaptatif

```html
<!-- ✅ S'adapte automatiquement aux deux thèmes -->
<div class="card bg-base-100 border border-base-300 shadow-sm">
  <div class="card-body">
    <p class="text-base-content">Texte principal</p>
    <p class="text-base-content/60">Texte secondaire</p>
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<!-- ❌ Ne s'adapte pas au thème sombre -->
<div style="background: white; color: black">...</div>
```

### Exemple — Toggle de thème Angular

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'ac-theme';
  private _theme = signal<'light' | 'dark'>(this.getSavedTheme());

  theme = this._theme.asReadonly();
  isDark = computed(() => this._theme() === 'dark');

  toggle(): void {
    const next = this._theme() === 'light' ? 'dark' : 'light';
    this._theme.set(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(this.STORAGE_KEY, next);
  }

  private getSavedTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
```

```html
<!-- Bouton toggle dans la navbar -->
<button class="btn btn-ghost btn-circle" (click)="themeService.toggle()">
  @if (themeService.isDark()) {
    <lucide-icon name="sun" [size]="20" />
  } @else {
    <lucide-icon name="moon" [size]="20" />
  }
</button>
```

---

## Règle n°5 — Responsive Design

Chaque composant doit fonctionner de **375 px (mobile)** à **1440 px (desktop)**.

- Utilise les breakpoints Tailwind : `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
- Les grilles doivent être `grid-cols-1` sur mobile et s'adapter : `md:grid-cols-2 lg:grid-cols-3`.
- Privilégie `drawer` de DaisyUI pour les sidebars (caché sur mobile, visible sur `lg:`).
- Les tableaux doivent être encapsulés dans `overflow-x-auto`.

---

## Règle n°6 — Ce qui est interdit

| Interdit                                                | Alternative à utiliser                                  |
| ------------------------------------------------------- | ------------------------------------------------------- |
| Styles inline (`style="color:red"`)                     | `text-error` ou token DaisyUI sémantique                |
| Hardcoder une valeur de design dans un composant        | Variable CSS depuis `styles.css` (`var(--radius-card)`) |
| Déclarer une variable CSS dans un fichier de composant  | La déclarer dans `:root` ou `[data-theme]` dans `styles.css` |
| Couleurs brutes non adaptatives (`bg-white`, `text-gray-900`) | Tokens DaisyUI (`bg-base-100`, `text-base-content`) |
| Couleurs Tailwind brutes si un token DaisyUI existe     | Tokens sémantiques DaisyUI                              |
| Bootstrap, Material, PrimeNG ou tout autre framework UI | DaisyUI uniquement                                      |
| `@apply` dans des fichiers `.css` de composant          | Classes directement dans les templates Angular          |
| Dupliquer des valeurs déjà définies dans `styles.css`   | `var(--nom-de-la-variable)`                             |

---

## Checklist avant de soumettre du code

- [ ] Chaque composant UI utilise en priorité des classes DaisyUI.
- [ ] Aucune couleur Tailwind brute là où un token DaisyUI sémantique existe.
- [ ] Toutes les valeurs de design réutilisables passent par `var(--...)` défini dans `styles.css`.
- [ ] Aucune nouvelle variable CSS déclarée dans un fichier de composant.
- [ ] Le composant s'adapte aux deux thèmes (`light` et `dark`) sans code conditionnel dans le template.
- [ ] Aucune couleur fixe non adaptive (`bg-white`, `text-black`, `bg-gray-800`, …).
- [ ] Le layout est responsive (testé mentalement à 375 px et 1280 px).
- [ ] Les états de chargement utilisent `skeleton`.
- [ ] Les feedbacks utilisent `alert` ou `toast`.
- [ ] Aucun style inline ni fichier CSS séparé de composant.

---

**Créé :** 2026-02-19
**Statut :** Actif — s'applique à toutes les tâches front-end
