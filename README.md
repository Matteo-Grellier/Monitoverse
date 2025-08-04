# Monitoverse

# Bloc 2

## Tests Unitaires

### 🧪 Terminal Dashboard Tests

Le projet inclut une suite complète de tests unitaires pour la fonctionnalité Terminal Dashboard, couvrant à la fois le frontend (React/TypeScript) et le backend (Go).

#### Frontend Tests (React/TypeScript)

**Localisation**: `front/src/components/TerminalDashboard.test.tsx`

**Tests UI (8 tests)**:
- ✅ Rendu de tous les éléments de l'interface
- ✅ Gestion des changements d'entrée de commande
- ✅ Toggle de la checkbox sudo
- ✅ Désactivation du bouton d'exécution quand déconnecté
- ✅ Activation du bouton d'exécution quand connecté avec commande
- ✅ Exécution de commande quand le bouton est cliqué
- ✅ Exécution de commande avec sudo quand la checkbox est cochée
- ✅ Effacement de l'historique quand le bouton clear est cliqué

**Tests de Connexion Backend (9 tests)**:
- ✅ Établissement de la connexion WebSocket au montage
- ✅ Gestion de la connexion WebSocket réussie
- ✅ Gestion des erreurs de connexion WebSocket
- ✅ Gestion de la fermeture de connexion WebSocket
- ✅ Gestion des messages d'historique du backend
- ✅ Gestion des messages de résultat de commande du backend
- ✅ Gestion des messages d'erreur de commande du backend
- ✅ Gestion des sorties partielles de commande du backend
- ✅ Envoi de commande avec le bon format au backend

#### Backend Tests (Go)

**Localisation**: `back/internal/api/handlers/terminal_test.go`

**Tests de Connexion WebSocket (2 tests)**:
- ✅ Établissement de connexion WebSocket
- ✅ Authentification avec tokens valides/invalides/manquants

**Tests d'Exécution de Commandes (6 tests)**:
- ✅ Exécution de commande basique avec echo
- ✅ Exécution de commande avec sudo
- ✅ Gestion d'erreur pour les commandes invalides
- ✅ Gestion de l'historique des commandes
- ✅ Différentes cibles de commandes (host, container)
- ✅ Validation des types de messages

**Tests de Fonctionnalités Avancées (4 tests)**:
- ✅ Exécution concurrente de commandes
- ✅ Gestion des timeouts de commandes
- ✅ Gestion des sorties volumineuses
- ✅ Validation des types de messages

#### Exécution des Tests

```bash
# Tests Frontend
cd front
bun run test

# Tests Backend
cd back
go test ./internal/api/handlers -v

# Tous les tests
cd back
go test ./... -v
```

#### Couverture de Test

**Frontend**: 18 tests couvrant les interactions UI et le comportement client WebSocket
**Backend**: 12 tests couvrant le serveur WebSocket, l'exécution de commandes et l'authentification

Cette suite de tests assure une couverture complète de la fonctionnalité Terminal Dashboard, garantissant que l'interface utilisateur et la logique serveur fonctionnent correctement dans tous les scénarios.

## Securité

Les parties du code qui mettent en avant la sécurité sont:

- **Authentification JWT** : Le backend utilise des tokens JWT pour authentifier les utilisateurs. Les routes sensibles nécessitent un token valide, qui doit être transmis par le client. Le secret utilisé pour signer les JWT est stocké dans la variable d'environnement `JWT_SECRET` (voir `back/internal/authutil/jwt.go`).

- **Hashage des mots de passe** : Lors de l'inscription, les mots de passe sont hashés avec bcrypt avant d'être stockés en base de données (voir `CreateUser` dans `back/internal/api/handlers/auth.go`). Cela protège les mots de passe même en cas de fuite de la base.

- **Double authentification (TOTP)** : Après la connexion par mot de passe, l'utilisateur doit fournir un code TOTP (Google Authenticator, etc.) pour finaliser l'authentification (`/auth/login/totp`). Le backend vérifie la validité du code TOTP avant de délivrer le JWT.

- **Protection des routes** : Les routes de monitoring et d'administration sont protégées et nécessitent un JWT valide. Les WebSockets de monitoring vérifient le token avant d'établir la connexion (`MakeWebSocketHandler` dans `back/internal/api/handlers/monitoring.go`).

- **Gestion des erreurs** : Les messages d'erreur détaillés ne sont affichés qu'en mode développement. En production, les messages sont génériques pour éviter de divulguer des informations sensibles.

- **Sécurité des variables d'environnement** : Les secrets (JWT, accès base de données) ne sont jamais hardcodés dans le code source, mais injectés via des variables d'environnement.

- **Recommandations de déploiement** : Le projet recommande explicitement l'usage d'un reverse proxy HTTPS (Nginx, Caddy, etc.) devant le backend Go, et de ne jamais exposer directement le backend sur Internet sans TLS.

