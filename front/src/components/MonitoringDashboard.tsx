import { useEffect, useRef, useState } from "react";
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
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const WS_BASE = "ws://localhost:8081";

function useMonitoringWS(endpoint: string, intervalMs: number) {
	const [data, setData] = useState<{ index: number; value: number }[]>([]);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const token = getToken();
		const qs = new URLSearchParams();
		if (token) qs.set("token", token);
		if (intervalMs) qs.set("interval_ms", String(intervalMs));
		const ws = new WebSocket(`${WS_BASE}${endpoint}?${qs.toString()}`);
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
	}, [endpoint, intervalMs]);

	return data;
}

export const MonitoringDashboard = () => {
	const [cpuInterval, setCpuInterval] = useState<number>(1000);
	const [memInterval, setMemInterval] = useState<number>(1000);
	const [diskInterval, setDiskInterval] = useState<number>(10000);

	const cpuData = useMonitoringWS("/monitoring/cpu", cpuInterval);
	const memoryData = useMonitoringWS("/monitoring/memory", memInterval);
	// Disk returns an object, so we need to handle it differently
	const [diskData, setDiskData] = useState<
		{ index: number; root: number; home: number }[]
	>([]);
	useEffect(() => {
		const token = getToken();
		const qs = new URLSearchParams();
		if (token) qs.set("token", token);
		if (diskInterval) qs.set("interval_ms", String(diskInterval));
		const ws = new WebSocket(`${WS_BASE}/monitoring/disk?${qs.toString()}`);
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
	}, [diskInterval]);

	return (
		<div style={{ padding: 24 }}>
			<div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
				<div style={{ display: "grid", gap: 4 }}>
					<Label htmlFor="cpu-interval">CPU refresh (ms)</Label>
					<Input
						id="cpu-interval"
						type="number"
						min={250}
						max={60000}
						step={250}
						value={cpuInterval}
						onChange={e =>
							setCpuInterval(
								Math.min(
									60000,
									Math.max(
										250,
										Number(e.target.value) || 1000
									)
								)
							)
						}
						style={{ width: 160 }}
					/>
				</div>
				<div style={{ display: "grid", gap: 4 }}>
					<Label htmlFor="mem-interval">Memory refresh (ms)</Label>
					<Input
						id="mem-interval"
						type="number"
						min={250}
						max={60000}
						step={250}
						value={memInterval}
						onChange={e =>
							setMemInterval(
								Math.min(
									60000,
									Math.max(
										250,
										Number(e.target.value) || 1000
									)
								)
							)
						}
						style={{ width: 160 }}
					/>
				</div>
				<div style={{ display: "grid", gap: 4 }}>
					<Label htmlFor="disk-interval">Disk refresh (ms)</Label>
					<Input
						id="disk-interval"
						type="number"
						min={1000}
						max={60000}
						step={500}
						value={diskInterval}
						onChange={e =>
							setDiskInterval(
								Math.min(
									60000,
									Math.max(
										1000,
										Number(e.target.value) || 10000
									)
								)
							)
						}
						style={{ width: 160 }}
					/>
				</div>
			</div>
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
