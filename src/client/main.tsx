import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { authClient } from "./lib/auth-client";
import { ToastProvider } from "./components/ui/Toast";
import "./index.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { staleTime: 60_000, retry: 1 },
	},
});

const router = createRouter({
	routeTree,
	context: { auth: { isAuthenticated: false, user: null } },
	defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function InnerApp() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-text-secondary">Loading...</p>
			</div>
		);
	}

	return (
		<RouterProvider
			router={router}
			context={{
				auth: {
					isAuthenticated: !!session?.user,
					user: session?.user ?? null,
				},
			}}
		/>
	);
}

// Note: StrictMode removed because @hello-pangea/dnd Draggable/Droppable
// throws "Could not find required context" invariant during React 19
// StrictMode double-render. StrictMode is dev-only and doesn't affect production.
createRoot(document.getElementById("root")!).render(
	<QueryClientProvider client={queryClient}>
		<ToastProvider>
			<InnerApp />
		</ToastProvider>
	</QueryClientProvider>,
);
