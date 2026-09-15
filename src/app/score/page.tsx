import { redirect } from "next/navigation";

/** The checker lives on the home page now; keep old links working. */
export default function ScorePage() {
  redirect("/");
}
