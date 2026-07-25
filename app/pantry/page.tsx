import PantryInput from "@/components/PantryInput";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "What can I make? · Siply",
  description: "Tell Siply what's in your cupboard and get a cocktail you can make right now.",
};

// "Use what I own" landing — JTBD #3.
export default function PantryPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-cocktail-plum">
          What can I make? 🧊
        </h1>
        <p className="mt-1 text-cocktail-ink/70">
          Tell us what you've already got in — spirits, mixers, fruit, whatever's
          in the cupboard — and we'll build a cocktail around it. We'll only ask
          you to buy something if it really lifts the drink.
        </p>
      </div>
      <PantryInput />
    </div>
  );
}
