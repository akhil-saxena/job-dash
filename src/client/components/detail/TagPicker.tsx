import { useState, useRef, useEffect } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import { useTags, useApplicationTags, useAssignTag, useUnassignTag, useCreateTag } from "@/client/hooks/useTags";
import { TAG_COLORS } from "@/shared/constants";

interface TagPickerProps {
	applicationId: string;
}

export function TagPicker({ applicationId }: TagPickerProps) {
	const { data: allTags } = useTags();
	const { data: assignedTags } = useApplicationTags(applicationId);
	const assignTag = useAssignTag();
	const unassignTag = useUnassignTag();
	const createTag = useCreateTag();

	const [isOpen, setIsOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [newTagName, setNewTagName] = useState("");
	const [newTagColor, setNewTagColor] = useState(TAG_COLORS[4]); // default green
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown on outside click
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsOpen(false);
				setIsCreating(false);
			}
		}
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen]);

	const assignedIds = new Set((assignedTags ?? []).map((t) => t.id));
	const availableTags = (allTags ?? []).filter((t) => !assignedIds.has(t.id));

	function handleAssign(tagId: string) {
		assignTag.mutate({ appId: applicationId, tagId });
	}

	function handleUnassign(tagId: string) {
		unassignTag.mutate({ appId: applicationId, tagId });
	}

	async function handleCreateAndAssign() {
		if (!newTagName.trim()) return;
		createTag.mutate(
			{ name: newTagName.trim(), color: newTagColor },
			{
				onSuccess: (result) => {
					const newTag = result.data;
					if (newTag?.id) {
						assignTag.mutate({ appId: applicationId, tagId: newTag.id });
					}
					setNewTagName("");
					setIsCreating(false);
				},
			},
		);
	}

	return (
		<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
			<div className="mb-3 flex items-center gap-2">
				<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
				<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Tags</span>
			</div>

			{/* Assigned tags */}
			<div className="flex flex-wrap gap-1.5 mb-3">
				{(assignedTags ?? []).map((tag) => (
					<span
						key={tag.id}
						className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
						style={{ backgroundColor: tag.color }}
					>
						<span className="inline-block h-1.5 w-1.5 rounded-full bg-white/40" />
						{tag.name}
						<button
							type="button"
							onClick={() => handleUnassign(tag.id)}
							className="ml-0.5 rounded-full p-0.5 hover:bg-white/20 transition-colors"
							title={`Remove ${tag.name}`}
						>
							<X size={10} />
						</button>
					</span>
				))}
				{(!assignedTags || assignedTags.length === 0) && (
					<span className="text-[11px] text-text-muted dark:text-dark-accent/30 italic">No tags assigned</span>
				)}
			</div>

			{/* Add tag button + dropdown */}
			<div className="relative" ref={dropdownRef}>
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="flex items-center gap-1.5 rounded-lg border border-dashed border-black/[0.12] px-2.5 py-1.5 text-[11px] font-medium text-text-muted hover:border-amber-400 hover:text-text-secondary transition-colors dark:border-white/[0.1] dark:text-dark-accent/40 dark:hover:border-amber-500/40"
				>
					<Plus size={11} /> Add tag <ChevronDown size={10} />
				</button>

				{isOpen && (
					<div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-black/[0.08] bg-white/95 backdrop-blur-xl shadow-lg dark:border-white/[0.1] dark:bg-zinc-800/95">
						<div className="max-h-48 overflow-y-auto p-1.5">
							{availableTags.length === 0 && !isCreating && (
								<p className="px-2 py-2 text-[11px] text-text-muted dark:text-dark-accent/40">
									{(allTags ?? []).length === 0 ? "No tags yet" : "All tags assigned"}
								</p>
							)}
							{availableTags.map((tag) => (
								<button
									key={tag.id}
									type="button"
									onClick={() => {
										handleAssign(tag.id);
										setIsOpen(false);
									}}
									className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] font-medium hover:bg-black/[0.04] transition-colors dark:hover:bg-white/[0.06]"
								>
									<span
										className="inline-block h-3 w-3 shrink-0 rounded-full"
										style={{ backgroundColor: tag.color }}
									/>
									<span className="text-text-primary dark:text-dark-accent">{tag.name}</span>
								</button>
							))}
						</div>

						{/* Create new tag */}
						<div className="border-t border-black/[0.06] p-1.5 dark:border-white/[0.06]">
							{isCreating ? (
								<div className="flex flex-col gap-2 p-1">
									<input
										type="text"
										value={newTagName}
										onChange={(e) => setNewTagName(e.target.value)}
										placeholder="Tag name"
										autoFocus
										className="w-full rounded-lg border border-black/[0.1] bg-transparent px-2.5 py-1.5 text-[12px] placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none dark:border-white/[0.1] dark:text-dark-accent dark:placeholder:text-dark-accent/30"
										onKeyDown={(e) => {
											if (e.key === "Enter") handleCreateAndAssign();
											if (e.key === "Escape") setIsCreating(false);
										}}
									/>
									<div className="flex flex-wrap gap-1">
										{TAG_COLORS.map((color) => (
											<button
												key={color}
												type="button"
												onClick={() => setNewTagColor(color)}
												className={`h-5 w-5 rounded-full transition-all ${newTagColor === color ? "ring-2 ring-amber-400 ring-offset-1 scale-110" : "hover:scale-110"}`}
												style={{ backgroundColor: color }}
												title={color}
											/>
										))}
									</div>
									<div className="flex gap-1.5">
										<button
											type="button"
											onClick={handleCreateAndAssign}
											disabled={!newTagName.trim() || createTag.isPending}
											className="flex-1 rounded-lg bg-amber-500 px-2 py-1 text-[11px] font-bold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
										>
											{createTag.isPending ? "Creating..." : "Create"}
										</button>
										<button
											type="button"
											onClick={() => {
												setIsCreating(false);
												setNewTagName("");
											}}
											className="rounded-lg border border-black/[0.1] px-2 py-1 text-[11px] text-text-muted hover:text-text-secondary dark:border-white/[0.1] dark:text-dark-accent/40"
										>
											Cancel
										</button>
									</div>
								</div>
							) : (
								<button
									type="button"
									onClick={() => setIsCreating(true)}
									className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] font-medium text-amber-600 hover:bg-amber-50/50 transition-colors dark:text-amber-400 dark:hover:bg-amber-500/10"
								>
									<Plus size={12} /> Create new tag
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
