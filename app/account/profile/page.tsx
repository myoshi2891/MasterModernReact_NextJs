import type { Metadata } from "next";
import SelectCountry from "@/app/_components/SelectCountry";
import UpdateProfileForm from "@/app/_components/UpdateProfileForm";
import { auth } from "@/app/_lib/auth";
import { createGuest, getGuest, getCountries } from "@/app/_lib/data-service";

export const metadata: Metadata = {
	title: "Update profile",
};

/**
 * Render the guest profile update page prefilled with session and guest data.
 *
 * Retrieves the current session, loads or creates a guest record for the session email,
 * prepares a guest object by merging stored guest fields with session fallbacks,
 * and resolves a country flag if a nationality exists but the flag is missing.
 *
 * @throws {Error} If session or session.user.email is missing.
 */
export default async function Page() {
	const session = await auth();

	if (!session?.user?.email) {
		throw new Error("Missing session information for guest profile");
	}

	let guest = await getGuest(session.user.email);

	if (!guest) {
		guest = await createGuest({
			email: session.user.email,
			fullName: session.user.name ?? "",
		});
	}

	const preparedGuest = {
		...guest,
		fullName: guest.fullName ?? session.user.name ?? "",
		email: guest.email ?? session.user.email,
		nationality: guest.nationality ?? "",
		nationalID: guest.nationalID ?? "",
		countryFlag: guest.countryFlag ?? "",
	};

	if (preparedGuest.nationality && !preparedGuest.countryFlag) {
		const countries = await getCountries();
		preparedGuest.countryFlag =
			countries.find((country) => country.name === preparedGuest.nationality)
				?.flag ?? "";
	}

	return (
		<div>
			<h2 className="mb-4 text-2xl font-semibold text-accent-400">
				Update your guest profile
			</h2>

			<p className="mb-8 text-lg text-primary-200">
				Providing the following information will make your check-in process
				faster and smoother. See you soon!
			</p>
			<UpdateProfileForm guest={preparedGuest}>
				<SelectCountry
					name="nationality"
					id="nationality"
					className="w-full rounded-sm bg-primary-200 px-5 py-3 text-primary-800 shadow-sm"
					defaultCountry={preparedGuest.nationality}
				/>
			</UpdateProfileForm>
		</div>
	);
}