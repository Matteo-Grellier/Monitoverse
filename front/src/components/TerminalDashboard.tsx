import { useEffect, useRef, useState } from "react";
import {
	Box,
	TextField,
	Paper,
	Typography,
	Divider,
	IconButton,
	Alert,
	Chip,
} from "@mui/material";
import { PlayArrow, Clear, History } from "@mui/icons-material";

const WS_BASE = import.meta.env.VITE_WS_BASE || "ws://localhost:8081";

interface TerminalCommand {
	id: string;
	command: string;
	output: string;
	error: string;
	status: number;
	time: number;
	useSudo?: boolean;

}

interface TerminalMessage {
	type: string;
	command?: TerminalCommand;
	history?: TerminalCommand[];
}

export const TerminalDashboard = () => {
	const [command, setCommand] = useState("");
	const [history, setHistory] = useState<TerminalCommand[]>([]);
	const [currentCommand, setCurrentCommand] =
		useState<TerminalCommand | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [useSudo, setUseSudo] = useState(false);

	const wsRef = useRef<WebSocket | null>(null);
	const outputRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ws = new WebSocket(`${WS_BASE}/terminal`);
		wsRef.current = ws;

		ws.onopen = () => {
			setIsConnected(true);
			setError(null);
		};

		ws.onmessage = event => {
			const message: TerminalMessage = JSON.parse(event.data);

			switch (message.type) {
				case "history":
					if (message.history) {
						setHistory(message.history);
					}
					break;
				case "partial":
					if (message.command) {
						setCurrentCommand(message.command);
					}
					break;
				case "result":
					if (message.command) {
						setCurrentCommand(null);
						setHistory(prev => [...prev, message.command!]);
						setCommand("");
					}
					break;
				case "error":
					if (message.command) {
						setCurrentCommand(null);
						setHistory(prev => [...prev, message.command!]);
						setCommand("");
						setError(message.command.error);
					}
					break;
			}
		};

		ws.onclose = () => {
			setIsConnected(false);
			setError("Connection lost. Please refresh the page.");
		};

		ws.onerror = () => {
			setIsConnected(false);
			setError("Failed to connect to terminal service.");
		};

		return () => {
			ws.close();
		};
	}, []);

	useEffect(() => {
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight;
		}
	}, [history, currentCommand]);

	const executeCommand = () => {
		if (!command.trim() || !isConnected) return;

		const cmd: TerminalCommand = {
			id: Date.now().toString(),
			command: command.trim(),
			output: "",
			error: "",
			status: 0,
			time: Date.now(),
			useSudo,

		};

		const message: TerminalMessage = {
			type: "execute",
			command: cmd,
		};

		wsRef.current?.send(JSON.stringify(message));
		setCurrentCommand(cmd);
	};

	const clearHistory = () => {
		setHistory([]);
	};

	const formatTime = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleTimeString();
	};

	const getStatusColor = (status: number): "success" | "error" => {
		return status === 0 ? "success" : "error";
	};

	return (
		<Box
			sx={{
				padding: 3,
				height: "100vh",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Typography variant="h4" gutterBottom>
				Terminal Dashboard
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
				<Chip
					label={isConnected ? "Connected" : "Disconnected"}
					color={isConnected ? "success" : "error"}
					size="small"
				/>
				<Typography variant="body2" color="text.secondary">
					Execute shell commands and see real-time results
				</Typography>
			</Box>

			<Paper sx={{ p: 2, mb: 2 }}>
				<Box
					sx={{
						display: "flex",
						gap: 2,
						alignItems: "center",
						mb: 2,
					}}
				>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: 4,
						}}
					>
						<input
							type="checkbox"
							checked={useSudo}
							onChange={e => setUseSudo(e.target.checked)}
							style={{ marginRight: 4 }}
						/>
						Run as sudo
					</label>
				</Box>

				<Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ minWidth: 80 }}
					>
						$
					</Typography>
					<TextField
						fullWidth
						variant="outlined"
						size="small"
						placeholder="Enter command (e.g., ls -la, ps aux, df -h)"
						value={command}
						onChange={e => setCommand(e.target.value)}
						onKeyPress={e => {
							if (e.key === "Enter") {
								executeCommand();
							}
						}}
						disabled={!isConnected}
					/>
					<IconButton
						onClick={executeCommand}
						disabled={!command.trim() || !isConnected}
						color="primary"
					>
						<PlayArrow />
					</IconButton>
					<IconButton onClick={clearHistory} color="secondary">
						<Clear />
					</IconButton>
				</Box>
			</Paper>

			<Paper
				sx={{
					flex: 1,
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
					<Typography
						variant="h6"
						sx={{ display: "flex", alignItems: "center", gap: 1 }}
					>
						<History />
						Command History
					</Typography>
				</Box>

				<Box
					ref={outputRef}
					sx={{
						flex: 1,
						overflow: "auto",
						p: 2,
						backgroundColor: "#1e1e1e",
						color: "#ffffff",
						fontFamily: "monospace",
						fontSize: "14px",
						lineHeight: 1.4,
					}}
				>
					{history.length === 0 && !currentCommand && (
						<Typography
							color="text.secondary"
							sx={{ fontStyle: "italic" }}
						>
							No commands executed yet. Try running a command
							above.
						</Typography>
					)}

					{history.map((cmd, index) => (
						<Box key={cmd.id} sx={{ mb: 2 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
									mb: 1,
								}}
							>
								<Typography
									variant="body2"
									sx={{
										color: "#00ff00",
										fontWeight: "bold",
										minWidth: 120,
									}}
								>
									[{formatTime(cmd.time)}]
								</Typography>
								<Typography
									variant="body2"
									sx={{
										color: "#ffaa00",
										fontWeight: "bold",
									}}
								>
									$ {cmd.command}
								</Typography>
								<Chip
									label={
										cmd.status === 0 ? "SUCCESS" : "ERROR"
									}
									color={getStatusColor(cmd.status)}
									size="small"
									sx={{ height: 20, fontSize: "10px" }}
								/>
							</Box>

							{cmd.output && (
								<Box
									sx={{
										backgroundColor: "#2d2d2d",
										p: 1,
										borderRadius: 1,
										mb: 1,
										whiteSpace: "pre-wrap",
									}}
								>
									{cmd.output}
								</Box>
							)}

							{cmd.error && (
								<Box
									sx={{
										backgroundColor: "#3d1f1f",
										p: 1,
										borderRadius: 1,
										color: "#ff6b6b",
										whiteSpace: "pre-wrap",
									}}
								>
									{cmd.error}
								</Box>
							)}

							{index < history.length - 1 && (
								<Divider sx={{ my: 1 }} />
							)}
						</Box>
					))}

					{currentCommand && (
						<Box sx={{ mb: 2 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
									mb: 1,
								}}
							>
								<Typography
									variant="body2"
									sx={{
										color: "#00ff00",
										fontWeight: "bold",
										minWidth: 120,
									}}
								>
									[{formatTime(currentCommand.time)}]
								</Typography>
								<Typography
									variant="body2"
									sx={{
										color: "#ffaa00",
										fontWeight: "bold",
									}}
								>
									$ {currentCommand.command}
								</Typography>
								<Chip
									label="RUNNING"
									color="warning"
									size="small"
									sx={{ height: 20, fontSize: "10px" }}
								/>
							</Box>

							{currentCommand.output && (
								<Box
									sx={{
										backgroundColor: "#2d2d2d",
										p: 1,
										borderRadius: 1,
										whiteSpace: "pre-wrap",
									}}
								>
									{currentCommand.output}
								</Box>
							)}
						</Box>
					)}
				</Box>
			</Paper>
		</Box>
	);
};
