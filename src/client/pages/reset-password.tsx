import { AuthLayout } from "../components/layout/AuthLayout";
import { RequestResetForm } from "../components/auth/RequestResetForm";
import { ResetPasswordForm } from "../components/auth/ResetPasswordForm";

export function ResetPasswordPage() {
	const hasToken = new URLSearchParams(window.location.search).has("token");
	return (
		<AuthLayout title={hasToken ? "Set new password" : "Reset password"}>
			{hasToken ? <ResetPasswordForm /> : <RequestResetForm />}
		</AuthLayout>
	);
}
