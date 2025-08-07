## Tests Unitaires

### 🧪 Terminal Dashboard Tests

Le projet inclut une suite complète de tests unitaires pour la fonctionnalité Terminal Dashboard, couvrant à la fois le frontend (React/TypeScript) et le backend (Go).

#### Frontend Tests (React/TypeScript)

**Localisation**: `front/src/components/TerminalDashboard.test.tsx`

**Tests UI (7 tests)**:
- ✅ Rendu de tous les éléments de l'interface
- ✅ Gestion des changements d'entrée de commande
- ✅ Toggle de la checkbox sudo
- ✅ Désactivation du bouton d'exécution quand déconnecté
- ✅ Activation du bouton d'exécution quand connecté avec commande
- ✅ Exécution de commande quand le bouton est cliqué
- ✅ Exécution de commande avec sudo quand la checkbox est cochée
- ✅ Effacement de l'historique quand le bouton clear est cliqué

**Tests de Connexion Backend (8 tests)**:
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

**Tests de Connexion WebSocket (1 tests)**:
- ✅ Établissement de connexion WebSocket
- ✅ Authentification avec tokens valides/invalides/manquants

**Tests d'Exécution de Commandes (5 tests)**:
- ✅ Exécution de commande basique avec echo
- ✅ Exécution de commande avec sudo
- ✅ Gestion d'erreur pour les commandes invalides
- ✅ Gestion de l'historique des commandes
- ✅ Différentes cibles de commandes (host, container)
- ✅ Validation des types de messages

**Tests de Fonctionnalités Avancées (3 tests)**:
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

**Frontend**: 17 tests couvrant les interactions UI et le comportement client WebSocket
**Backend**: 11 tests couvrant le serveur WebSocket, l'exécution de commandes et l'authentification

Cette suite de tests assure une couverture complète de la fonctionnalité Terminal Dashboard, garantissant que l'interface utilisateur et la logique serveur fonctionnent correctement dans tous les scénarios.