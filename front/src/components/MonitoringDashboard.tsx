import React, { useEffect, useRef, useState } from "react";
import { List, Datagrid, TextField, DateField } from "react-admin";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

const WS_BASE =
	(window.location.protocol === "https:" ? "wss://" : "ws://") +
	window.location.host;

function useMonitoringWS(endpoint: string) {
	const [data, setData] = useState<{ timestamp: number; value: number }[]>(
		[]
	);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const ws = new WebSocket(`${WS_BASE}${endpoint}`);
		wsRef.current = ws;
		ws.onmessage = event => {
			const value = JSON.parse(event.data);
			setData(prev => [
				...prev.slice(-49),
				{
					timestamp: Date.now(),
					value: typeof value === "number" ? value : 0,
				},
			]);
		};
		return () => ws.close();
	}, [endpoint]);

	return data;
}

export const MonitoringDashboard = () => {
	const cpuData = useMonitoringWS("/monitoring/cpu");
	const memoryData = useMonitoringWS("/monitoring/memory");
	// Disk returns an object, so we need to handle it differently
	const [diskData, setDiskData] = useState<
		{ timestamp: number; root: number; home: number }[]
	>([]);
	useEffect(() => {
		const ws = new WebSocket(`${WS_BASE}/monitoring/disk`);
		ws.onmessage = event => {
			const value = JSON.parse(event.data);
			setDiskData(prev => [
				...prev.slice(-49),
				{
					timestamp: Date.now(),
					root: value["/"] ?? 0,
					home: value["/home"] ?? 0,
				},
			]);
		};
		return () => ws.close();
	}, []);

	return (
		<div style={{ padding: 24 }}>
			<h2>CPU Usage (%)</h2>
			<ResponsiveContainer width="100%" height={200}>
				<LineChart
					data={cpuData}
					margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="timestamp" tick={false} />
					<YAxis domain={[0, 100]} />
					<Tooltip />
					<Legend />
					<Line
						type="monotone"
						dataKey="value"
						stroke="#8884d8"
						name="CPU %"
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>

			<h2>Memory Usage (%)</h2>
			<ResponsiveContainer width="100%" height={200}>
				<LineChart
					data={memoryData}
					margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="timestamp" tick={false} />
					<YAxis domain={[0, 100]} />
					<Tooltip />
					<Legend />
					<Line
						type="monotone"
						dataKey="value"
						stroke="#82ca9d"
						name="Memory %"
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>

			<h2>Disk Usage (%)</h2>
			<ResponsiveContainer width="100%" height={200}>
				<LineChart
					data={diskData}
					margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="timestamp" tick={false} />
					<YAxis domain={[0, 100]} />
					<Tooltip />
					<Legend />
					<Line
						type="monotone"
						dataKey="root"
						stroke="#ff7300"
						name="/"
						dot={false}
					/>
					<Line
						type="monotone"
						dataKey="home"
						stroke="#387908"
						name="/home"
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>

			<List>
				<Datagrid>
					<TextField source="id" />
					<TextField source="metric" />
					<TextField source="value" />
					<DateField source="timestamp" />
				</Datagrid>
			</List>
		</div>
	);
};
