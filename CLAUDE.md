# Portfolio Photo – Harry DEGBEGNI

Portfolio photographique statique, hébergé sur **GitHub Pages** (branche `main`).
Pas de framework, pas de build tool — HTML/CSS/JS purs.

## Structure

```
portfolio_photo/
├── index.html        # Page principale (galerie + tabs)
├── contact.html      # Page de contact
├── style.css         # Styles globaux (thème sombre, responsive)
├── photos/           # Images WebP optimisées (source: JPG bruts de caméra)
│   ├── photoVoyage1.webp   … photoVoyage14.webp
│   ├── photoPortrait1.webp … photoPortrait6.webp
│   ├── photoSoiree1.webp   … photoSoiree10.webp
│   └── photoAppart1.webp   … photoAppart7.webp
└── CLAUDE.md
```

## Décisions techniques

### Images : WebP uniquement
- Les originaux JPG (3–12 Mo/photo) sont trop lourds pour GitHub Pages.
- Toutes les images sont converties en WebP (qualité 80) via `cwebp`.
- Les fichiers `.JPG` originaux ne sont **pas** commités dans le repo.
- Commande de (re)conversion :
  ```bash
  for f in photos/*.JPG; do
    cwebp -q 80 "$f" -o "${f%.JPG}.webp"
  done
  ```

### Catégories de galerie
Les 4 catégories sont définies dans l'objet `galleries` dans `index.html` :

| Clé       | Préfixe fichier          | Nb photos |
|-----------|--------------------------|-----------|
| voyage    | photos/photoVoyage       | 14        |
| portrait  | photos/photoPortrait     | 6         |
| soiree    | photos/photoSoiree       | 10        |
| appart    | photos/photoAppart       | 7         |

Pour **ajouter une photo** : déposer le fichier `photoVoyage15.webp` et incrémenter `count` dans `galleries`.
Pour **ajouter une catégorie** : ajouter une entrée dans `galleries` + un bouton `.tab-btn` dans le HTML.

### Lightbox
- Implémentation custom, sans dépendance externe.
- Navigation clavier : `←`/`→` pour naviguer, `Escape` pour fermer.
- Navigation tactile : swipe gauche/droite (touch events).
- Affiche le numéro `N / total` en bas à gauche.

### Design tokens (style.css)
```
--bg: #0a0a0a          fond général
--text: #f2f2f2        texte principal
--muted: #bbb          texte secondaire
--accent: #e50914      rouge (Netflix-like)
--accentHover: #b00610 rouge hover
--radius: 14px         arrondi des cartes
```

## Ce qu'il ne faut PAS faire
- Ne pas committer les `.JPG` originaux (trop lourds, GitHub Pages lent).
- Ne pas committer les `.DS_Store` (déjà dans `.gitignore`).
- Ne pas introduire de framework JS ou de bundler — le site doit rester 100% statique.
- Ne pas utiliser de CDN externe pour les fonts ou icônes (indisponibilité possible).

## Déploiement
Push sur `main` → GitHub Pages se met à jour automatiquement (quelques minutes).
URL : `https://harrydegbegni.github.io/portfolio_photo/` *(à confirmer selon le nom du repo)*

## Axes d'amélioration identifiés
- [ ] `srcset` / `<picture>` pour servir des tailles adaptées au viewport
- [ ] Page 404 custom (`404.html`)
- [ ] Meta OG (og:title, og:image, og:description) pour le partage social
- [ ] Catégorie "Appart" → renommer en "Intérieur" si public pro visé
- [ ] Copyright année dynamique (`new Date().getFullYear()`)
