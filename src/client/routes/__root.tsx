import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { lazy } from "react";

interface RouterContext {
	auth: {
		isAuthenticated: boolean;
		user: { id: string; name: string; email: string } | null;
	};
}

const TanStackRouterDevtools = import.meta.env.DEV
	? lazy(() =>
			import("@tanstack/react-router-devtools").then((mod) => ({
				default: mod.TanStackRouterDevtools,
			})),
		)
	: () => null;

export const Route = createRootRouteWithContext<RouterContext>()({
	component: () => (
		<>
			<Outlet />
			{import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
		</>
	),
	notFoundComponent: () => (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-semibold text-text-primary dark:text-dark-accent">
					404
				</h1>
				<p className="mt-2 text-text-secondary">Page not found</p>
			</div>
		</div>
	),
});
