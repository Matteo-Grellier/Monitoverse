import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Admin, EditGuesser, Resource, ShowGuesser } from "react-admin";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { UserList } from "./users.tsx";
import { PostList } from "./posts.tsx";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { AuthPage } from "./components/AuthPage";
import { UserProfile } from "./components/UserProfile";
import { Box, AppBar, Toolbar, Typography, Button } from "@mui/material";

const AppContent: React.FC = () => {
	const { user, logout } = useAuth();

	if (!user) {
		return <AuthPage />;
	}

	return (
		<Router>
			<Box sx={{ flexGrow: 1 }}>
				<AppBar position="static">
					<Toolbar>
						<Typography
							variant="h6"
							component="div"
							sx={{ flexGrow: 1 }}
						>
							Monitoverse
						</Typography>
						<Button color="inherit" component="a" href="/profile">
							Profile
						</Button>
						<Button color="inherit" onClick={logout}>
							Logout
						</Button>
					</Toolbar>
				</AppBar>

				<Routes>
					<Route path="/profile" element={<UserProfile />} />
					<Route
						path="/"
						element={
							<Admin dataProvider={dataProvider} layout={Layout}>
								<Resource
									name="posts"
									list={PostList}
									edit={EditGuesser}
								/>
								<Resource
									name="users"
									list={UserList}
									show={ShowGuesser}
								/>
							</Admin>
						}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Box>
		</Router>
	);
};

export const App = () => (
	<AuthProvider>
		<AppContent />
	</AuthProvider>
);
