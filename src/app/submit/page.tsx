import type { Metadata } from "next";
import { SubmitFlow } from "./submit-flow";

export const metadata: Metadata = {
  title: "Got placed? Share your resume",
  description: "Share the resume that got you the offer. We remove your personal details, and you can delete it any time.",
};

export default function SubmitPage() {
  return <SubmitFlow />;
}
