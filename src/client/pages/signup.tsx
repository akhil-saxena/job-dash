import { AuthLayout } from "../components/layout/AuthLayout";
import { SignupForm } from "../components/auth/SignupForm";

export function SignupPage() {
	return (
		<AuthLayout title="Create account" subtitle="Start tracking your applications">
			<SignupForm />
		</AuthLayout>
	);
}
