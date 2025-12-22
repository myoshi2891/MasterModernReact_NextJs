"use client";

import Image from "next/image";
import { useState } from "react";
import { updateGuest } from "../_lib/actions";
import SubmitButton from "./SubmitButton";

function UpdateProfileForm({ children, guest }) {
  const [error, setError] = useState("");

  const { fullName, email, nationality, nationalID, countryFlag } = guest;

  const handleSubmit = (event) => {
    setError("");
    const nationalIDValue = event.currentTarget
      .elements.namedItem("nationalID")
      ?.value.trim();

    if (
      nationalIDValue &&
      !/^[a-zA-Z0-9]{6,12}$/.test(nationalIDValue)
    ) {
      event.preventDefault();
      setError("National ID must be 6–12 letters or digits");
    }
  };

  return (
    <form
      action={updateGuest}
      onSubmit={handleSubmit}
      className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col"
    >
      <div className="space-y-2">
        <label htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          disabled
          defaultValue={fullName}
          name="fullName"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          disabled
          defaultValue={email}
          name="email"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
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
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
        />
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex justify-end items-center gap-6">
        <SubmitButton pendingLabel="Updating...">Update Profile</SubmitButton>
      </div>
    </form>
  );
}

export default UpdateProfileForm;
