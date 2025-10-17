"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function NavigationMenu({ session }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const links = [
    { href: "/cabins", label: "Cabins" },
    { href: "/about", label: "About" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleMenu}
        className="flex items-center justify-center rounded-md border border-primary-700 p-2 text-primary-200 transition-colors hover:border-accent-400 hover:text-accent-400 md:hidden"
        aria-expanded={isOpen}
        aria-label="Toggle navigation"
      >
        {isOpen ? (
          <XMarkIcon className="size-3" />
        ) : (
          <Bars3Icon className="size-3" />
        )}
      </button>

      <nav className="hidden md:block">
        <ul className="flex items-center gap-2 text-lg">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="transition-colors hover:text-accent-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            {session?.user?.image ? (
              <Link
                href="/account"
                className="flex items-center gap-3 transition-colors hover:text-accent-400"
                onClick={closeMenu}
              >
                {" "}
                <span>{session.user.name}</span>
                <Image
                  className="size-8 rounded-full"
                  src={session.user.image}
                  alt={session.user.name}
                  referrerPolicy="no-referrer"
                  width={12}
                  height={12}
                />
              </Link>
            ) : (
              <Link
                href="/account"
                className="transition-colors hover:text-accent-400"
                onClick={closeMenu}
              >
                Guest area
              </Link>
            )}
          </li>
        </ul>
      </nav>

      {isOpen ? (
        <div className="absolute left-0 top-12 z-20 w-72 rounded-md border border-primary-800 bg-primary-950 p-2 shadow-lg md:hidden opacity-80">
          <nav>
            <ul className="flex flex-col gap-3 items-center text-base">
              <li>
                {session?.user?.image ? (
                  <Link
                    href="/account"
                    className="flex flex-col items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-primary-800 hover:text-accent-400"
                    onClick={closeMenu}
                  >
                    <Image
                      className="size-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name}
                      referrerPolicy="no-referrer"
                      width={16}
                      height={16}
                    />
                  </Link>
                ) : (
                  <Link
                    href="/account"
                    className="rounded-md px-2 py-2 transition-colors hover:bg-primary-800 hover:text-accent-400"
                    onClick={closeMenu}
                  >
                    Guest area
                  </Link>
                )}
              </li>

              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-md px-2 py-2 transition-colors hover:bg-primary-800 hover:text-accent-400"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

export default NavigationMenu;
