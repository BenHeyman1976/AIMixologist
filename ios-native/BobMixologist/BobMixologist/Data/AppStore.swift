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
    // Config — editable in-app via Settings, persisted in UserDefaults.
    @Published var useRemote: Bool {
        didSet { UserDefaults.standard.set(useRemote, forKey: Self.kUseRemote) }
    }
    @Published var apiBaseURL: String {
        didSet { UserDefaults.standard.set(apiBaseURL, forKey: Self.kBaseURL) }
    }
    private static let kUseRemote = "siply.useRemote"
    private static let kBaseURL = "siply.apiBaseURL"

    init() {
        useRemote = UserDefaults.standard.bool(forKey: Self.kUseRemote)
        apiBaseURL = UserDefaults.standard.string(forKey: Self.kBaseURL) ?? ""
    }

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

    // MARK: - Night planner
    // Turns a free-text evening description into a paced, responsible itinerary.
    // TODO(remote): call a /api/plan-night backend endpoint when useRemote.
    func planNight(prompt: String) async -> NightPlan {
        if useRemote, let remote = try? await backend.fetchPlan(prompt: prompt) {
            return remote
        }
        try? await Task.sleep(for: .milliseconds(900))
        let p = prompt.lowercased()

        let heavy = ["wasted", "messy", "big one", "big night", "crawl",
                     "all night", "get drunk", "bars", "smashed"].contains { p.contains($0) }
        let preEvent = ["show", "theatre", "theater", "gig", "concert", "cinema",
                        "dinner", "reservation", "table", "film", "musical", "play",
                        "before"].contains { p.contains($0) }

        // Cuisine-aware pairing.
        let pairing: (name: String, note: String)
        if p.contains("italian") {
            pairing = ("Negroni", "Italian classics love a bittersweet Negroni or an Aperol Spritz")
        } else if p.contains("mexican") {
            pairing = ("Tommy's Margarita", "Mexican food sings with a fresh lime Margarita or Paloma")
        } else if p.contains("japanese") || p.contains("sushi") || p.contains("asian") {
            pairing = ("Yuzu Highball", "Clean and crisp — a citrus highball cuts through beautifully")
        } else if p.contains("indian") || p.contains("curry") {
            pairing = ("Gin & Tonic", "A crisp G&T is a curry-house hero")
        } else {
            pairing = ("House Spritz", "A light, fragrant spritz to set the tone")
        }

        let safety = "Know your limits, never drink-drive, eat well and look out for your group. Siply encourages drinking responsibly. 18+."

        if heavy {
            return NightPlan(
                headline: "A long one — let's pace it so you enjoy the whole night 💪",
                items: [
                    .init(time: "Before", kind: .food, title: "Eat first", detail: "A proper meal before drink #1 — it changes everything."),
                    .init(time: "Bar 1", kind: .drink, title: "Open light", detail: "Start with a lower-ABV spritz or a tall, sessionable highball."),
                    .init(time: nil, kind: .water, title: "Water between rounds", detail: "One glass of water for every drink. Non-negotiable on a big one."),
                    .init(time: "Bars 2–4", kind: .drink, title: "Alternate strengths", detail: "Cocktail, then a soft or low-alcohol round. Sip — don't shot."),
                    .init(time: "Halfway", kind: .food, title: "Refuel", detail: "Grab a snack — pizza slice, dumplings, anything to keep you steady."),
                    .init(time: "Bars 5–8", kind: .drink, title: "Slow the pace", detail: "Stretch each drink over 45+ minutes. Quality over quantity."),
                    .init(time: "Last bars", kind: .water, title: "Wind down", detail: "Switch to soft drinks for the final venues. Future-you says thanks."),
                    .init(time: "Home", kind: .move, title: "Plan your way home", detail: "Book the cab now and share your location with a friend.")
                ],
                safety: safety)
        } else if preEvent {
            return NightPlan(
                headline: "A civilised pre-show couple — relaxed, not rushed 🎭",
                items: [
                    .init(time: "6:30", kind: .drink, title: "Drink one: \(pairing.name)", detail: pairing.note + "."),
                    .init(time: "7:00", kind: .water, title: "A glass of water", detail: "Hydrate so you enjoy the show clear-headed."),
                    .init(time: "7:15", kind: .drink, title: "Drink two: something lighter", detail: "A low-ABV spritz or a glass of prosecco to finish."),
                    .init(time: "7:40", kind: .food, title: "Pre-theatre bite", detail: "A small plate before you head in — bruschetta or arancini."),
                    .init(time: "8:00", kind: .move, title: "Curtain up", detail: "Two drinks in, perfectly paced. Enjoy the show!")
                ],
                safety: safety)
        } else {
            return NightPlan(
                headline: "A relaxed, well-paced plan 🥂",
                items: [
                    .init(time: nil, kind: .drink, title: "Start: \(pairing.name)", detail: pairing.note + "."),
                    .init(time: nil, kind: .water, title: "Hydrate alongside", detail: "A glass of water with it keeps the night smooth."),
                    .init(time: nil, kind: .drink, title: "Second round", detail: "Try a low-alcohol option to stretch the evening out."),
                    .init(time: nil, kind: .food, title: "Grab a bite", detail: "A little food keeps the good times going longer.")
                ],
                safety: safety)
        }
    }
}
