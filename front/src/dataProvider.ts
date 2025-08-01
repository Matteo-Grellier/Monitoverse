import { DataProvider } from "react-admin";

const API_BASE = "http://localhost:8081";

type MonitoringData = {
	id: number;
	timestamp: number;
	cpu: number;
	memory: number;
	disk_root: number;
	disk_home: number;
};

type MonitoringRecord = {
	id: string;
	metric: string;
	value: number;
	timestamp: string;
};

const dataProvider: DataProvider = {
	async getList(resource) {
		if (resource === "monitoring") {
			const res = await fetch(`${API_BASE}/monitoring/history`);
			if (!res.ok) throw new Error("Failed to fetch monitoring history");
			const data: MonitoringData[] = await res.json();
			const flat: MonitoringRecord[] = data.flatMap(
				(item: MonitoringData) => [
					{
						id: `${item.id}-cpu`,
						metric: "cpu",
						value: item.cpu,
						timestamp: new Date(
							item.timestamp * 1000
						).toISOString(),
					},
					{
						id: `${item.id}-memory`,
						metric: "memory",
						value: item.memory,
						timestamp: new Date(
							item.timestamp * 1000
						).toISOString(),
					},
					{
						id: `${item.id}-disk_root`,
						metric: "disk_root",
						value: item.disk_root,
						timestamp: new Date(
							item.timestamp * 1000
						).toISOString(),
					},
					{
						id: `${item.id}-disk_home`,
						metric: "disk_home",
						value: item.disk_home,
						timestamp: new Date(
							item.timestamp * 1000
						).toISOString(),
					},
				]
			);
			return { data: flat, total: flat.length } as {
				data: MonitoringRecord[];
				total: number;
			} as { data: never[]; total: number };
		}
		throw new Error(`Unknown resource: ${resource}`);
	},
	getOne: () => Promise.reject("Not implemented"),
	getMany: () => Promise.reject("Not implemented"),
	getManyReference: () => Promise.reject("Not implemented"),
	update: () => Promise.reject("Not implemented"),
	updateMany: () => Promise.reject("Not implemented"),
	create: () => Promise.reject("Not implemented"),
	delete: () => Promise.reject("Not implemented"),
	deleteMany: () => Promise.reject("Not implemented"),
};

export default dataProvider;
