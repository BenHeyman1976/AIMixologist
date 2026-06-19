import Foundation

// Night-planner models. Siply turns a free-text description of your evening
// ("finishing work at 6, theatre at 8, eating Italian") into a paced,
// responsible drink itinerary.

enum PlanItemKind: String {
    case drink, food, water, tip, move

    var icon: String {
        switch self {
        case .drink: return "wineglass.fill"
        case .food:  return "fork.knife"
        case .water: return "drop.fill"
        case .tip:   return "lightbulb.fill"
        case .move:  return "figure.walk"
        }
    }
}

struct NightPlanItem: Identifiable {
    let id = UUID()
    var time: String?      // e.g. "7:15" or "Bar 2" or nil
    var kind: PlanItemKind
    var title: String
    var detail: String
}

struct NightPlan {
    var headline: String
    var items: [NightPlanItem]
    var safety: String

    /// Shareable plain-text version (for group chats etc.).
    var shareText: String {
        var s = "🌙 My Siply night plan\n\n\(headline)\n\n"
        for item in items {
            let t = item.time.map { "\($0) — " } ?? "• "
            s += "\(t)\(item.title): \(item.detail)\n"
        }
        s += "\n\(safety)"
        return s
    }
}
