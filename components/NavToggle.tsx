"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function NavToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="nav-wrap" data-open={open}>
      <button
        type="button"
        className="nav-button"
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Close" : "Menu"}
      </button>
      {children}
    </div>
  );
}
