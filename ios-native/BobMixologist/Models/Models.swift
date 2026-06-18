import Foundation

// Domain models — mirror the web/Expo backend so the API client can later
// switch from local mock data to the real backend with no view changes.

enum AlcoholLevel: String, Codable, CaseIterable {
    case alcoholFree = "alcohol-free"
    case lowAlcohol  = "low-alcohol"
    case fullStrength = "full-strength"

    var label: String {
        switch self {
        case .alcoholFree:  return "0% Alcohol-free"
        case .lowAlcohol:   return "Low-alcohol"
        case .fullStrength: return "Full-strength"
        }
    }
}

/// The structured recipe returned by the AI generator.
struct Recipe: Codable, Hashable {
    var name: String
    var ingredients: [String]
    var method: [String]
    var garnish: String
    var glassware: String
    var tastingNotes: String
    var occasion: String
    var alcoholLevel: AlcoholLevel
    var tags: [String]
}

/// A cocktail as stored / shown in the feed.
struct Cocktail: Identifiable, Hashable {
    let id: String
    var userId: String
    var creatorUsername: String
    var prompt: String
    var recipe: Recipe
    var imageURL: String?
    var isPublic: Bool
    var voteCount: Int
    var voted: Bool
    var createdAt: Date

    // Convenience pass-throughs
    var name: String { recipe.name }
    var tastingNotes: String { recipe.tastingNotes }
    var tags: [String] { recipe.tags }
    var alcoholLevel: AlcoholLevel { recipe.alcoholLevel }
}

struct Comment: Identifiable, Hashable {
    let id: String
    var cocktailId: String
    var username: String
    var body: String
    var createdAt: Date
}

struct SessionUser: Hashable {
    var id: String
    var username: String
    var plan: String   // "free" | "paid"
}

struct ImageUsage: Hashable {
    var used: Int
    var limit: Int
    var remaining: Int { max(0, limit - used) }
}

enum AuthMethod { case google, apple, email }
enum FeedSort: String, CaseIterable { case trending, newest, mostVoted

    var label: String {
        switch self {
        case .trending:  return "Trending"
        case .newest:    return "Newest"
        case .mostVoted: return "Top"
        }
    }
}
