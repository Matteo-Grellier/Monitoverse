import type { ReactNode } from "react";
import {
	Layout as RALayout,
	Menu,
	MenuItemLink,
	useSidebarState,
} from "react-admin";
import { useAuth } from "./components/AuthProvider";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Monitor, Terminal } from "lucide-react";

const CustomMenu = () => {
	const [open] = useSidebarState();
	return (
		<Menu>
			<MenuItemLink
				to="/monitoring"
				primaryText={open ? "Monitoring Dashboard" : ""}
				leftIcon={<Monitor size={20} />}
			/>
			<MenuItemLink
				to="/terminal"
				primaryText={open ? "Terminal" : ""}
				leftIcon={<Terminal size={20} />}
			/>
		</Menu>
	);
};

export const Layout = ({ children }: { children: ReactNode }) => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	return (
		<>
			<AppBar
				position="static"
				color="default"
				elevation={0}
				sx={{ mb: 2 }}
			>
				<Toolbar>
					<Box sx={{ flexGrow: 1 }} />
					{user && (
						<Button
							color="inherit"
							onClick={() => {
								logout();
								navigate("/login");
							}}
							sx={{ ml: 2 }}
						>
							Sign Out
						</Button>
					)}
				</Toolbar>
			</AppBar>
			<RALayout menu={CustomMenu}>{children}</RALayout>
		</>
	);
};
