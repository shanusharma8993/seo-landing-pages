"use client";

import { useState, type FocusEvent, type FormEvent } from "react";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "error";

type Props = { services: string[]; defaultService?: string };

const FIELDS: (keyof ContactInput)[] = ["name", "email", "phone", "service", "message"];

export function ContactForm({ services, defaultService = "" }: Props) {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactInput, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");

  function readForm(form: HTMLFormElement): ContactInput {
    const data = new FormData(form);
    return Object.fromEntries(FIELDS.map((f) => [f, String(data.get(f) ?? "")])) as ContactInput;
  }

  function handleBlur(e: FocusEvent<HTMLFormElement>) {
    const field = (e.target as Element).getAttribute("name") as keyof ContactInput;
    if (!FIELDS.includes(field)) return;
    setTouched((t) => ({ ...t, [field]: true }));
    const fieldError = validateContact(readForm(e.currentTarget))[field];
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = readForm(form);
    const nextErrors = validateContact(input);
    setErrors(nextErrors);
    setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));

    const firstInvalid = FIELDS.find((f) => nextErrors[f]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = (await res.json()) as { message?: string; errors?: ContactErrors };
      if (!res.ok) {
        if (body.errors) setErrors(body.errors);
        throw new Error(body.message ?? "Something went wrong.");
      }
      setStatus("success");
      setServerMessage(body.message ?? "Thanks! We'll be in touch shortly.");
      form.reset();
      setTouched({});
    } catch (err) {
      setStatus("error");
      setServerMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const fieldProps = (name: keyof ContactInput) => {
    const showError = touched[name] && errors[name];
    return {
      id: `contact-${name}`,
      name,
      "aria-invalid": showError ? true : undefined,
      "aria-describedby": showError ? `contact-${name}-error` : undefined,
    };
  };

  const errorText = (name: keyof ContactInput) =>
    touched[name] && errors[name] ? (
      <p id={`contact-${name}-error`} className="field-error">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit} onBlur={handleBlur}>
      <div className="field">
        <label htmlFor="contact-name">Name</label>
        <input {...fieldProps("name")} type="text" autoComplete="name" required />
        {errorText("name")}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="contact-email">Email</label>
          <input {...fieldProps("email")} type="email" autoComplete="email" required />
          {errorText("email")}
        </div>
        <div className="field">
          <label htmlFor="contact-phone">
            Phone <span className="optional">(optional)</span>
          </label>
          <input {...fieldProps("phone")} type="tel" autoComplete="tel" />
          {errorText("phone")}
        </div>
      </div>

      <div className="field">
        <label htmlFor="contact-service">Service</label>
        <select {...fieldProps("service")} defaultValue={defaultService} required>
          <option value="" disabled>
            Choose a service
          </option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errorText("service")}
      </div>

      <div className="field">
        <label htmlFor="contact-message">Project details</label>
        <textarea {...fieldProps("message")} rows={4} required />
        {errorText("message")}
      </div>

      <button type="submit" className="button" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>

      <div role="status" aria-live="polite">
        {status === "success" && <p className="form-success">{serverMessage}</p>}
        {status === "error" && <p className="form-error">{serverMessage}</p>}
      </div>
    </form>
  );
}
