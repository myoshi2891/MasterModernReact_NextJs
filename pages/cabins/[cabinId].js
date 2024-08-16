import Head from "next/head";
import { useRouter } from "next/router";

function Cabin() {
	const router = useRouter();
	return (
		<>
			<Head>
				<title>Cain #{router.query.cabinId} | The Wild Oasis</title>
			</Head>
			<div>Cabin #{router.query.cabinId}</div>;
		</>
	);
}

export default Cabin;
