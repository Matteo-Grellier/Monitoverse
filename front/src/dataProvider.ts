import { DataProvider } from "react-admin";

const API_BASE = "http://localhost:8081"; // relative to frontend, adjust if needed

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
	getList: async resource => {
		if (resource === "monitoring") {
			const res = await fetch(`${API_BASE}/monitoring/history`);
			if (!res.ok) throw new Error("Failed to fetch monitoring history");
			const data: MonitoringData[] = await res.json();
			// Flatten each MonitoringData into multiple rows: one per metric
			// Each MonitoringData: { id, timestamp, cpu, memory, disk_root, disk_home }
			const flat = data.flatMap((item: MonitoringData) => [
				{
					id: `${item.id}-cpu`,
					metric: "cpu",
					value: item.cpu,
					timestamp: new Date(item.timestamp * 1000).toISOString(),
				},
				{
					id: `${item.id}-memory`,
					metric: "memory",
					value: item.memory,
					timestamp: new Date(item.timestamp * 1000).toISOString(),
				},
				{
					id: `${item.id}-disk_root`,
					metric: "disk_root",
					value: item.disk_root,
					timestamp: new Date(item.timestamp * 1000).toISOString(),
				},
				{
					id: `${item.id}-disk_home`,
					metric: "disk_home",
					value: item.disk_home,
					timestamp: new Date(item.timestamp * 1000).toISOString(),
				},
			]) as MonitoringRecord[];
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return { data: flat, total: flat.length } as any;
		}
		throw new Error(`Unknown resource: ${resource}`);
	},
	// Implement stubs for other methods if needed
	getOne: () => Promise.reject("Not implemented"),
	getMany: () => Promise.reject("Not implemented"),
	getManyReference: () => Promise.reject("Not implemented"),
	update: () => Promise.reject("Not implemented"),
	updateMany: () => Promise.reject("Not implemented"),
	create: () => Promise.reject("Not implemented"),
	delete: () => Promise.reject("Not implemented"),
	deleteMany: () => Promise.reject("Not implemented"),
};

export { dataProvider };
