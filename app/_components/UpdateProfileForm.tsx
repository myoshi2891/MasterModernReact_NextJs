"use client";

import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";
import { updateGuest } from "../_lib/actions";
import SubmitButton from "./SubmitButton";

interface GuestData {
	fullName: string;
	email: string;
	nationality?: string;
	nationalID?: string;
	countryFlag?: string;
}

interface UpdateProfileFormProps {
	children?: ReactNode;
	guest: GuestData;
}

/**
 * Renders a form for updating a guest's profile with read-only name/email, an editable National ID, and an optional country flag.
 *
 * @param guest - Guest data containing `fullName`, `email`, optional `nationalID`, and optional `countryFlag` URL
 * @param children - Optional nodes rendered inside the nationality section (e.g., country selector)
 * @returns The form element used to submit profile updates
 */
function UpdateProfileForm({ children, guest }: UpdateProfileFormProps) {
	const [error, setError] = useState("");

	const { fullName, email, nationalID, countryFlag } = guest;

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		setError("");
		const form = event.currentTarget;
		const nationalIDInput = form.elements.namedItem(
			"nationalID"
		) as HTMLInputElement | null;
		const nationalIDValue = nationalIDInput?.value.trim() ?? "";

		if (nationalIDValue && !/^[a-zA-Z0-9]{6,12}$/.test(nationalIDValue)) {
			event.preventDefault();
			setError("National ID must be 6–12 letters or digits");
		}
	};

	return (
		<form
			action={updateGuest}
			onSubmit={handleSubmit}
			className="flex flex-col gap-6 bg-primary-900 px-12 py-8 text-lg"
		>
			<div className="space-y-2">
				<label htmlFor="fullName">Full name</label>
				<input
					id="fullName"
					disabled
					defaultValue={fullName}
					name="fullName"
					className="w-full rounded-sm bg-primary-200 px-5 py-3 text-primary-800 shadow-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="email">Email address</label>
				<input
					id="email"
					disabled
					defaultValue={email}
					name="email"
					className="w-full rounded-sm bg-primary-200 px-5 py-3 text-primary-800 shadow-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
				/>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<label htmlFor="nationality">Where are you from?</label>
					{countryFlag ? (
						<Image
							src={countryFlag}
							alt="Country flag"
							width={20}
							height={20}
							className="rounded-sm"
						/>
					) : (
						<span className="text-sm text-primary-200">No flag selected</span>
					)}
				</div>
				{children}
			</div>

			<div className="space-y-2">
				<label htmlFor="nationalID">National ID number</label>
				<input
					id="nationalID"
					name="nationalID"
					defaultValue={nationalID ?? ""}
					className="w-full rounded-sm bg-primary-200 px-5 py-3 text-primary-800 shadow-sm"
				/>
				{error && (
					<p className="text-sm text-red-400" role="alert">
						{error}
					</p>
				)}
			</div>

			<div className="flex items-center justify-end gap-6">
				<SubmitButton pendingLabel="Updating...">Update Profile</SubmitButton>
			</div>
		</form>
	);
}

export default UpdateProfileForm;