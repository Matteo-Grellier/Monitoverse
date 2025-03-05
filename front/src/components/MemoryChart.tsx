import { useEffect, useState } from "react";

export const MemoryChart = () => {
	const [memoryUsage, setMemoryUsage] = useState(0);

	useEffect(() => {
		// Create a new WebSocket connection to your Go backend
		const ws = new WebSocket("ws://localhost:8080/monitoring/memory");

		// When the connection is established
		ws.onopen = () => {

		};

		// When a message is received
		ws.onmessage = (event) => {
			console.log("Received data:", event.data);
			setMemoryUsage(Number(event.data)); // event.data is the raw message as a string
		};

		// When the socket closes

		// Clean up the WebSocket connection when the component unmounts
		return () => {
			ws.close();
		};
	}, []);

	return (
		<div>
			<h2>Memory Usage</h2>
			<p>{memoryUsage}%</p>
		</div>
	);
};
