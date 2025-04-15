import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Legend } from "recharts";

export const DiskChart = () => {
	const [data, setData] = useState<{ name: string; value: number }[]>([]);

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:8080/monitoring/disk");

		ws.onmessage = (event) => {
			// The server should send something like: {"\/": 42.1, "\/home": 78.3}
			const usageMap = JSON.parse(event.data);

			// Convert that map into an array for Recharts: [{ name: '/', value: 42.1 }, ...]
			const newData = Object.entries(usageMap).map(([mount, usage]) => ({
				name: mount,
				value: usage as number,
			}));

			setData(newData);
		};

		// Close the WebSocket on unmount
		return () => {
			ws.close();
		};
	}, []);

	return (
		<PieChart width={400} height={400}>
			<Pie
				data={data}
				dataKey="value"
				nameKey="name"
				cx="50%"
				cy="50%"
				outerRadius={100}
				label
			/>
			<Tooltip />
			<Legend />
		</PieChart>
	);
};
