# Portfolio Photo – Harry DEGBEGNI

Portfolio photographique statique, hébergé sur **GitHub Pages** (branche `main`).
Pas de framework, pas de build tool — HTML/CSS/JS purs.

## Structure

```
portfolio_photo/
├── index.html          # Page principale (galerie masonry + lightbox)
├── contact.html        # Page de contact
├── css/
│   ├── style.css       # Tokens + composants partagés (topbar, footer, eyebrow)
│   ├── gallery.css     # Styles spécifiques à index (masonry, lightbox, tweaks)
│   └── contact.css     # Styles spécifiques à contact
├── js/
│   └── gallery.js      # Moteur galerie + lightbox + tweaks
├── img/
│   ├── voyage/         # 1.webp … 14.webp
│   ├── portrait/       # 1.webp … 6.webp
│   ├── soiree/         # 1.webp … 10.webp
│   └── appart/         # 1.webp … 7.webp
└── CLAUDE.md
```

## Décisions techniques

### Images : WebP uniquement, nommage numérique
- Convention : `img/{categorie}/{n}.webp` (ex. `img/voyage/1.webp`)
- Les originaux JPG ne sont **pas** commités (trop lourds pour GitHub Pages).
- Conversion via `cwebp` (brew install webp), qualité 80 :
  ```bash
  for f in *.JPG; do cwebp -q 80 "$f" -o "${f%.JPG}.webp"; done
  ```

### Catégories de galerie
Définies dans `js/gallery.js` dans le tableau `SETS` :

| `cat`         | `label`       | Nb photos |
|---------------|---------------|-----------|
| fiancaille    | Fiançailles   | 15        |
| celebrations  | Célébrations  | 11        |
| soiree        | Soirée        | 14        |
| appart        | Intérieur     | 17        |
| voyage        | Voyage        | 19        |
| portrait      | Portrait      | 6         |

Pour **ajouter une photo** : déposer `img/voyage/15.webp` et incrémenter `ratios` dans `SETS`.
Pour **ajouter une catégorie** : créer `img/<cat>/`, ajouter une entrée dans `SETS`.

### Galerie masonry (justified layout)
- Moteur custom dans `js/gallery.js` — pas de lib externe.
- Les images s'organisent en lignes de hauteur uniforme selon les ratios déclarés dans `SETS`.
- 3 densités configurables : `aere` (460px), `standard` (360px), `dense` (280px).
- Recalcul au resize avec debounce 120ms.

### Lightbox
- Implémentation custom, sans dépendance externe.
- Navigation : `←`/`→` clavier, swipe tactile, flèches à l'écran.
- `Escape` ou clic sur le fond pour fermer.
- Préchargement de l'image avant affichage (transition opacity).

### Tweaks (panneau de personnalisation)
- Activé via `postMessage({ type: '__activate_edit_mode' })` depuis une iframe parente.
- Permet de changer accent (4 couleurs), typo titre (3 fonts), densité grille, grain argentique.

### Design tokens (css/style.css)
```
--bg:        #0b0b0c    fond général
--bg-2:      #121214    fond cartes
--text:      #ece9e4    texte principal
--muted:     #918d87    texte secondaire
--accent:    #b8473d    rouge terracotta
--font-display: "Instrument Serif"
--font-ui:      "Archivo"
```

## Ce qu'il ne faut PAS faire
- Ne pas committer les `.JPG` originaux.
- Ne pas committer les `.DS_Store` (`.gitignore` en place).
- Ne pas introduire de framework JS ou de bundler.
- Ne pas utiliser de CDN externe (fonts Google sont déjà chargées depuis les HTML).
- Ne pas remettre de `<style>` ou `<script>` inline dans les HTML — tout est externalisé.

## Déploiement
Push sur `main` → GitHub Pages se met à jour automatiquement.
URL : `https://harrydegbegni.github.io/portfolio_photo/`

## Axes d'amélioration identifiés
- [ ] `srcset` / `<picture>` pour servir des tailles adaptées au viewport
- [ ] Page 404 custom (`404.html`)
- [ ] Meta OG (og:title, og:image, og:description) pour le partage social
