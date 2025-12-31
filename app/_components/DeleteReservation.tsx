"use client";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useTransition } from "react";
import SpinnerMini from "./SpinnerMini";

interface DeleteReservationProps {
	bookingId: number;
	onDelete: (bookingId: number) => void;
}

/**
 * Render a delete button that prompts the user for confirmation and triggers removal of a reservation.
 *
 * @param bookingId - The identifier of the reservation to delete.
 * @param onDelete - Callback invoked with `bookingId` when the user confirms deletion.
 * @returns A button element that shows a trash icon and "Delete" label, or a centered spinner while deletion is pending.
 */
function DeleteReservation({ bookingId, onDelete }: DeleteReservationProps) {
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		if (confirm("Are you sure you want to delete this reservation?"))
			startTransition(() => onDelete(bookingId));
	}

	return (
		<button
			type="button"
			onClick={handleDelete}
			disabled={isPending}
			aria-busy={isPending}
			className="group flex flex-1 items-center justify-center gap-2 px-4 py-3 text-[11px] font-bold uppercase text-primary-300 transition-colors hover:bg-accent-600 hover:text-primary-900 disabled:cursor-not-allowed disabled:opacity-50 sm:justify-start sm:px-3 sm:py-4 sm:text-xs"
		>
			{!isPending ? (
				<>
					<TrashIcon className="h-5 w-5 text-primary-600 transition-colors group-hover:text-primary-800" />
					<span className="mt-1">Delete</span>
				</>
			) : (
				<span className="mx-auto">
					<SpinnerMini />
				</span>
			)}
		</button>
	);
}

export default DeleteReservation;