import React, { useState } from "react";
import {
	Box,
	TextField,
	Button,
	Typography,
	Paper,
	Alert,
	CircularProgress,
	Link,
} from "@mui/material";
import { useAuth } from "./AuthProvider";

interface LoginFormProps {
	onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
	const { login, isLoading, error, clearError } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearError();

		if (!email || !password) {
			return;
		}

		await login(email, password);
	};

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				backgroundColor: "#f5f5f5",
			}}
		>
			<Paper
				elevation={3}
				sx={{
					padding: 4,
					width: "100%",
					maxWidth: 400,
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}}
			>
				<Typography
					variant="h4"
					component="h1"
					textAlign="center"
					gutterBottom
				>
					Login
				</Typography>

				{error && (
					<Alert severity="error" onClose={clearError}>
						{error}
					</Alert>
				)}

				<Box
					component="form"
					onSubmit={handleSubmit}
					sx={{ display: "flex", flexDirection: "column", gap: 2 }}
				>
					<TextField
						label="Email"
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
						fullWidth
						disabled={isLoading}
					/>

					<TextField
						label="Password"
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
						fullWidth
						disabled={isLoading}
					/>

					<Button
						type="submit"
						variant="contained"
						size="large"
						disabled={isLoading || !email || !password}
						sx={{ mt: 2 }}
					>
						{isLoading ? <CircularProgress size={24} /> : "Login"}
					</Button>
				</Box>

				<Box sx={{ textAlign: "center", mt: 2 }}>
					<Typography variant="body2">
						Don&apos;t have an account?{" "}
						<Link
							component="button"
							variant="body2"
							onClick={onSwitchToRegister}
							disabled={isLoading}
							sx={{ cursor: "pointer" }}
						>
							Register here
						</Link>
					</Typography>
				</Box>
			</Paper>
		</Box>
	);
};
