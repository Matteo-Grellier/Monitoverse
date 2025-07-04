import type { ReactNode } from "react";
import { Layout as RALayout, Menu, MenuItemLink } from "react-admin";

const CustomMenu = () => (
	<Menu>
		<MenuItemLink to="/monitoring" primaryText="Monitoring Dashboard" />
	</Menu>
);

export const Layout = ({ children }: { children: ReactNode }) => (
	<RALayout menu={CustomMenu}>{children}</RALayout>
);
