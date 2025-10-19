import { auth } from "../_lib/auth";
import {
  getBookedDatesByCabinId,
  getSettings,
} from "../_lib/data-service.server";
import DateSelector from "./DateSelector";
import LoginMessage from "./LoginMessage";
import ReservationForm from "./ReservationForm";

async function Reservation({ cabin }) {
  const [settings, bookedDates] = await Promise.all([
    getSettings(),
    getBookedDatesByCabinId(cabin.id),
  ]);

  const session = await auth();

  return (
    <div className="w-full px-3 sm:px-0">
      <div className="grid min-h-[400px] w-full max-w-3xl mx-auto overflow-hidden rounded-2xl border border-primary-800 bg-primary-950 grid-cols-1 lg:max-w-none lg:grid-cols-[1.1fr_1fr]">
        <DateSelector
          settings={settings}
          bookedDates={bookedDates}
          cabin={cabin}
        />
        {session?.user ? (
          <ReservationForm cabin={cabin} user={session.user} />
        ) : (
          <LoginMessage />
        )}{" "}
      </div>
    </div>
  );
}

export default Reservation;
