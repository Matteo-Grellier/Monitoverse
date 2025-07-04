import {
	List,
	DataTable,
	ReferenceField,
	EditButton,
	Edit,
	ReferenceInput,
	SimpleForm,
	TextInput,
} from "react-admin";

export const PostList = () => (
	<List>
		<DataTable rowClick={false}>
			<DataTable.Col source="id" />
			<DataTable.Col source="userId">
				<ReferenceField source="userId" reference="users" link="show" />
			</DataTable.Col>
			<DataTable.Col source="title" />
			<DataTable.Col>
				<EditButton />
			</DataTable.Col>
		</DataTable>
	</List>
);
export const PostEdit = () => (
	<Edit>
		<SimpleForm>
			<ReferenceInput source="userId" reference="users" />
			<TextInput source="id" InputProps={{ disabled: true }} />
			<TextInput source="title" />
			<TextInput source="body" multiline rows={5} />
		</SimpleForm>
	</Edit>
);
