import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/client/components/kanban/KanbanBoard";

export const Route = createFileRoute("/_authenticated/board")({
	component: KanbanBoard,
});
