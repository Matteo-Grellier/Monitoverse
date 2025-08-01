import React, { useState } from "react";
import { Admin, Resource } from "react-admin";
import { Layout } from "./Layout";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { AuthPage } from "./components/AuthPage";
import { UserProfile } from "./components/UserProfile";
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Dialog,
	IconButton,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { MonitoringDashboard } from "./components/MonitoringDashboard";
import { TerminalDashboard } from "./components/TerminalDashboard";
import dataProvider from "./dataProvider";

const CustomAppBar: React.FC<{
	onProfile: () => void;
	onLogout: () => void;
}> = ({ onProfile, onLogout }) => (
	<AppBar position="static">
		<Toolbar>
			<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
				Monitoverse
			</Typography>
			<IconButton color="inherit" onClick={onProfile}>
				<AccountCircle />
			</IconButton>
			<Button color="inherit" onClick={onLogout}>
				Logout
			</Button>
		</Toolbar>
	</AppBar>
);

const AppContent: React.FC = () => {
	const { user, logout } = useAuth();
	const [profileOpen, setProfileOpen] = useState(false);

	if (!user) {
		return <AuthPage />;
	}

	return (
		<>
			<CustomAppBar
				onProfile={() => setProfileOpen(true)}
				onLogout={logout}
			/>
			<Dialog
				open={profileOpen}
				onClose={() => setProfileOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<UserProfile />
			</Dialog>
			<Admin dataProvider={dataProvider} layout={Layout}>
				<Resource name="monitoring" list={MonitoringDashboard} />
				<Resource name="terminal" list={TerminalDashboard} />
			</Admin>
		</>
	);
};

export const App = () => (
	<AuthProvider>
		<AppContent />
	</AuthProvider>
);