- **Connexion à la base de données sécurisée** : La connexion à PostgreSQL se fait en mode SSL (`sslmode=require`).

- **Déconnexion** : La déconnexion côté client consiste à supprimer le JWT localement, car le backend ne stocke pas d'état de session (stateless).

- **Limitation de l'historique monitoring** : L'historique des métriques système est limité à 1000 entrées pour éviter les fuites de mémoire côté serveur.

- **Validation stricte des entrées** : Les requêtes d'inscription et de connexion valident strictement les champs (email, mot de passe, etc.) côté backend.

- **Pas de mot de passe en clair** : Les réponses API ne retournent jamais le mot de passe ou son hash.

- **Logs** : Les logs d'erreur côté serveur n'exposent pas d'informations sensibles en production.

A comprehensive monitoring and terminal management system built with Go backend and React frontend.

---

## 🚨 Security & Deployment Best Practices

**Production deployments MUST follow these guidelines:**

- **Reverse Proxy & HTTPS:**
  - Always run the Go backend behind a reverse proxy (e.g., Nginx, Caddy, Traefik) that terminates HTTPS/TLS.
  - Do NOT expose the Go backend directly to the internet without TLS.
  - The reverse proxy should forward requests to the backend over HTTP on the internal network.
- **Environment Variables:**
  - Set a strong, unpredictable `JWT_SECRET` environment variable. The backend will refuse to start if this is missing.
  - Store all secrets (database credentials, JWT secret, etc.) in a secure `.env` file or your deployment environment.
- **Database Security:**
  - The backend requires SSL for all Postgres connections (`sslmode=require`).
  - Ensure your database is configured to support SSL connections.
- **Frontend:**
  - Serve the frontend over HTTPS in production (use the same reverse proxy).

---

## Features

### 🔍 System Monitoring
- Real-time CPU usage monitoring
- Memory usage tracking
- Disk usage monitoring for multiple partitions
- WebSocket-based live data streaming
- Interactive charts and graphs

### 💻 Terminal Dashboard
- Execute shell commands through web interface
- Real-time command output streaming
- Command history with timestamps
- Success/error status indicators
- Terminal-like dark theme interface
- Support for all shell commands

### 🔐 Authentication
- User registration and login
- TOTP (Two-Factor Authentication) support
- Secure session management (JWT)

## Architecture

- **Backend**: Go with Gin framework
- **Frontend**: React with Material-UI
- **Database**: PostgreSQL
- **Real-time**: WebSocket connections
- **Authentication**: JWT + TOTP

## Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+ or Bun
- Docker (optional)
- PostgreSQL (with SSL enabled)

### Backend Setup

```bash
cd back
go mod download
go run main.go
```

The backend will start on `http://localhost:8081` (HTTP for development only)

> **Note:** For production, use a reverse proxy for HTTPS. See Security & Deployment above.

### Frontend Setup

```bash
cd front
bun install
bun run dev
```

The frontend will start on `http://localhost:5173`

### Using Docker

```bash
docker-compose up -d
```

## Terminal Dashboard Usage

The Terminal Dashboard allows you to execute shell commands directly from the web interface:

1. **Navigate to Terminal**: Access the terminal dashboard from the main navigation
2. **Execute Commands**: Type any shell command in the input field
3. **Real-time Output**: See command output as it streams in real-time
4. **Command History**: View all previously executed commands with timestamps
5. **Status Tracking**: Each command shows success/error status

### Security Considerations

- **Reverse Proxy Required:** Always use a reverse proxy with HTTPS in production.
- **JWT Secret:** The backend will not start without a secure `JWT_SECRET` set.
- **Database SSL:** All database connections require SSL (`sslmode=require`).
- **Command Execution:** Commands are executed with the same permissions as the backend process. Consider restricting or auditing commands in production.
- **Access Controls:** All sensitive endpoints are protected by JWT authentication. Do not share tokens.
- **TOTP:** Two-factor authentication is enforced for all users.
- **Environment Variables:** Never commit secrets or `.env` files to version control.

## API Endpoints

### Monitoring
- `GET /monitoring/cpu` - WebSocket endpoint for CPU usage
- `GET /monitoring/memory` - WebSocket endpoint for memory usage
- `GET /monitoring/disk` - WebSocket endpoint for disk usage
- `GET /monitoring/history` - Historical monitoring data

### Terminal
- `GET /terminal` - WebSocket endpoint for terminal commands

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/login/totp` - TOTP login
- `POST /auth/totp/generate` - TOTP setup
- `POST /auth/totp/verify` - TOTP verification
- `POST /auth/totp/enable` - Enable TOTP
- `POST /auth/totp/disable` - Disable TOTP

## Development

### Use Makefile

```bash
make dev
```

### Backend Development

```bash
cd back
go run main.go
```

### Frontend Development

```bash
cd front
bun run dev
```

### Testing

```bash
# Backend tests
cd back
go test ./...

# Frontend tests
cd front
bun run test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 