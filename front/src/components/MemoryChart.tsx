'use client';
import { useEffect, useState } from "react";
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

export const MemoryChart = () => {
	const initialData = Array.from({ length: 60 }, (_, i) => ({
		time: i,
		usage: 0
	}));
	const [data, setData] = useState(initialData);

	useEffect(() => {
		// Create a new WebSocket connection to your Go backend
		const ws = new WebSocket("ws://localhost:8080/monitoring/memory");

		// When the connection is established
		ws.onopen = () => {

		};

		// When a message is received
		ws.onmessage = (event) => {
			const usage = Number(event.data); // convert string to number

			setData((prevData) => {
				// Move all existing points 1 second to the left (time - 1)
				const shiftedData = prevData
					.map((d) => ({ time: d.time - 1, usage: d.usage }))
					// Filter out any that fell below time=0
					.filter((d) => d.time >= 0);

				// Add a new point at time=60 (the far right of our 60-second window)
				shiftedData.push({ time: 60, usage: usage });
				return shiftedData;
			});
		};

		// When the socket closes

		// Clean up the WebSocket connection when the component unmounts
		return () => {
			ws.close();
		};
	}, []);

	return (
		<LineChart width={600} height={300} data={data}>
			<CartesianGrid strokeDasharray="3 3" />
			{/* Fix the domain so it always stays 0 to 60 on the X-axis */}
			<XAxis
				dataKey="time"
				type="number"
				domain={[0, 60]}
				tickCount={7} // e.g., show ticks at 0, 10, 20, 30, 40, 50, 60
			/>
			{/* Fix the Y-axis so it always stays 0 to 100 */}
			<YAxis domain={[0, 100]} />
			<Tooltip />
			<Legend />
			{/* Draw the CPU usage line */}
			<Line
				type="monotone"
				dataKey="usage"
				dot={false}
				isAnimationActive={false}
			/>
		</LineChart>
	);
};
