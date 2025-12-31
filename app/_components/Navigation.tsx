import { auth } from "../_lib/auth";
import NavigationMenu from "./NavigationMenu";

/**
 * Render the application's navigation menu populated with the current authentication session.
 *
 * Retrieves the current user session and renders `NavigationMenu` with that session.
 *
 * @returns A JSX element for the navigation menu configured with the retrieved session.
 */
export default async function Navigation() {
	const session = await auth();

	return <NavigationMenu session={session} />;
}