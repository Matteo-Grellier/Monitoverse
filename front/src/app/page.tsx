'use client';
import { Button, Center, Text } from "@chakra-ui/react";
import { useState } from "react";

export default function Home() {
	const [totpCode, setTotpCode] = useState('');

	async function fetchTOTP() {
	  try {
		const res = await fetch(
		  'http://localhost:8080/totp/generate/' +
			new URLSearchParams({ TotpEmail: 'matt@gmail.com' })
		);
		const data = await res.json();
		setTotpCode(data.totp);
	  } catch (error) {
		console.error('Error fetching TOTP:', error);
	  }
	}

	return (
		<Center h="1000px" w="1000px">
			<Button onClick={fetchTOTP}>
				<Text>euuuh</Text>
			</Button>
			<Text style={styles.totp}>{totpCode}</Text>
		</Center>
	);
}

const styles = {
	totp: {
		fontSize: "50px",
	},
};
