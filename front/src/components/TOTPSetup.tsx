import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Button,
	Typography,
	Alert,
	CircularProgress,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import { useAuth } from "./AuthProvider";

const API_BASE_URL = "http://localhost:8081";

interface TOTPSetupProps {
	open: boolean;
	onClose: () => void;
}

export const TOTPSetup: React.FC<TOTPSetupProps> = ({ open, onClose }) => {
	const { user } = useAuth();
	const [qrCode, setQrCode] = useState<string>("");
	const [secret, setSecret] = useState<string>("");
	const [verificationCode, setVerificationCode] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [error, setError] = useState<string>("");
	const [success, setSuccess] = useState<string>("");

	const generateTOTP = useCallback(async () => {
		if (!user?.email) return;

		setIsGenerating(true);
		setError("");
		setSuccess("");

		try {
			const response = await fetch(`${API_BASE_URL}/totp/generate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: user.email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to generate TOTP");
			}

			setQrCode(data.qr_code);
			setSecret(data.secret);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to generate TOTP"
			);
		} finally {
			setIsGenerating(false);
		}
	}, [user?.email]);

	useEffect(() => {
		if (open && user?.email) {
			generateTOTP();
		}
	}, [open, user?.email, generateTOTP]);

	const verifyTOTP = async () => {
		if (!user?.email || !verificationCode) return;

		setIsVerifying(true);
		setError("");
		setSuccess("");

		try {
			const response = await fetch(`${API_BASE_URL}/totp/verify`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ key: verificationCode }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Verification failed");
			}

			if (data.valid) {
				setSuccess("TOTP verification successful!");
				// Enable TOTP for the user
				await enableTOTP();
			} else {
				setError("Invalid verification code");
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Verification failed"
			);
		} finally {
			setIsVerifying(false);
		}
	};

	const enableTOTP = async () => {
		if (!user?.email) return;

		try {
			const response = await fetch(
				`${API_BASE_URL}/totp/enable?email=${user.email}`,
				{
					method: "POST",
				}
			);

			if (!response.ok) {
				throw new Error("Failed to enable TOTP");
			}
		} catch (err) {
			console.error(err);
			setError("Failed to enable TOTP");
		}
	};

	const handleClose = () => {
		setQrCode("");
		setSecret("");
		setVerificationCode("");
		setError("");
		setSuccess("");
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
			<DialogContent>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						mt: 1,
					}}
				>
					{error && (
						<Alert severity="error" onClose={() => setError("")}>
							{error}
						</Alert>
					)}

					{success && (
						<Alert
							severity="success"
							onClose={() => setSuccess("")}
						>
							{success}
						</Alert>
					)}

					{isGenerating ? (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								p: 3,
							}}
						>
							<CircularProgress />
						</Box>
					) : qrCode ? (
						<>
							<Typography variant="body1" gutterBottom>
								Scan this QR code with your authenticator app
								(Google Authenticator, Authy, etc.):
							</Typography>

							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									mb: 2,
								}}
							>
								<img
									src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
									alt="TOTP QR Code"
									style={{
										border: "1px solid #ddd",
										borderRadius: "4px",
									}}
								/>
							</Box>

							<Typography
								variant="body2"
								color="text.secondary"
								gutterBottom
							>
								Or manually enter this secret key:{" "}
								<code>{secret}</code>
							</Typography>

							<Typography variant="body1" gutterBottom>
								Enter the 6-digit code from your authenticator
								app to verify:
							</Typography>

							<TextField
								label="Verification Code"
								value={verificationCode}
								onChange={e =>
									setVerificationCode(e.target.value)
								}
								inputProps={{ maxLength: 6 }}
								fullWidth
								disabled={isVerifying}
							/>

							<Button
								variant="contained"
								onClick={verifyTOTP}
								disabled={
									isVerifying || verificationCode.length !== 6
								}
								sx={{ mt: 1 }}
							>
								{isVerifying ? (
									<CircularProgress size={24} />
								) : (
									"Verify Code"
								)}
							</Button>
						</>
					) : (
						<Typography variant="body1" textAlign="center">
							Loading TOTP setup...
						</Typography>
					)}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
};
