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
import { TextField as MuiTextField } from "@mui/material";

interface LoginFormProps {
	onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
	const {
		login,
		loginWithTOTP,
		isLoading,
		error,
		clearError,
		totpRequired,
		pendingLogin,
	} = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [totp, setTotp] = useState("");
	const [totpError, setTotpError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearError();

		if (!email || !password) {
			return;
		}

		await login(email, password);
	};

	const handleTOTPSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setTotpError("");
		if (!pendingLogin || !totp) return;
		const ok = await loginWithTOTP(
			pendingLogin.email,
			pendingLogin.password,
			totp
		);
		if (!ok) {
			setTotpError("Invalid TOTP code");
			clearError();
		}
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
				{totpError && (
					<Alert severity="error" onClose={() => setTotpError("")}>
						{totpError}
					</Alert>
				)}

				{totpRequired ? (
					<Box
						component="form"
						onSubmit={handleTOTPSubmit}
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
					>
						<MuiTextField
							label="TOTP Code"
							type="text"
							value={totp}
							onChange={e => setTotp(e.target.value)}
							inputProps={{ maxLength: 6 }}
							required
							disabled={isLoading}
							fullWidth
						/>
						<Button
							type="submit"
							variant="contained"
							size="large"
							disabled={isLoading || !totp}
							sx={{ mt: 2 }}
						>
							{isLoading ? (
								<CircularProgress size={24} />
							) : (
								"Verify TOTP"
							)}
						</Button>
					</Box>
				) : (
					<Box
						component="form"
						onSubmit={handleSubmit}
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
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
							{isLoading ? (
								<CircularProgress size={24} />
							) : (
								"Login"
							)}
						</Button>
					</Box>
				)}

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
