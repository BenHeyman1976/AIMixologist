import Foundation

// Pub/club-friendly measure helper for the "Tell the Barman" feature.
// Annotates spirit measures with their single/double equivalent.
// UK pub measures: single = 25ml, double = 50ml.
enum Measures {
    static let spirits = [
        "gin", "vodka", "rum", "tequila", "whisky", "whiskey", "bourbon",
        "brandy", "cognac", "mezcal", "aperol", "campari", "vermouth",
        "liqueur", "triple sec", "cointreau", "amaretto", "sambuca",
        "schnapps", "absinthe", "pisco", "sherry", "port"
    ]

    /// Returns the ingredient line, adding "(single)" / "(double)" when it's a
    /// recognised spirit measured at 25ml / 50ml.
    static func annotate(_ ingredient: String) -> String {
        let lower = ingredient.lowercased()
        guard spirits.contains(where: { lower.contains($0) }) else { return ingredient }

        let compact = lower.replacingOccurrences(of: " ", with: "")
        if compact.contains("25ml") { return "\(ingredient)  — a single" }
        if compact.contains("50ml") { return "\(ingredient)  — a double" }
        if compact.contains("75ml") { return "\(ingredient)  — a treble" }
        return ingredient
    }
}
