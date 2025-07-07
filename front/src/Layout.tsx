import type { ReactNode } from "react";
import { Layout as RALayout, Menu, MenuItemLink } from "react-admin";
import { useAuth } from "./components/AuthProvider";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CustomMenu = () => (
	<Menu>
		<MenuItemLink to="/monitoring" primaryText="Monitoring Dashboard" />
	</Menu>
);

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
