import { css } from '../styled-system/css';
import { flex } from '../styled-system/patterns';
import { button } from '../recipes/button'
import { useEffect, useState } from 'react';

function App() {
	const [test, settest] = useState();

	const printlog = () => {
		fetch('http://localhost:8080/temp')
			.then(response => response.json())
			.then(data => settest(data.temp))
	}

	const socket = new WebSocket("ws://localhost:8080")

	socket.addEventListener("open", () => { socket.send("connection established") })

	socket.addEventListener("message", event => {
		console.log("Message from server ", event.data)
	});

	useEffect(() => {
		console.log(test)
	}, [test])


	return (
		<div
			className={flex({
				justify: 'center',
				align: 'center',
				width: '100vw',
				height: '100vh',
				direction: 'column',
			})}
		>
			<div className={css({ fontSize: "2xl", fontWeight: 'bold' })}>
				Hello 🐼!
			</div>
			
			<button className={button({ visual: 'solid', size: 'lg' })} onClick={printlog}>
				Click Me
			</button>
			<div className={css({ fontSize: "2xl", fontWeight: 'bold' })}>
				{test}
			</div>
		</div>
	)
}

export default App
