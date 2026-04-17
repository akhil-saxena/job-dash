import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "@/client/pages/login";

export const Route = createFileRoute("/login")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/board" });
		}
	},
	component: LoginPage,
});
