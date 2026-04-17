import { useState } from "react";
import { Modal } from "@/client/components/design-system/Modal";
import { Input } from "@/client/components/design-system/Input";
import { Button } from "@/client/components/design-system/Button";
import { useCreateApplication } from "@/client/hooks/useApplications";
import { APPLICATION_STATUSES } from "@/shared/constants";
import { STATUS_LABELS } from "@/client/lib/colors";
import type { ApplicationStatus } from "@/shared/constants";

interface QuickAddModalProps {
	open: boolean;
	onClose: () => void;
}

export function QuickAddModal({ open, onClose }: QuickAddModalProps) {
	const [companyName, setCompanyName] = useState("");
	const [roleTitle, setRoleTitle] = useState("");
	const [status, setStatus] = useState<ApplicationStatus>("wishlist");
	const [error, setError] = useState("");

	const createMutation = useCreateApplication();

	function resetForm() {
		setCompanyName("");
		setRoleTitle("");
		setStatus("wishlist");
		setError("");
	}

	function handleClose() {
		resetForm();
		onClose();
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		const trimmedCompany = companyName.trim();
		const trimmedRole = roleTitle.trim();

		if (!trimmedCompany || !trimmedRole) {
			setError("Company name and role are required.");
			return;
		}

		try {
			await createMutation.mutateAsync({
				companyName: trimmedCompany,
				roleTitle: trimmedRole,
				status,
			});
			handleClose();
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to create application",
			);
		}
	}

	return (
		<Modal open={open} onClose={handleClose} title="Add Application">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					variant="glass"
					label="Company"
					placeholder="e.g. Google"
					value={companyName}
					onChange={(e) =>
						setCompanyName(
							(e as React.ChangeEvent<HTMLInputElement>).target
								.value,
						)
					}
					required
				/>

				<Input
					variant="glass"
					label="Role"
					placeholder="e.g. Senior Engineer"
					value={roleTitle}
					onChange={(e) =>
						setRoleTitle(
							(e as React.ChangeEvent<HTMLInputElement>).target
								.value,
						)
					}
					required
				/>

				{/* Status dropdown */}
				<div className="space-y-1.5">
					<label
						htmlFor="quick-add-status"
						className="block text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-accent/60"
					>
						Status
					</label>
					<select
						id="quick-add-status"
						value={status}
						onChange={(e) =>
							setStatus(e.target.value as ApplicationStatus)
						}
						className="block w-full rounded-[var(--radius-input)] px-3 py-2 text-text-primary transition-colors focus:border-surface-accent/40 focus:outline-none focus:ring-2 focus:ring-surface-accent/20 glass border-white/30 dark:border-white/10 dark:text-dark-accent dark:focus:border-dark-accent/40 dark:focus:ring-dark-accent/20"
					>
						{APPLICATION_STATUSES.map((s) => (
							<option key={s} value={s}>
								{STATUS_LABELS[s]}
							</option>
						))}
					</select>
				</div>

				{/* Error message */}
				{error && (
					<p className="text-xs text-status-rejected">{error}</p>
				)}

				{/* Action buttons */}
				<div className="flex items-center justify-end gap-2 pt-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleClose}
					>
						Discard
					</Button>
					<Button
						type="submit"
						variant="filled"
						size="sm"
						loading={createMutation.isPending}
						disabled={createMutation.isPending}
					>
						Add Application
					</Button>
				</div>
			</form>
		</Modal>
	);
}
