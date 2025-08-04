import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TerminalDashboard } from "./TerminalDashboard";

// Mock the AuthProvider
vi.mock("./AuthProvider", () => ({
	getToken: vi.fn(() => "mock-token"),
}));

// Mock WebSocket
const mockWebSocket = {
	send: vi.fn(),
	close: vi.fn(),
	onopen: null as (() => void) | null,
	onmessage: null as ((event: { data: string }) => void) | null,
	onclose: null as (() => void) | null,
	onerror: null as (() => void) | null,
	readyState: 0,
};

global.WebSocket = vi.fn(() => mockWebSocket) as unknown as typeof WebSocket;

// Helper function to safely get button element
const getButtonByTestId = (testId: string): HTMLButtonElement => {
	const button = screen.getByTestId(testId).closest("button");
	if (!button) {
		throw new Error(`Button with test-id ${testId} not found`);
	}
	return button;
};

describe("TerminalDashboard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset WebSocket mock
		mockWebSocket.onopen = null;
		mockWebSocket.onmessage = null;
		mockWebSocket.onclose = null;
		mockWebSocket.onerror = null;
		mockWebSocket.readyState = 0;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Frontend UI Tests", () => {
		it("should render the terminal dashboard with all UI elements", () => {
			render(<TerminalDashboard />);

			// Check main title
			expect(screen.getByText("Terminal Dashboard")).toBeInTheDocument();

			// Check connection status
			expect(screen.getByText("Disconnected")).toBeInTheDocument();

			// Check description
			expect(
				screen.getByText(
					"Execute shell commands and see real-time results"
				)
			).toBeInTheDocument();

			// Check command input
			expect(
				screen.getByPlaceholderText(
					"Enter command (e.g., ls -la, ps aux, df -h)"
				)
			).toBeInTheDocument();

			// Check sudo checkbox
			expect(screen.getByText("Run as sudo")).toBeInTheDocument();
			expect(screen.getByRole("checkbox")).toBeInTheDocument();

			// Check buttons (using test-id since they're icon buttons)
			expect(screen.getByTestId("PlayArrowIcon")).toBeInTheDocument();
			expect(screen.getByTestId("ClearIcon")).toBeInTheDocument();

			// Check command history section
			expect(screen.getByText("Command History")).toBeInTheDocument();
			expect(
				screen.getByText(
					"No commands executed yet. Try running a command above."
				)
			).toBeInTheDocument();
		});

		it("should handle command input changes", () => {
			render(<TerminalDashboard />);

			const input = screen.getByPlaceholderText(
				"Enter command (e.g., ls -la, ps aux, df -h)"
			);
			fireEvent.change(input, { target: { value: "ls -la" } });

			expect(input).toHaveValue("ls -la");
		});

		it("should handle sudo checkbox toggle", () => {
			render(<TerminalDashboard />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).not.toBeChecked();

			fireEvent.click(checkbox);
			expect(checkbox).toBeChecked();

			fireEvent.click(checkbox);
			expect(checkbox).not.toBeChecked();
		});

		it("should disable execute button when disconnected and no command", () => {
			render(<TerminalDashboard />);

			const executeButton = getButtonByTestId("PlayArrowIcon");
			expect(executeButton).toBeDisabled();
		});

		it("should enable execute button when connected and command entered", async () => {
			render(<TerminalDashboard />);

			// Simulate WebSocket connection
			await waitFor(() => {
				if (mockWebSocket.onopen) {
					mockWebSocket.onopen();
				}
			});

			const input = screen.getByPlaceholderText(
				"Enter command (e.g., ls -la, ps aux, df -h)"
			);
			fireEvent.change(input, { target: { value: "ls" } });

			await waitFor(() => {
				expect(screen.getByText("Connected")).toBeInTheDocument();
			});

			const executeButton = getButtonByTestId("PlayArrowIcon");
			expect(executeButton).not.toBeDisabled();
		});

		it("should execute command when execute button is clicked", async () => {
			render(<TerminalDashboard />);

			// Simulate WebSocket connection
			await waitFor(() => {
				if (mockWebSocket.onopen) {
					mockWebSocket.onopen();
				}
			});

			const input = screen.getByPlaceholderText(
				"Enter command (e.g., ls -la, ps aux, df -h)"
			);
			fireEvent.change(input, { target: { value: "ls -la" } });

			const executeButton = getButtonByTestId("PlayArrowIcon");
			fireEvent.click(executeButton);

			await waitFor(() => {
				expect(mockWebSocket.send).toHaveBeenCalledWith(
					expect.stringContaining('"type":"execute"')
				);
				expect(mockWebSocket.send).toHaveBeenCalledWith(
					expect.stringContaining('"command":"ls -la"')
				);
				expect(mockWebSocket.send).toHaveBeenCalledWith(
					expect.stringContaining('"useSudo":false')
				);
			});
		});

		it("should execute command with sudo when checkbox is checked", async () => {
			render(<TerminalDashboard />);

			// Simulate WebSocket connection
			await waitFor(() => {
				if (mockWebSocket.onopen) {
					mockWebSocket.onopen();
				}
			});

			const checkbox = screen.getByRole("checkbox");
			fireEvent.click(checkbox);

			const input = screen.getByPlaceholderText(
				"Enter command (e.g., ls -la, ps aux, df -h)"
			);
			fireEvent.change(input, { target: { value: "ls -la" } });

			const executeButton = getButtonByTestId("PlayArrowIcon");
			fireEvent.click(executeButton);

			await waitFor(() => {
				expect(mockWebSocket.send).toHaveBeenCalledWith(
					expect.stringContaining('"type":"execute"')
				);
				expect(mockWebSocket.send).toHaveBeenCalledWith(
					expect.stringContaining('"command":"ls -la"')
				);
				expect(mockWebSocket.send).toHaveBeenCalledWith(
					expect.stringContaining('"useSudo":true')
				);
			});
		});

		it("should clear history when clear button is clicked", () => {
			render(<TerminalDashboard />);

			const clearButton = getButtonByTestId("ClearIcon");
			fireEvent.click(clearButton);

			// History should be empty
			expect(
				screen.getByText(
					"No commands executed yet. Try running a command above."
				)
			).toBeInTheDocument();
		});
	});

	describe("Backend Connection Tests", () => {
		it("should establish WebSocket connection on mount", () => {
			render(<TerminalDashboard />);

			expect(global.WebSocket).toHaveBeenCalledWith(
				"ws://localhost:8081/terminal?token=mock-token"
			);
		});

		it("should handle successful WebSocket connection", async () => {
			render(<TerminalDashboard />);

			// Simulate successful connection
			await waitFor(() => {
				if (mockWebSocket.onopen) {
					mockWebSocket.onopen();
				}
			});

			await waitFor(() => {
				expect(screen.getByText("Connected")).toBeInTheDocument();
			});
		});

		it("should handle WebSocket connection error", async () => {
			render(<TerminalDashboard />);

			// Simulate connection error
			await waitFor(() => {
				if (mockWebSocket.onerror) {
					mockWebSocket.onerror();
				}
			});

			await waitFor(() => {
				expect(
					screen.getByText("Failed to connect to terminal service.")
				).toBeInTheDocument();
			});
		});

		it("should handle WebSocket connection close", async () => {
			render(<TerminalDashboard />);

			// Simulate connection close
			await waitFor(() => {
				if (mockWebSocket.onclose) {
					mockWebSocket.onclose();
				}
			});

			await waitFor(() => {
				expect(
					screen.getByText(
						"Connection lost. Please refresh the page."
					)
				).toBeInTheDocument();
			});
		});

		it("should handle command history message from backend", async () => {
			render(<TerminalDashboard />);

			const mockHistory = [
				{
					id: "1",
					command: "ls -la",
					output: "total 8\ndrwxr-xr-x 2 user user 4096 Jan 1 12:00 .\ndrwxr-xr-x 3 user user 4096 Jan 1 12:00 ..",
					error: "",
					status: 0,
					time: 1640995200,
					useSudo: false,
				},
			];

			// Simulate history message from backend
			await waitFor(() => {
				if (mockWebSocket.onmessage) {
					mockWebSocket.onmessage({
						data: JSON.stringify({
							type: "history",
							history: mockHistory,
						}),
					});
				}
			});

			await waitFor(() => {
				expect(screen.getByText("$ ls -la")).toBeInTheDocument();
				expect(screen.getByText("SUCCESS")).toBeInTheDocument();
			});
		});

		it("should handle command result message from backend", async () => {
			render(<TerminalDashboard />);

			const mockResult = {
				id: "2",
				command: 'echo "Hello World"',
				output: "Hello World",
				error: "",
				status: 0,
				time: 1640995200,
				useSudo: false,
			};

			// Simulate result message from backend
			await waitFor(() => {
				if (mockWebSocket.onmessage) {
					mockWebSocket.onmessage({
						data: JSON.stringify({
							type: "result",
							command: mockResult,
						}),
					});
				}
			});

			await waitFor(() => {
				expect(
					screen.getByText('$ echo "Hello World"')
				).toBeInTheDocument();
				expect(screen.getByText("Hello World")).toBeInTheDocument();
				expect(screen.getByText("SUCCESS")).toBeInTheDocument();
			});
		});

		it("should handle command error message from backend", async () => {
			render(<TerminalDashboard />);

			const mockError = {
				id: "3",
				command: "invalid-command",
				output: "",
				error: "command not found: invalid-command",
				status: 127,
				time: 1640995200,
				useSudo: false,
			};

			// Simulate error message from backend
			await waitFor(() => {
				if (mockWebSocket.onmessage) {
					mockWebSocket.onmessage({
						data: JSON.stringify({
							type: "error",
							command: mockError,
						}),
					});
				}
			});

			await waitFor(() => {
				expect(
					screen.getByText("$ invalid-command")
				).toBeInTheDocument();
				expect(
					screen.getAllByText("command not found: invalid-command")
				).toHaveLength(2);
				expect(screen.getByText("ERROR")).toBeInTheDocument();
			});
		});

		it("should handle partial command output from backend", async () => {
			render(<TerminalDashboard />);

			const mockPartial = {
				id: "4",
				command: "ping -c 3 localhost",
				output: "PING localhost (127.0.0.1) 56(84) bytes of data.\n64 bytes from localhost (127.0.0.1): icmp_seq=1 time=0.045 ms",
				error: "",
				status: 0,
				time: 1640995200,
				useSudo: false,
			};

			// Simulate partial message from backend
			await waitFor(() => {
				if (mockWebSocket.onmessage) {
					mockWebSocket.onmessage({
						data: JSON.stringify({
							type: "partial",
							command: mockPartial,
						}),
					});
				}
			});

			await waitFor(() => {
				expect(
					screen.getByText("$ ping -c 3 localhost")
				).toBeInTheDocument();
				expect(screen.getByText("RUNNING")).toBeInTheDocument();
				expect(screen.getByText(/PING localhost/)).toBeInTheDocument();
			});
		});

		it("should send command with correct format to backend", async () => {
			render(<TerminalDashboard />);

			// Simulate WebSocket connection
			await waitFor(() => {
				if (mockWebSocket.onopen) {
					mockWebSocket.onopen();
				}
			});

			const input = screen.getByPlaceholderText(
				"Enter command (e.g., ls -la, ps aux, df -h)"
			);
			fireEvent.change(input, { target: { value: "ps aux" } });

			const executeButton = getButtonByTestId("PlayArrowIcon");
			fireEvent.click(executeButton);

			await waitFor(() => {
				expect(mockWebSocket.send).toHaveBeenCalledWith(
					expect.stringContaining('"type":"execute"')
				);
				expect(mockWebSocket.send).toHaveBeenCalledWith(
					expect.stringContaining('"command":"ps aux"')
				);
				expect(mockWebSocket.send).toHaveBeenCalledWith(
					expect.stringContaining('"useSudo":false')
				);
			});
		});
	});
});
