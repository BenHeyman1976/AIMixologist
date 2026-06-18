import CreateStudio from "@/components/CreateStudio";

export const dynamic = "force-dynamic";

// The create page reads an optional ?prompt= passed from the home hero.
export default function CreatePage({
  searchParams,
}: {
  searchParams: { prompt?: string };
}) {
  return <CreateStudio initialPrompt={searchParams.prompt ?? ""} />;
}
