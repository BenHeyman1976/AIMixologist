import Foundation

// Seed cocktails + comments for the feed. Images use picsum's seeded endpoint
// so they're stable and attractive with no backend.
enum MockData {
    static func img(_ seed: String) -> String {
        let s = seed.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? seed
        return "https://picsum.photos/seed/\(s)/1080/1920"
    }

    static func seedCocktails() -> [Cocktail] {
        [
            Cocktail(
                id: "seed-1", userId: "u1", creatorUsername: "tiki_tom",
                prompt: "Something tropical for a BBQ",
                recipe: Recipe(
                    name: "Sunset Mango Breeze",
                    ingredients: ["50ml gold rum", "60ml fresh mango purée", "20ml lime juice", "Top with soda water", "Cubed ice"],
                    method: ["Fill a glass with ice.", "Add rum, mango purée and lime juice.", "Stir and top with soda.", "Garnish and serve."],
                    garnish: "Mango fan and mint sprig", glassware: "Highball glass",
                    tastingNotes: "Bright, juicy and sun-soaked with a clean fizzy finish.",
                    occasion: "Summer BBQ", alcoholLevel: .fullStrength,
                    tags: ["tropical", "summer", "rum"]),
                imageURL: img("Sunset Mango Breeze"), isPublic: true,
                voteCount: 128, voted: false, createdAt: Date().addingTimeInterval(-3600 * 5)),

            Cocktail(
                id: "seed-2", userId: "u2", creatorUsername: "calm_coast",
                prompt: "Relaxing Aperol and Trip CBD spritz for summer",
                recipe: Recipe(
                    name: "Calm Coast Spritz",
                    ingredients: ["50ml chilled sparkling wine", "30ml bitter orange aperitif", "1 measure CBD-infused tonic (flavour only)", "Cubed ice"],
                    method: ["Fill a wine glass with ice.", "Add aperitif and sparkling wine.", "Top with CBD tonic and stir gently."],
                    garnish: "Orange slice", glassware: "Large wine glass",
                    tastingNotes: "Light, bittersweet and gently fragrant — easy summer sipping.",
                    occasion: "Relaxed evening", alcoholLevel: .lowAlcohol,
                    tags: ["wellness", "spritz", "low-alcohol"]),
                imageURL: img("Calm Coast Spritz"), isPublic: true,
                voteCount: 86, voted: false, createdAt: Date().addingTimeInterval(-3600 * 12)),

            Cocktail(
                id: "seed-3", userId: "u3", creatorUsername: "zero_proof_zoe",
                prompt: "Alcohol-free refreshing mint cooler",
                recipe: Recipe(
                    name: "Garden Party No-jito",
                    ingredients: ["12 fresh mint leaves", "25ml lime juice", "15ml sugar syrup", "Top with soda water", "Crushed ice"],
                    method: ["Muddle mint with lime and syrup.", "Fill with crushed ice.", "Top with soda and churn."],
                    garnish: "Mint bouquet and lime wheel", glassware: "Tall glass",
                    tastingNotes: "Cool, zingy and herbaceous — all the refreshment, none of the alcohol.",
                    occasion: "Afternoon in the garden", alcoholLevel: .alcoholFree,
                    tags: ["alcohol-free", "refreshing", "mint"]),
                imageURL: img("Garden Party Nojito"), isPublic: true,
                voteCount: 64, voted: false, createdAt: Date().addingTimeInterval(-3600 * 26)),

            Cocktail(
                id: "seed-4", userId: "u4", creatorUsername: "festive_finn",
                prompt: "Low-alcohol Christmas cocktail",
                recipe: Recipe(
                    name: "Spiced Cranberry Glow",
                    ingredients: ["40ml spiced cranberry syrup", "25ml sparkling wine", "Top with soda", "Cubed ice"],
                    method: ["Build over ice.", "Stir gently.", "Garnish and serve warm-spiced."],
                    garnish: "Orange twist and rosemary", glassware: "Coupe",
                    tastingNotes: "Warm, spiced and gently tart — a cosy seasonal sipper.",
                    occasion: "Holiday gathering", alcoholLevel: .lowAlcohol,
                    tags: ["festive", "low-alcohol", "winter"]),
                imageURL: img("Spiced Cranberry Glow"), isPublic: true,
                voteCount: 41, voted: false, createdAt: Date().addingTimeInterval(-3600 * 40))
        ]
    }

    static func seedComments() -> [Comment] {
        [
            Comment(id: "c1", cocktailId: "seed-1", username: "barfly_bex",
                    body: "Made this for the weekend — huge hit! 🔥",
                    createdAt: Date().addingTimeInterval(-3600 * 3)),
            Comment(id: "c2", cocktailId: "seed-1", username: "rum_runner",
                    body: "Added a dash of bitters, chef's kiss.",
                    createdAt: Date().addingTimeInterval(-3600 * 2)),
            Comment(id: "c3", cocktailId: "seed-2", username: "spritz_squad",
                    body: "Perfect for the heatwave 🧡",
                    createdAt: Date().addingTimeInterval(-3600 * 1))
        ]
    }
}
