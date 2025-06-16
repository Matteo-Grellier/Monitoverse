'use client';
import { Button, Center, FormControl, FormHelperText, FormLabel, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { CPUChart } from "@/components/CPUChart";
import { MemoryChart } from "@/components/MemoryChart";
import { DiskChart } from "@/components/DiskChart";

export default function Home() {
	const [totpCode, setTotpCode] = useState('');
	const [key, setKey] = useState('');
	const [codeStatus, setCodeStatus] = useState('');

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

	async function submitTOTP() {
		try {
			const res = await fetch('http://localhost:8080/totp/get', {
				method: 'POST', // or PUT, depending on your API
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					Key: key, // Include the TOTP code here
				}),
			});

			const data = await res.json();
			setCodeStatus(data.codeStatus);
			console.log(data);
		} catch (error) {
			console.error('Error fetching TOTP:', error);
		}
	}

	return (
		<Center h="1000px" w="1000px">
			<HStack>
				<VStack>
					{totpCode ? <QRCodeSVG value={totpCode} /> : <Text> No TOTP code generated yet </Text>}
					<Text style={styles.totp}>{totpCode}</Text>
				</VStack>
				<VStack>
					<Button onClick={fetchTOTP}>
						<Text>euuuh</Text>
					</Button>
				</VStack>
				<VStack>
					<CPUChart />
					<MemoryChart />
				</VStack>
				<FormControl>
					<FormLabel>Insert TOTP generated code</FormLabel>
					<Input value={key} onChange={e => { setKey(e.currentTarget.value) }} />
					<FormHelperText>Email pls</FormHelperText>
					<Button onClick={submitTOTP}>Submit</Button>
				</FormControl>
				<Text>{codeStatus}</Text>
			</HStack>
		</Center>
	);
}

const styles = {
	totp: {
		fontSize: "10px",
	},
};
