import Foundation

// "Shop the ingredients" affiliate links — mirrors the web lib/affiliates.ts.
// TODO(affiliate): drop in your Amazon Associates tag + network deep links.
enum Affiliates {
    static let amazonTag = ""   // e.g. "bobmixology-21"

    private static let fillerPrefixes =
        ["top with", "topped with", "plenty of", "a little", "fresh", "chilled", "premium"]
    private static let skip = ["soda water", "water", "still water", "tap water",
                               "coupe", "tumbler", "highball", "flute", "rocks", "garnish"]

    /// Reduce an ingredient line to a searchable product term.
    static func searchTerm(_ ingredient: String) -> String {
        var term = ingredient.lowercased().trimmingCharacters(in: .whitespaces)

        // Strip a leading quantity + unit, e.g. "50ml ", "1 measure ".
        if let range = term.range(
            of: #"^[\s\d.,/¼½¾–-]+(ml|cl|l|oz|cubes?|dash(es)?|measures?|parts?|shots?|tsp|tbsp|g|grams|sprigs?|slices?|scoops?|drops?|splash( of)?)?\s*"#,
            options: .regularExpression
        ) {
            term.removeSubrange(range)
        }
        for f in fillerPrefixes where term.hasPrefix(f) {
            term = String(term.dropFirst(f.count)).trimmingCharacters(in: .whitespaces)
        }
        // Drop parenthetical notes, then anything after a comma.
        term = term.replacingOccurrences(
            of: #"\(.*?\)"#, with: "", options: .regularExpression
        )
        if let comma = term.firstIndex(of: ",") { term = String(term[..<comma]) }
        term = term.trimmingCharacters(in: .whitespaces)
        return term.isEmpty ? ingredient.trimmingCharacters(in: .whitespaces) : term
    }

    static func isShoppable(_ ingredient: String) -> Bool {
        let term = searchTerm(ingredient)
        if term.contains("glass") || term.contains("ice") { return false }
        return term.count > 1 && !skip.contains(term)
    }

    struct RetailerLink: Identifiable {
        let id = UUID()
        let name: String
        let url: URL
    }

    static func links(for ingredient: String) -> [RetailerLink] {
        let q = searchTerm(ingredient)
            .addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let amazon = "https://www.amazon.co.uk/s?k=\(q)" + (amazonTag.isEmpty ? "" : "&tag=\(amazonTag)")
        let tesco  = "https://www.tesco.com/groceries/en-GB/search?query=\(q)"
        let ocado  = "https://www.ocado.com/search?entry=\(q)"
        return [
            RetailerLink(name: "Amazon", url: URL(string: amazon)!),
            RetailerLink(name: "Tesco",  url: URL(string: tesco)!),
            RetailerLink(name: "Ocado",  url: URL(string: ocado)!)
        ]
    }
}
