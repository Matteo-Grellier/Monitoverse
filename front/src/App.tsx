import { Admin, EditGuesser, Resource, ShowGuesser } from "react-admin";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { UserList } from "./users";

import { PostList } from "./posts";

export const App = () => (
	<Admin dataProvider={dataProvider} layout={Layout}>
		<Resource name="posts" list={PostList} edit={EditGuesser} />

		<Resource name="users" list={UserList} show={ShowGuesser} />
	</Admin>
);
