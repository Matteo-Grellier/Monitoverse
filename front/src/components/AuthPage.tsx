import React, { useState, useEffect } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { useNavigate } from "react-router-dom";

export const AuthPage: React.FC = () => {
	const [isLogin, setIsLogin] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		if (isLogin) {
			navigate("/login", { replace: true });
		} else {
			navigate("/register", { replace: true });
		}
	}, [isLogin, navigate]);

	return (
		<>
			{isLogin ? (
				<LoginForm onSwitchToRegister={() => setIsLogin(false)} />
			) : (
				<RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
			)}
		</>
	);
};
