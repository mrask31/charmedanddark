import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Journal Entry | Charmed & Dark",
  description: "A quiet reflection from the archive.",
};

export default async function JournalEntry({ params }) {
  const { slug } = await params;

  // Placeholder - no entries exist yet
  return notFound();
}
