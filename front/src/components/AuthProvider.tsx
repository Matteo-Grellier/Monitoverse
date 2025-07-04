import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface User {
	id: string;
	email: string;
	name?: string;
	totp?: boolean;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<boolean>;
	register: (
		name: string,
		email: string,
		password: string
	) => Promise<boolean>;
	logout: () => void;
	isLoading: boolean;
	error: string | null;
	clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

const API_BASE_URL = "http://localhost:8081";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Check if user is logged in on mount
	useEffect(() => {
		const savedUser = localStorage.getItem("user");
		if (savedUser) {
			try {
				setUser(JSON.parse(savedUser));
			} catch (e) {
				console.error(e);
				localStorage.removeItem("user");
			}
		}
	}, []);

	const clearError = () => setError(null);

	const login = async (email: string, password: string): Promise<boolean> => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Login failed");
			}

			setUser(data.user);
			localStorage.setItem("user", JSON.stringify(data.user));
			return true;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (
		name: string,
		email: string,
		password: string
	): Promise<boolean> => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${API_BASE_URL}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name, email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Registration failed");
			}

			setUser(data.user);
			localStorage.setItem("user", JSON.stringify(data.user));
			return true;
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Registration failed"
			);
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
	};

	const value: AuthContextType = {
		user,
		login,
		register,
		logout,
		isLoading,
		error,
		clearError,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
