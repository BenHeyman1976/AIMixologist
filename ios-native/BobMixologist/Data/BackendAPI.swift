import Foundation

// ─────────────────────────────────────────────────────────────
// BackendAPI — talks to the Next.js web backend (the repo root app).
//
// Only used when AppStore.useRemote == true. Decodes the backend's snake_case
// JSON into our Swift models. Endpoints:
//   GET  /api/feed?sort=
//   POST /api/generate-recipe   { prompt }
//   POST /api/generate-image    { name, prompt }
// ─────────────────────────────────────────────────────────────

enum BackendError: Error { case badURL, imageLimit, server(String) }

struct BackendAPI {
    let baseURL: String

    // MARK: DTOs (match the web JSON shapes)

    private struct RecipeDTO: Decodable {
        let name: String
        let ingredients: [String]
        let method: [String]
        let garnish: String
        let glassware: String
        let tasting_notes: String
        let occasion: String
        let alcohol_level: String
        let tags: [String]

        func toModel() -> Recipe {
            Recipe(
                name: name, ingredients: ingredients, method: method,
                garnish: garnish, glassware: glassware,
                tastingNotes: tasting_notes, occasion: occasion,
                alcoholLevel: AlcoholLevel(rawValue: alcohol_level) ?? .fullStrength,
                tags: tags)
        }
    }

    private struct CocktailDTO: Decodable {
        let id: String
        let user_id: String
        let name: String
        let prompt: String
        let ingredients: [String]
        let method: [String]
        let garnish: String?
        let glassware: String?
        let tasting_notes: String?
        let occasion: String?
        let alcohol_level: String
        let tags: [String]
        let image_url: String?
        let is_public: Bool
        let vote_count: Int
        let created_at: String
        let creator_username: String?

        func toModel() -> Cocktail {
            let recipe = Recipe(
                name: name, ingredients: ingredients, method: method,
                garnish: garnish ?? "", glassware: glassware ?? "",
                tastingNotes: tasting_notes ?? "", occasion: occasion ?? "",
                alcoholLevel: AlcoholLevel(rawValue: alcohol_level) ?? .fullStrength,
                tags: tags)
            return Cocktail(
                id: id, userId: user_id,
                creatorUsername: creator_username ?? "mixologist",
                prompt: prompt, recipe: recipe, imageURL: image_url,
                isPublic: is_public, voteCount: vote_count, voted: false,
                createdAt: ISO8601DateFormatter().date(from: created_at) ?? Date())
        }
    }

    private struct FeedResponse: Decodable { let cocktails: [CocktailDTO] }
    private struct RecipeResponse: Decodable { let recipe: RecipeDTO }
    private struct UsageDTO: Decodable { let used: Int; let limit: Int }
    private struct ImageResponse: Decodable { let image_url: String?; let usage: UsageDTO? }

    // MARK: Requests

    func fetchFeed(sort: FeedSort) async throws -> [Cocktail] {
        let sortParam = sort == .mostVoted ? "most_voted" : sort.rawValue
        guard let url = URL(string: "\(baseURL)/api/feed?sort=\(sortParam)") else {
            throw BackendError.badURL
        }
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(FeedResponse.self, from: data).cocktails.map { $0.toModel() }
    }

    func generateRecipe(prompt: String) async throws -> Recipe {
        let data = try await post("/api/generate-recipe", body: ["prompt": prompt])
        return try JSONDecoder().decode(RecipeResponse.self, from: data).recipe.toModel()
    }

    /// Returns (imageURL, usage). Throws `.imageLimit` on a 402 quota response.
    func generateImage(name: String, prompt: String) async throws -> (String, ImageUsage?) {
        guard let url = URL(string: "\(baseURL)/api/generate-image") else { throw BackendError.badURL }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: ["name": name, "prompt": prompt])

        let (data, response) = try await URLSession.shared.data(for: req)
        if let http = response as? HTTPURLResponse, http.statusCode == 402 {
            throw BackendError.imageLimit
        }
        let decoded = try JSONDecoder().decode(ImageResponse.self, from: data)
        guard let imageURL = decoded.image_url else { throw BackendError.server("No image returned") }
        let usage = decoded.usage.map { ImageUsage(used: $0.used, limit: $0.limit) }
        return (imageURL, usage)
    }

    // MARK: Helpers

    private func post(_ path: String, body: [String: Any]) async throws -> Data {
        guard let url = URL(string: "\(baseURL)\(path)") else { throw BackendError.badURL }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, _) = try await URLSession.shared.data(for: req)
        return data
    }
}
