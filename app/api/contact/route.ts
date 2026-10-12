import { NextResponse } from "next/server";
import { validateContact, type ContactInput } from "@/lib/contact";

export async function POST(request: Request) {
  let input: ContactInput;
  try {
    const body = await request.json();
    input = {
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      phone: String(body.phone ?? ""),
      service: String(body.service ?? ""),
      message: String(body.message ?? ""),
    };
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Please fix the highlighted fields.", errors }, { status: 422 });
  }

  await new Promise((r) => setTimeout(r, 600));

  if (input.email.toLowerCase().includes("fail")) {
    return NextResponse.json(
      { message: "Our server couldn't process your enquiry. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: `Thanks, ${input.name.trim()}! We've received your ${input.service} enquiry and will reply within one business day.`,
  });
}
