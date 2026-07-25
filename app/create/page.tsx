import CreateStudio from "@/components/CreateStudio";
import { getCocktail } from "@/lib/repo";
import { findPreset } from "@/lib/remix";

export const dynamic = "force-dynamic";

// The create page reads an optional ?prompt= (from the home hero) or a remix
// context (?remixOf=<id> plus ?twist=<preset> or ?instruction=<free text>).
export default async function CreatePage({
  searchParams,
}: {
  searchParams: {
    prompt?: string;
    remixOf?: string;
    twist?: string;
    instruction?: string;
    have?: string;
  };
}) {
  const pantry = searchParams.have
    ? { have: searchParams.have.split(",").map((s) => s.trim()).filter(Boolean) }
    : undefined;

  let remix = undefined;
  if (searchParams.remixOf) {
    const base = await getCocktail(searchParams.remixOf);
    if (base) {
      const preset = searchParams.twist ? findPreset(searchParams.twist) : undefined;
      remix = {
        baseId: base.id,
        baseName: base.name,
        baseUsername: base.creator_username ?? null,
        presetKey: preset?.key ?? null,
        instruction: searchParams.instruction ?? null,
        twistLabel: preset?.twist ?? (searchParams.instruction ? `Remixed: ${searchParams.instruction}` : "Remixed"),
      };
    }
  }

  return (
    <CreateStudio
      initialPrompt={searchParams.prompt ?? ""}
      remix={remix}
      pantry={pantry}
    />
  );
}
