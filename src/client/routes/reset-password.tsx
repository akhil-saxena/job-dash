import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/client/pages/reset-password";

export const Route = createFileRoute("/reset-password")({
	component: ResetPasswordPage,
});
