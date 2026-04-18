import { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { useUpdateQA } from "@/client/hooks/useInterviews";
import type { InterviewQA } from "@/client/hooks/useInterviews";
import { useDebouncedMutate } from "@/client/hooks/useDebouncedMutate";
import { SaveIndicator } from "./SaveIndicator";

interface QACardProps {
	qa: InterviewQA;
	applicationId: string;
	onDelete: () => void;
	index: number;
}

export function QACard({ qa, applicationId, onDelete, index }: QACardProps) {
	const updateQA = useUpdateQA(applicationId);
	const [question, setQuestion] = useState(qa.question);
	const [answer, setAnswer] = useState(qa.answer ?? "");
	const [questionDirty, setQuestionDirty] = useState(false);
	const [answerDirty, setAnswerDirty] = useState(false);

	const doMutateQuestion = useCallback(
		(fields: Record<string, unknown>) => {
			updateQA.mutate({ qaId: qa.id, ...fields }, {
				onSuccess: () => setQuestionDirty(false),
			});
		},
		[updateQA, qa.id],
	);
	const debouncedQuestion = useDebouncedMutate(doMutateQuestion);

	const doMutateAnswer = useCallback(
		(fields: Record<string, unknown>) => {
			updateQA.mutate({ qaId: qa.id, ...fields }, {
				onSuccess: () => setAnswerDirty(false),
			});
		},
		[updateQA, qa.id],
	);
	const debouncedAnswer = useDebouncedMutate(doMutateAnswer);

	const handleQuestionChange = (val: string) => {
		setQuestion(val);
		setQuestionDirty(true);
		debouncedQuestion({ question: val });
	};

	const handleAnswerChange = (val: string) => {
		setAnswer(val);
		setAnswerDirty(true);
		debouncedAnswer({ answer: val });
	};

	return (
		<div className="rounded-xl border border-black/[0.06] bg-white/30 p-3.5 dark:border-white/[0.06] dark:bg-zinc-800/30">
			{/* Header row: badge + question + delete */}
			<div className="flex items-start gap-2.5">
				<span className="mt-0.5 shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" style={{ fontFamily: "var(--mono, monospace)" }}>
					Q{index + 1}
				</span>
				<input
					type="text"
					value={question}
					onChange={(e) => handleQuestionChange(e.target.value)}
					placeholder="Enter question..."
					className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-semibold text-text-primary placeholder:text-text-muted/50 focus:outline-none dark:text-dark-accent dark:placeholder:text-dark-accent/30"
				/>
				<div className="flex items-center gap-2 shrink-0">
					{questionDirty && <SaveIndicator isPending={updateQA.isPending} hasUnsaved={questionDirty} />}
					{!questionDirty && question !== qa.question && <SaveIndicator isPending={false} />}
					<button
						type="button"
						onClick={onDelete}
						className="text-red-400 hover:text-red-500 transition-colors"
						title="Delete Q&A"
					>
						<Trash2 size={14} />
					</button>
				</div>
			</div>

			{/* Answer textarea */}
			<div className="mt-2.5">
				<textarea
					value={answer}
					onChange={(e) => handleAnswerChange(e.target.value)}
					placeholder="Type your answer... (markdown supported)"
					className="w-full min-h-[60px] rounded-lg border border-dashed border-black/[0.08] bg-transparent p-2.5 text-[12.5px] leading-relaxed text-text-secondary placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none resize-y dark:border-white/[0.08] dark:text-dark-accent/80 dark:placeholder:text-dark-accent/30"
				/>
				<div className="mt-1 flex items-center justify-between">
					<span className="text-[9px] text-text-muted dark:text-dark-accent/30" style={{ fontFamily: "var(--mono, monospace)" }}>
						**bold** *italic* - lists `code` -- markdown supported
					</span>
					{(answerDirty || updateQA.isPending) && (
						<SaveIndicator isPending={updateQA.isPending} hasUnsaved={answerDirty} />
					)}
				</div>
			</div>
		</div>
	);
}
