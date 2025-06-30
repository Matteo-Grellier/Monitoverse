import React from "react";
import { List, Datagrid, TextField, EmailField, DateField } from "react-admin";

export const UserList = () => (
	<List>
		<Datagrid>
			<TextField source="id" />
			<TextField source="name" />
			<EmailField source="email" />
			<DateField source="createdAt" />
		</Datagrid>
	</List>
);
