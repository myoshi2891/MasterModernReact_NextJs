import SelectCountry from "@/app/_components/SelectCountry";
import UpdateProfileForm from "@/app/_components/UpdateProfileForm";
import { auth } from "@/app/_lib/auth";
import { createGuest, getGuest, getCountries } from "@/app/_lib/data-service";

export const metadata = {
	title: "Update profile",
};

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

	if (!guest) {
		throw new Error("Guest profile could not be loaded");
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
			countries.find((country) => country.name === preparedGuest.nationality)?.flag ?? "";
	}

	return (
		<div>
			<h2 className="font-semibold text-2xl text-accent-400 mb-4">
				Update your guest profile
			</h2>

			<p className="text-lg mb-8 text-primary-200">
				Providing the following information will make your check-in
				process faster and smoother. See you soon!
			</p>
			<UpdateProfileForm guest={preparedGuest}>
				<SelectCountry
					name="nationality"
					id="nationality"
					className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
					defaultCountry={preparedGuest.nationality}
				/>
			</UpdateProfileForm>
		</div>
	);
}
