"use client";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useTransition } from "react";
import SpinnerMini from "./SpinnerMini";

function DeleteReservation({ bookingId, onDelete }) {
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		if (confirm("Are you sure you want to delete this reservation?"))
			startTransition(() => onDelete(bookingId));
	}

	return (
		<button
			onClick={handleDelete}
			className="group flex flex-1 items-center justify-center gap-2 px-4 py-3 text-[11px] font-bold uppercase text-primary-300 transition-colors hover:bg-accent-600 hover:text-primary-900 sm:justify-start sm:px-3 sm:py-4 sm:text-xs"
		>
			{!isPending ? (
				<>
					<TrashIcon className="h-5 w-5 text-primary-600 group-hover:text-primary-800 transition-colors" />
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
