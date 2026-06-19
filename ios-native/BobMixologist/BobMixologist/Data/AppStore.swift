import Foundation
import SwiftUI

// ─────────────────────────────────────────────────────────────
// AppStore — the single source of truth (an ObservableObject).
//
// Defaults to LOCAL mode: bundled mock data + on-device mock generation, so
// the app runs instantly with no backend. To use the real web backend, set
// `useRemote = true` and `apiBaseURL` (the Next.js app in the parent folder).
// Remote calls go through BackendAPI; if any call fails the store falls back
// to local mock behaviour so the app never gets stuck.
// ─────────────────────────────────────────────────────────────

@MainActor
final class AppStore: ObservableObject {
    // Config
    let useRemote = false
    let apiBaseURL = "" // e.g. "http://192.168.1.42:3000" or your deployed URL

    private var backend: BackendAPI { BackendAPI(baseURL: apiBaseURL) }

    // Session
    @Published var user: SessionUser?

    // Data
    @Published private(set) var cocktails: [Cocktail] = MockData.seedCocktails()
    @Published private(set) var comments: [Comment] = MockData.seedComments()
    @Published private(set) var imageUsage = ImageUsage(used: 0, limit: 3)

    // MARK: - Auth (mock)
    // TODO(auth): replace with Supabase Google/Apple OAuth + email magic links.

    /// Signs the user in immediately (synchronous), so the UI always advances.
    func signIn(_ method: AuthMethod, email: String = "") {
        let username: String
        switch method {
        case .email: username = email.split(separator: "@").first.map(String.init)?.lowercased() ?? "mixologist"
        case .google: username = "google_user"
        case .apple: username = "apple_user"
        }
        user = SessionUser(id: "me", username: username, plan: "free")
    }

    /// Enter without a provider — a guaranteed path into the app.
    func continueAsGuest() {
        user = SessionUser(id: "me", username: "guest", plan: "free")
    }

    func logout() { user = nil }

    // MARK: - Feed
    /// In remote mode, fetches the live feed and replaces local data. In local
    /// mode this is a no-op (the seed data is already loaded). Call from a view
    /// `.task`. Falls back silently to whatever is already loaded on error.
    func refreshFeed(sort: FeedSort) async {
        guard useRemote else { return }
        if let fetched = try? await backend.fetchFeed(sort: sort) {
            cocktails = fetched
        }
    }

    func feed(sort: FeedSort) -> [Cocktail] {
        switch sort {
        case .mostVoted:
            return cocktails.sorted { $0.voteCount > $1.voteCount }
        case .newest:
            return cocktails.sorted { $0.createdAt > $1.createdAt }
        case .trending:
            func score(_ c: Cocktail) -> Double {
                let ageH = Date().timeIntervalSince(c.createdAt) / 3600
                return Double(c.voteCount + 1) / pow(ageH + 2, 1.5)
            }
            return cocktails.sorted { score($0) > score($1) }
        }
    }

    var myCocktails: [Cocktail] { cocktails.filter { $0.userId == "me" } }

