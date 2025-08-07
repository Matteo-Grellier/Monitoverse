# Monitoverse

# Bloc 2

J'ai séparer la documentation en 2 parties:
- La documentation de la sécurité: [docs/Sécurité.md](docs/Sécurité.md)
- La documentation des tests unitaires: [docs/unitTests.md](docs/Tests_Unitaires.md)
- La documentation de la structure du projet: [docs/Structure.md](docs/Structure.md)

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

Pour lancer le projet, il faut utiliser le fichier makefile:
```bash
make dev
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
