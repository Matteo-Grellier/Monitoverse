import React, { useState } from "react";
import {
	Box,
	Paper,
	Typography,
	Button,
	Avatar,
	Chip,
	Divider,
	Alert,
} from "@mui/material";
import { Security, LockOpen } from "@mui/icons-material";
import { useAuth } from "./AuthProvider";
import { TOTPSetup } from "./TOTPSetup";

export const UserProfile: React.FC = () => {
	const { user, logout } = useAuth();
	const [totpSetupOpen, setTotpSetupOpen] = useState(false);

	if (!user) {
		return null;
	}

	const handleLogout = () => {
		logout();
	};

	return (
		<Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
			<Paper elevation={3} sx={{ p: 3 }}>
				<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
					<Avatar
						sx={{
							width: 80,
							height: 80,
							bgcolor: "primary.main",
							fontSize: "2rem",
							mr: 2,
						}}
					>
						{user.name
							? user.name.charAt(0).toUpperCase()
							: user.email.charAt(0).toUpperCase()}
					</Avatar>
					<Box>
						<Typography variant="h5" component="h1" gutterBottom>
							{user.name || "User"}
						</Typography>
						<Typography variant="body1" color="text.secondary">
							{user.email}
						</Typography>
					</Box>
				</Box>

				<Divider sx={{ my: 2 }} />

				<Box sx={{ mb: 3 }}>
					<Typography variant="h6" gutterBottom>
						Security Settings
					</Typography>

					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 2,
							mb: 2,
						}}
					>
						<Typography variant="body1">
							Two-Factor Authentication:
						</Typography>
						<Chip
							icon={user.totp ? <Security /> : <LockOpen />}
							label={user.totp ? "Enabled" : "Disabled"}
							color={user.totp ? "success" : "default"}
							variant="outlined"
						/>
					</Box>

					{!user.totp && (
						<Alert severity="info" sx={{ mb: 2 }}>
							Enable two-factor authentication to add an extra
							layer of security to your account.
						</Alert>
					)}

					<Button
						variant={user.totp ? "outlined" : "contained"}
						onClick={() => setTotpSetupOpen(true)}
						startIcon={user.totp ? <LockOpen /> : <Security />}
					>
						{user.totp ? "Manage 2FA" : "Set Up 2FA"}
					</Button>
				</Box>

				<Divider sx={{ my: 2 }} />

				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="body2" color="text.secondary">
						User ID: {user.id}
					</Typography>
					<Button
						variant="outlined"
						color="error"
						onClick={handleLogout}
					>
						Logout
					</Button>
				</Box>
			</Paper>

			<TOTPSetup
				open={totpSetupOpen}
				onClose={() => setTotpSetupOpen(false)}
			/>
		</Box>
	);
};