    // MARK: - Recipe generation (mock — mirrors web lib/ai.ts)
    func generateRecipe(prompt: String) async -> Recipe {
        if useRemote, let remote = try? await backend.generateRecipe(prompt: prompt) {
            return remote
        }
        // Local mock generation (also the fallback if the backend call fails).
        try? await Task.sleep(for: .milliseconds(900))
        let p = prompt.lowercased()

        let alcoholFree = ["alcohol-free", "alcohol free", "mocktail", "no alcohol"].contains { p.contains($0) }
        let lowAlcohol = !alcoholFree && ["low-alcohol", "low alcohol", "light"].contains { p.contains($0) }
        let level: AlcoholLevel = alcoholFree ? .alcoholFree : (lowAlcohol ? .lowAlcohol : .fullStrength)

        let tropical = ["tropical", "bbq", "beach"].contains { p.contains($0) }
        let festive = ["christmas", "festive", "winter"].contains { p.contains($0) }
        let wellness = ["cbd", "trip", "relax"].contains { p.contains($0) }

        let name = tropical ? "Sunset Mango Breeze"
                 : festive ? "Spiced Cranberry Glow"
                 : wellness ? "Calm Coast Spritz"
                 : "Siply House Spritz"

        let baseSpirit = alcoholFree ? "100ml premium alcohol-free aperitif"
                       : lowAlcohol ? "50ml chilled sparkling wine"
                       : "50ml gin"

        return Recipe(
            name: name,
            ingredients: [
                baseSpirit,
                tropical ? "60ml fresh mango purée" : "30ml fresh citrus juice",
                festive ? "20ml spiced cranberry syrup" : "15ml elderflower cordial",
                wellness ? "1 measure CBD-infused tonic (flavour only)" : "Top with chilled soda water",
                "Plenty of cubed ice"
            ],
            method: [
                "Fill a large glass with cubed ice.",
                "Add the base and remaining liquid ingredients.",
                "Stir gently to combine and chill.",
                "Top up, give one final light stir, garnish and serve."
            ],
            garnish: tropical ? "Mango fan and a mint sprig" : (festive ? "Orange twist and rosemary" : "Orange slice"),
            glassware: "Large wine glass or balloon glass",
            tastingNotes: tropical ? "Bright, juicy and sun-soaked with a clean fizzy finish."
                        : festive ? "Warm, spiced and gently tart — a cosy seasonal sipper."
                        : "Crisp, citrus-forward and easy-going with a light, fragrant lift.",
            occasion: tropical ? "Summer BBQ" : (festive ? "Holiday gathering" : "Relaxed evening"),
            alcoholLevel: level,
            tags: [
                tropical ? "tropical" : (festive ? "festive" : "refreshing"),
                level.rawValue,
                wellness ? "wellness" : "easy-drinking"
            ]
        )
    }

    // MARK: - Image generation (mock, quota-limited)
    enum ImageResult { case success(String), limitReached }

    func generateImage(name: String) async -> ImageResult {
        if useRemote {
            do {
                let (url, usage) = try await backend.generateImage(name: name, prompt: name)
                if let usage { imageUsage = usage }
                return .success(url)
            } catch BackendError.imageLimit {
                return .limitReached
            } catch {
                return .limitReached
            }
        }
        // Local mock generation, quota-limited.
        guard imageUsage.remaining > 0 else { return .limitReached }
        try? await Task.sleep(for: .milliseconds(1200))
        imageUsage.used += 1
        return .success(MockData.img(name))
    }

    // MARK: - Save / publish
    @discardableResult
    func saveCocktail(prompt: String, recipe: Recipe, imageURL: String?, isPublic: Bool) -> Cocktail {
        let c = Cocktail(
            id: "local-\(Int(Date().timeIntervalSince1970 * 1000))",
            userId: "me",
            creatorUsername: user?.username ?? "guest",
            prompt: prompt, recipe: recipe, imageURL: imageURL,
            isPublic: isPublic, voteCount: 0, voted: false, createdAt: Date())
        cocktails.insert(c, at: 0)
        return c
    }

    // MARK: - Votes (one per user per cocktail)
    func toggleVote(_ cocktail: Cocktail) {
        guard let i = cocktails.firstIndex(where: { $0.id == cocktail.id }) else { return }
        cocktails[i].voted.toggle()
        cocktails[i].voteCount += cocktails[i].voted ? 1 : -1
    }

    // MARK: - Comments
    func comments(for cocktailId: String) -> [Comment] {
        comments.filter { $0.cocktailId == cocktailId }
            .sorted { $0.createdAt < $1.createdAt }
    }

    @discardableResult
    func addComment(cocktailId: String, body: String) -> Comment {
        let c = Comment(
            id: "cm-\(Int(Date().timeIntervalSince1970 * 1000))",
            cocktailId: cocktailId,
            username: user?.username ?? "guest",
            body: body, createdAt: Date())
        comments.append(c)
        return c
    }

    // MARK: - "Did you like it?" tried-it feedback
    // cocktailId -> 1 loved it · 0 it was ok · -1 not for me
    @Published var ratings: [String: Int] = [:]

    func setRating(_ cocktailId: String, _ value: Int) {
        // A "loved it" also counts as a community vote if not already voted.
        if value == 1, let i = cocktails.firstIndex(where: { $0.id == cocktailId }),
           !(cocktails[i].voted) {
            cocktails[i].voted = true
            cocktails[i].voteCount += 1
        }
        ratings[cocktailId] = value
    }

    func rating(for cocktailId: String) -> Int? { ratings[cocktailId] }
}
