import React, { useEffect, useRef, useState } from "react";
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
import { getToken } from "./AuthProvider";

const WS_BASE = import.meta.env.VITE_WS_BASE || "ws://localhost:8081";

function useMonitoringWS(endpoint: string) {
	const [data, setData] = useState<{ index: number; value: number }[]>([]);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const token = getToken();
		const ws = new WebSocket(
			`${WS_BASE}${endpoint}${token ? `?token=${token}` : ""}`
		);
		wsRef.current = ws;
		ws.onmessage = event => {
			const value = JSON.parse(event.data);
			setData(prev => {
				const next = [
					...prev.slice(-49),
					{
						index:
							prev.length > 0
								? prev[prev.length - 1].index + 1
								: 0,
						value: typeof value === "number" ? value : 0,
					},
				];
				return next;
			});
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
		{ index: number; root: number; home: number }[]
	>([]);
	useEffect(() => {
		const token = getToken();
		const ws = new WebSocket(
			`${WS_BASE}/monitoring/disk${token ? `?token=${token}` : ""}`
		);
		ws.onmessage = event => {
			const value = JSON.parse(event.data);
			setDiskData(prev => {
				const next = [
					...prev.slice(-49),
					{
						index:
							prev.length > 0
								? prev[prev.length - 1].index + 1
								: 0,
						root: value["/"] ?? 0,
						home: value["/home"] ?? 0,
					},
				];
				return next;
			});
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
					<XAxis
						dataKey="index"
						label={{
							value: "Time",
							position: "insideBottomRight",
							offset: 0,
						}}
						tick={false}
					/>
					<YAxis domain={[0, 100]} />
					<Tooltip />
					<Legend />
					<Line
						type="monotone"
						dataKey="value"
						stroke="#8884d8"
						name="CPU %"
						dot={false}
						isAnimationActive={false}
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
					<XAxis
						dataKey="index"
						label={{
							value: "Time",
							position: "insideBottomRight",
							offset: 0,
						}}
						tick={false}
					/>
					<YAxis domain={[0, 100]} />
					<Tooltip />
					<Legend />
					<Line
						type="monotone"
						dataKey="value"
						stroke="#82ca9d"
						name="Memory %"
						dot={false}
						isAnimationActive={false}
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
					<XAxis
						dataKey="index"
						label={{
							value: "Time",
							position: "insideBottomRight",
							offset: 0,
						}}
						tick={false}
					/>
					<YAxis domain={[0, 100]} />
					<Tooltip />
					<Legend />
					<Line
						type="monotone"
						dataKey="root"
						stroke="#ff7300"
						name="/"
						dot={false}
						isAnimationActive={false}
					/>
					<Line
						type="monotone"
						dataKey="home"
						stroke="#387908"
						name="/home"
						dot={false}
						isAnimationActive={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};
