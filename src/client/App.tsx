import { useState, useEffect } from "react";
import { ToastProvider } from "./components/ui/Toast";
import { LoginPage } from "./pages/login";
import { SignupPage } from "./pages/signup";
import { ResetPasswordPage } from "./pages/reset-password";
import { DashboardPage } from "./pages/dashboard";

function Router() {
	const [path, setPath] = useState(window.location.pathname);

	useEffect(() => {
		const handlePopState = () => setPath(window.location.pathname);
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, []);

	switch (path) {
		case "/signup":
			return <SignupPage />;
		case "/reset-password":
			return <ResetPasswordPage />;
		case "/dashboard":
			return <DashboardPage />;
		case "/login":
		default:
			return <LoginPage />;
	}
}

export function App() {
	return (
		<ToastProvider>
			<Router />
		</ToastProvider>
	);
}
