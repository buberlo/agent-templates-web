import { redirect } from "next/navigation";

export default function TemplatesIndexRedirect() {
  redirect("/catalog");
}
