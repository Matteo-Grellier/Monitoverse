import { useEffect, useState } from "react";

export const CPUChart = () => {
	const [cpuUsage, setCpuUsage] = useState(0);

	useEffect(() => {
		// Create a new WebSocket connection to your Go backend
		const ws = new WebSocket("ws://localhost:8080/monitoring/cpu");

		// When the connection is established
		ws.onopen = () => {

		};

		// When a message is received
		ws.onmessage = (event) => {
			console.log("Received data:", event.data);
			setCpuUsage(Number(event.data)); // event.data is the raw message as a string
		};

		// When the socket closes

		// Clean up the WebSocket connection when the component unmounts
		return () => {
			ws.close();
		};
	}, []);

	return (
		<div>
			<h2>CPU Usage</h2>
			<p>{cpuUsage}%</p>
		</div>
	);
};
