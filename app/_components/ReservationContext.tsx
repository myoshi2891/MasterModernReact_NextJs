"use client";
import {
	createContext,
	useContext,
	useState,
	type ReactNode,
	type Dispatch,
	type SetStateAction,
} from "react";
import type { DateRange } from "@/app/_lib/booking";

/**
 * Context value type for reservation state management.
 */
interface ReservationContextValue {
	range: DateRange;
	setRange: Dispatch<SetStateAction<DateRange>>;
	resetRange: () => void;
}

const ReservationContext = createContext<ReservationContextValue | undefined>(
	undefined
);

const initialState: DateRange = { from: undefined, to: undefined };

interface ReservationProviderProps {
	children: ReactNode;
}

/**
 * Provides reservation range state and updater functions to descendant components via context.
 *
 * @param children - React nodes to be rendered inside the provider
 * @returns A React element that wraps `children` with `ReservationContext.Provider` supplying `range`, `setRange`, and `resetRange`
 */
function ReservationProvider({ children }: ReservationProviderProps) {
	const [range, setRange] = useState<DateRange>(initialState);
	const resetRange = () => setRange(initialState);

	return (
		<ReservationContext.Provider value={{ range, setRange, resetRange }}>
			{children}
		</ReservationContext.Provider>
	);
}

/**
 * Accesses the reservation context for the current component.
 *
 * @returns The current ReservationContextValue containing `range`, `setRange`, and `resetRange`.
 * @throws Error if called outside a ReservationProvider — message: "Context was used outside provider..."
 */
function useReservation(): ReservationContextValue {
	const context = useContext(ReservationContext);

	if (context === undefined)
		throw new Error("Context was used outside provider...");
	return context;
}

export { ReservationProvider, useReservation };