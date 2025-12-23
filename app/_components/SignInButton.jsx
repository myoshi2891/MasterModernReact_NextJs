"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";

/**
 * Render a button that initiates Google OAuth sign-in and redirects the user to /account on success.
 *
 * @returns {JSX.Element} A button element containing the Google logo and the label "Continue with Google".
 */
function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn("google", { callbackUrl: "/account" });
      if (result?.error) {
        setErrorMessage("Sign-in failed. Please try again.");
      }
    } catch {
      setErrorMessage("Sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        className="flex items-center gap-6 text-lg border border-primary-300 px-10 py-4 font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Image
          src="https://authjs.dev/img/providers/google.svg"
          alt="Google logo"
          height={24}
          width={24}
        />
        <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
      </button>
      {errorMessage ? (
        <p className="text-sm text-red-400">{errorMessage}</p>
      ) : null}
    </div>
  );
}

export default SignInButton;
