# Structure du projet

Ce projet est composé de 2 parties:
- Le backend: [back](../back)
- Le frontend: [front](../front)

## Backend (Go)

### Packages utilisés

J'ai utilisé les packages suivants pour le backend:

- **gin-gonic/gin v1.10.0** : Framework web léger et performant pour Go
- **gin-contrib/cors v1.7.2** : Middleware CORS pour Gin
- **golang-jwt/jwt/v5 v5.2.2** : Gestion des tokens JWT
- **pquerna/otp v1.4.0** : Génération et validation de codes TOTP (Two-Factor Authentication)
- **golang.org/x/crypto v0.39.0** : Fonctions cryptographiques
- **gorm.io/gorm v1.25.12** : ORM pour Go
- **gorm.io/driver/postgres v1.6.0** : Driver PostgreSQL pour GORM
- **github.com/jackc/pgx/v5 v5.6.0** : Driver PostgreSQL natif
- **google/uuid v1.6.0** : Génération d'UUIDs
- **gorilla/websocket v1.5.3** : Support WebSocket
- **stretchr/testify v1.9.0** : Framework de tests

### Fonctionnalités principales

1. **Authentification**
   - Inscription/Connexion utilisateur
   - JWT pour la gestion des sessions
   - TOTP pour l'authentification à deux facteurs

2. **Monitoring Système**
   - Surveillance des ressources système
   - Collecte de métriques en temps réel
   - API pour récupérer les données de monitoring

3. **Terminal Interactif**
   - Interface WebSocket pour un terminal en temps réel
   - Exécution de commandes système
   - Affichage des résultats en streaming

4. **Sécurité**
   - Headers de sécurité configurés
   - CORS configuré pour le frontend
   - Validation des tokens JWT

### Configuration

Le backend utilise des variables d'environnement pour la configuration :
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` : Configuration PostgreSQL
- `FRONTEND_ORIGIN` : Origine autorisée pour CORS


## Frontend (React)

J'ai utilisé les packages suivants pour le frontend :

- **react** / **react-dom** : Bibliothèque principale pour l'UI
- **react-admin** : Framework d'admin pour React
- **@mui/material** et **@mui/icons-material** : Composants Material UI
- **@emotion/react** et **@emotion/styled** : Styling CSS-in-JS
- **@radix-ui/react-*** : Composants d'UI accessibles
- **shadcn-ui** : Composants UI modernes
- **tailwindcss** / **@tailwindcss/vite** : Utilitaires CSS
- **recharts** : Graphiques pour le monitoring
- **react-router-dom** : Routing
- **clsx**, **class-variance-authority**, **tailwind-merge** : Utilitaires CSS/classes
- **vitest**, **@testing-library/react**, **@testing-library/jest-dom** : Tests

### Fonctionnalités principales du frontend

- **Authentification** :
  - Connexion/inscription avec gestion JWT
  - Authentification à deux facteurs (TOTP)
  - Gestion du contexte utilisateur (AuthProvider)
- **Dashboard de monitoring** :
  - Affichage en temps réel des métriques CPU, RAM, disque via WebSocket
  - Graphiques dynamiques (Recharts)
- **Terminal interactif** :
  - Exécution de commandes système à distance (WebSocket)
  - Affichage du résultat en temps réel, historique des commandes
- **Gestion du profil utilisateur** :
  - Affichage et modification des infos utilisateur
  - Activation/désactivation du 2FA
- **UI moderne et responsive** :
  - Utilisation de Material UI, shadcn/ui, Tailwind CSS
  - Composants personnalisés pour une expérience utilisateur fluide
- **Tests** :
  - Tests unitaires avec Vitest et Testing Library

### Déploiement

Le frontend est packagé avec Vite et peut être lancé en développement (`bun run dev`) ou buildé pour la production (`bun run build`).

Le projet utilise Docker Compose pour orchestrer le déploiement du backend et du frontend, avec une base de données PostgreSQL.
