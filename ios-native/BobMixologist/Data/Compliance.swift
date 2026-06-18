import Foundation

// Responsible-drinking + wellness/CBD guardrails — mirror the web backend.
enum Compliance {
    private static let wellnessKeywords =
        ["cbd", "trip", "adaptogen", "wellness", "kombucha", "nootropic"]

    /// Notices that should accompany a given recipe.
    static func notes(for recipe: Recipe) -> [String] {
        var notes: [String] = []
        if recipe.alcoholLevel != .alcoholFree {
            notes.append("Please drink responsibly. 18+ where alcohol is served.")
        }
        let hay = ([recipe.name, recipe.tastingNotes] + recipe.ingredients + recipe.tags)
            .joined(separator: " ")
            .lowercased()
        if wellnessKeywords.contains(where: { hay.contains($0) }) {
            notes.append("Wellness/CBD ingredients are for flavour and lifestyle only — not medical advice.")
        }
        return notes
    }
}
