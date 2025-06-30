import React from "react";
import { List, Datagrid, TextField, DateField } from "react-admin";

export const PostList = () => (
	<List>
		<Datagrid>
			<TextField source="id" />
			<TextField source="title" />
			<TextField source="body" />
			<DateField source="createdAt" />
		</Datagrid>
	</List>
);
