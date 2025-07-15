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
	loginWithTOTP: (
		email: string,
		password: string,
		totp: string
	) => Promise<boolean>;
	register: (
		name: string,
		email: string,
		password: string
	) => Promise<boolean>;
	logout: () => void;
	isLoading: boolean;
	error: string | null;
	clearError: () => void;
	totpRequired: boolean;
	totpSetupRequired: boolean;
	setTotpRequired: (v: boolean) => void;
	setTotpSetupRequired: (v: boolean) => void;
	pendingLogin: { email: string; password: string } | null;
	setPendingLogin: (v: { email: string; password: string } | null) => void;
	setUser: (user: User | null) => void;
	pendingRegistrationEmail: string | null;
	setPendingRegistrationEmail: (email: string | null) => void;
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

export const getToken = () => localStorage.getItem("token");

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totpRequired, setTotpRequired] = useState(false);
	const [totpSetupRequired, setTotpSetupRequired] = useState(false);
	const [pendingLogin, setPendingLogin] = useState<{
		email: string;
		password: string;
	} | null>(null);
	const [pendingRegistrationEmail, setPendingRegistrationEmail] = useState<
		string | null
	>(null);

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
		setTotpRequired(false);
		setPendingLogin(null);
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
			if (data.totp_required) {
				setTotpRequired(true);
				setPendingLogin({ email, password });
				return false;
			}
			// Only set user if TOTP is not required (should not happen if TOTP is enforced)
			return false;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const loginWithTOTP = async (
		email: string,
		password: string,
		totp: string
	): Promise<boolean> => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch(`${API_BASE_URL}/auth/login/totp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password, totp }),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "TOTP login failed");
			}
			setUser(data.user);
			localStorage.setItem("user", JSON.stringify(data.user));
			localStorage.setItem("token", data.token);
			setTotpRequired(false);
			setPendingLogin(null);
			return true;
		} catch (err) {
			setError(err instanceof Error ? err.message : "TOTP login failed");
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
		setTotpSetupRequired(false);
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
			if (data.totp_setup_required) {
				setTotpSetupRequired(true);
				setPendingRegistrationEmail(email);
			}
			// Do not set user until TOTP is set up
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
		localStorage.removeItem("token");
	};

	const value: AuthContextType = {
		user,
		login,
		loginWithTOTP,
		register,
		logout,
		isLoading,
		error,
		clearError,
		totpRequired,
		totpSetupRequired,
		setTotpRequired,
		setTotpSetupRequired,
		pendingLogin,
		setPendingLogin,
		setUser,
		pendingRegistrationEmail,
		setPendingRegistrationEmail,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
