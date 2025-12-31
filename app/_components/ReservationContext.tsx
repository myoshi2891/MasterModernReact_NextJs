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

function ReservationProvider({ children }: ReservationProviderProps) {
	const [range, setRange] = useState<DateRange>(initialState);
	const resetRange = () => setRange(initialState);

	return (
		<ReservationContext.Provider value={{ range, setRange, resetRange }}>
			{children}
		</ReservationContext.Provider>
	);
}

function useReservation(): ReservationContextValue {
	const context = useContext(ReservationContext);

	if (context === undefined)
		throw new Error("Context was used outside provider...");
	return context;
}

export { ReservationProvider, useReservation };