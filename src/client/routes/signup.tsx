import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignupPage } from "@/client/pages/signup";

export const Route = createFileRoute("/signup")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/board" });
		}
	},
	component: SignupPage,
});
