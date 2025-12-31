import { getCountries } from "@/app/_lib/data-service";

interface SelectCountryProps {
	defaultCountry?: string;
	name: string;
	id: string;
	className?: string;
}

/**
 * Renders a country <select> populated from the service, encoding each option's value as `name%flag`.
 *
 * @param defaultCountry - Optional country name to preselect; when provided, the component finds its flag and uses `name%flag` as the initial value.
 * @param name - The HTML `name` attribute for the <select>.
 * @param id - The HTML `id` attribute for the <select>.
 * @param className - Optional CSS class applied to the <select>.
 * @returns A JSX <select> element with a placeholder option and one option per country; each option's `value` is the country name and flag joined with `%` (e.g., `United States%🇺🇸`).
 */
async function SelectCountry({
	defaultCountry,
	name,
	id,
	className,
}: SelectCountryProps) {
	const countries = await getCountries();
	const matchedCountry = countries.find(
		(country) => country.name === defaultCountry
	);

	const defaultValue =
		defaultCountry && matchedCountry
			? `${defaultCountry}%${matchedCountry.flag}`
			: "";

	return (
		<select
			name={name}
			id={id}
			// Here we use a trick to encode BOTH the country name and the flag into the value. Then we split them up again later in the server action
			defaultValue={defaultValue}
			className={className}
		>
			<option value="">Select country...</option>
			{countries.map((c) => (
				<option key={c.name} value={`${c.name}%${c.flag}`}>
					{c.name}
				</option>
			))}
		</select>
	);
}

export default SelectCountry;