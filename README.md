# Monitoverse

A comprehensive monitoring and terminal management system built with Go backend and React frontend.

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
- Secure session management

## Architecture

- **Backend**: Go with Gin framework
- **Frontend**: React with Material-UI
- **Database**: SQLite
- **Real-time**: WebSocket connections
- **Authentication**: JWT + TOTP

## Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+ or Bun
- Docker (optional)

### Backend Setup

```bash
cd back
go mod download
go run main.go
```

The backend will start on `http://localhost:8081`

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

### Example Commands

```bash
# System information
uname -a
cat /etc/os-release

# Process monitoring
ps aux
top -n 1

# Disk usage
df -h
du -sh /*

# Network information
ip addr
netstat -tuln

# System logs
journalctl --no-pager -n 20
```

### Security Considerations

- Commands are executed with the same permissions as the backend process
- Consider implementing command whitelisting for production use
- Monitor command history for security auditing
- Implement user-based access controls if needed

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
- `POST /auth/totp/setup` - TOTP setup
- `POST /auth/totp/verify` - TOTP verification

## Development

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