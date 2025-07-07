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
import { TOTPSetup } from "./TOTPSetup";

interface RegisterFormProps {
	onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
	onSwitchToLogin,
}) => {
	const {
		register,
		isLoading,
		error,
		clearError,
		totpSetupRequired,
		setTotpSetupRequired,
		pendingRegistrationEmail,
		setPendingRegistrationEmail,
	} = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");

	const validatePassword = (password: string, confirmPassword: string) => {
		if (password.length < 6) {
			return "Password must be at least 6 characters long";
		}
		if (password !== confirmPassword) {
			return "Passwords do not match";
		}
		return "";
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearError();
		setPasswordError("");

		if (!name || !email || !password || !confirmPassword) {
			return;
		}

		const validationError = validatePassword(password, confirmPassword);
		if (validationError) {
			setPasswordError(validationError);
			return;
		}

		await register(name, email, password);
	};

	const handleTOTPSetupClose = () => {
		setTotpSetupRequired(false);
		setPendingRegistrationEmail(null);
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
					Register
				</Typography>

				{error && (
					<Alert severity="error" onClose={clearError}>
						{error}
					</Alert>
				)}

				{passwordError && (
					<Alert
						severity="error"
						onClose={() => setPasswordError("")}
					>
						{passwordError}
					</Alert>
				)}

				<Box
					component="form"
					onSubmit={handleSubmit}
					sx={{ display: "flex", flexDirection: "column", gap: 2 }}
				>
					<TextField
						label="Full Name"
						value={name}
						onChange={e => setName(e.target.value)}
						required
						fullWidth
						disabled={isLoading}
					/>

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
						helperText="Password must be at least 6 characters long"
					/>

					<TextField
						label="Confirm Password"
						type="password"
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
						required
						fullWidth
						disabled={isLoading}
					/>

					<Button
						type="submit"
						variant="contained"
						size="large"
						disabled={
							isLoading ||
							!name ||
							!email ||
							!password ||
							!confirmPassword
						}
						sx={{ mt: 2 }}
					>
						{isLoading ? (
							<CircularProgress size={24} />
						) : (
							"Register"
						)}
					</Button>
				</Box>

				<Box sx={{ textAlign: "center", mt: 2 }}>
					<Typography variant="body2">
						Already have an account?{" "}
						<Link
							component="button"
							variant="body2"
							onClick={onSwitchToLogin}
							disabled={isLoading}
							sx={{ cursor: "pointer" }}
						>
							Login here
						</Link>
					</Typography>
				</Box>
			</Paper>

			{totpSetupRequired && (
				<TOTPSetup
					open={totpSetupRequired}
					onClose={handleTOTPSetupClose}
					email={pendingRegistrationEmail}
				/>
			)}
		</Box>
	);
};
