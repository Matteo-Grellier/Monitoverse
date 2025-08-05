## Securité

Les parties du code qui mettent en avant la sécurité sont:

- **Authentification JWT** : Le backend utilise des tokens JWT pour authentifier les utilisateurs. Les routes sensibles nécessitent un token valide, qui doit être transmis par le client. Le secret utilisé pour signer les JWT est stocké dans la variable d'environnement `JWT_SECRET` (voir [back/internal/authutil/jwt.go](../back/internal/authutil/jwt.go)).

- **Hashage des mots de passe** : Lors de l'inscription, les mots de passe sont hashés avec bcrypt avant d'être stockés en base de données (voir `CreateUser` dans [back/internal/api/handlers/auth.go](../back/internal/api/handlers/auth.go)). Cela protège les mots de passe même en cas de fuite de la base.

- **Double authentification (TOTP)** : Après la connexion par mot de passe, l'utilisateur doit fournir un code TOTP (Google Authenticator, etc.) pour finaliser l'authentification (`/auth/login/totp`). Le backend vérifie la validité du code TOTP avant de délivrer le JWT.

- **Protection des routes** : Les routes de monitoring et d'administration sont protégées et nécessitent un JWT valide. Les WebSockets de monitoring vérifient le token avant d'établir la connexion (`MakeWebSocketHandler` dans [back/internal/api/handlers/monitoring.go](../back/internal/api/handlers/monitoring.go)).

- **Gestion des erreurs** : Les messages d'erreur détaillés ne sont affichés qu'en mode développement. En production, les messages sont génériques pour éviter de divulguer des informations sensibles.

- **Sécurité des variables d'environnement** : Les secrets (JWT, accès base de données) ne sont jamais hardcodés dans le code source, mais injectés via des variables d'environnement.

- **Recommandations de déploiement** : Le projet recommande explicitement l'usage d'un reverse proxy HTTPS (Nginx, Caddy, etc.) devant le backend Go, et de ne jamais exposer directement le backend sur Internet sans TLS.

- **Connexion à la base de données sécurisée** : La connexion à PostgreSQL se fait en mode SSL (`sslmode=require`).

- **Déconnexion** : La déconnexion côté client consiste à supprimer le JWT localement, car le backend ne stocke pas d'état de session (stateless).

- **Limitation de l'historique monitoring** : L'historique des métriques système est limité à 1000 entrées pour éviter les fuites de mémoire côté serveur.

- **Validation stricte des entrées** : Les requêtes d'inscription et de connexion valident strictement les champs (email, mot de passe, etc.) côté backend.

- **Pas de mot de passe en clair** : Les réponses API ne retournent jamais le mot de passe ou son hash.

- **Logs** : Les logs d'erreur côté serveur n'exposent pas d'informations sensibles en production.

