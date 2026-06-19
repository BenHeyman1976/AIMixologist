import SwiftUI

/// Bottom sheet with the full recipe + "shop the ingredients" affiliate links.
struct RecipeSheetView: View {
    let cocktail: Cocktail
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @State private var showBarman = false

    private var notes: [String] { Compliance.notes(for: cocktail.recipe) }
    private var shoppable: [String] { cocktail.recipe.ingredients.filter(Affiliates.isShoppable) }

    /// Shareable shopping list — perfect to send to whoever's on delivery duty
    /// or to drop into a grocery app's order notes.
    private var shoppingListText: String {
        var s = "🍸 \(cocktail.name) — shopping list\n\n"
        for ing in cocktail.recipe.ingredients { s += "• \(ing)\n" }
        s += "\nServe in: \(cocktail.recipe.glassware)\n\nMade with Siply 🍸\nPlease drink responsibly. 18+."
        return s
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    if let url = cocktail.imageURL {
                        AsyncImage(url: URL(string: url)) { img in
                            img.resizable().scaledToFill()
                        } placeholder: { Theme.warmGradient }
                        .frame(height: 220).frame(maxWidth: .infinity)
                        .clipShape(RoundedRectangle(cornerRadius: 18))
                    }

                    Text(cocktail.name)
                        .font(.system(size: 26, weight: .black)).foregroundStyle(Theme.plum)
                        .padding(.top, 14)
                    Text("@\(cocktail.creatorUsername) · \(cocktail.recipe.occasion)")
                        .font(.subheadline).foregroundStyle(Theme.ink.opacity(0.6))

                    // Night out: show staff the recipe big. Night in: share the
                    // shopping list (delivery app, WhatsApp the host, etc.).
                    HStack(spacing: 10) {
                        Button { showBarman = true } label: {
                            Label("Tell the barman", systemImage: "megaphone.fill")
                                .font(.system(size: 16, weight: .heavy))
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(Theme.plum, in: Capsule())
                        }
                        ShareLink(item: shoppingListText) {
                            Label("Share list", systemImage: "square.and.arrow.up")
                                .font(.system(size: 16, weight: .heavy))
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(Theme.coral, in: Capsule())
                        }
                    }
                    .padding(.top, 16)

                    section("Ingredients") {
                        ForEach(Array(cocktail.recipe.ingredients.enumerated()), id: \.offset) { _, ing in
                            Text("•  \(ing)").bodyRow()
                        }
                    }
                    section("Method") {
                        ForEach(Array(cocktail.recipe.method.enumerated()), id: \.offset) { i, step in
                            Text("\(i + 1).  \(step)").bodyRow()
                        }
                    }

                    HStack(spacing: 12) {
                        fact("Garnish", cocktail.recipe.garnish)
                        fact("Glassware", cocktail.recipe.glassware)
                    }
                    .padding(.top, 16)

                    section("Tasting notes") {
                        Text(cocktail.tastingNotes).italic()
                            .foregroundStyle(Theme.ink.opacity(0.85))
                    }

                    if !shoppable.isEmpty {
                        section("🛒 Shop the ingredients") {
                            ForEach(shoppable, id: \.self) { ing in
                                VStack(alignment: .leading, spacing: 6) {
                                    Text(ing).font(.system(size: 14)).foregroundStyle(Theme.ink)
                                    HStack(spacing: 8) {
                                        ForEach(Affiliates.links(for: ing)) { link in
                                            Link(destination: link.url) {
                                                ChipView(label: link.name, tone: .peach)
                                            }
                                        }
                                    }
                                }
                                .padding(.bottom, 8)
                            }
                            Text("We may earn a small commission, at no extra cost to you.")
                                .font(.caption).foregroundStyle(Theme.ink.opacity(0.5))
                        }
                    }

                    // Post-drink feedback — "did you like it?" after trying it.
                    triedItSection

                    ForEach(notes, id: \.self) { note in
                        Text("⚠️  \(note)")
                            .font(.footnote).foregroundStyle(Theme.plum)
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Theme.amber.opacity(0.12), in: RoundedRectangle(cornerRadius: 14))
                            .padding(.top, 12)
                    }
                }
                .padding(20)
            }
            .background(Theme.cream)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { dismiss() } label: { Image(systemName: "xmark.circle.fill") }
                        .tint(Theme.plum)
                }
            }
        }
        .presentationDragIndicator(.visible)
        .fullScreenCover(isPresented: $showBarman) {
            BarmanView(cocktail: cocktail)
        }
    }

    // "Did you like it?" — shown so people can rate a drink after trying it.
    private var triedItSection: some View {
        let current = store.rating(for: cocktail.id)
        return VStack(alignment: .leading, spacing: 10) {
            Text(current == nil ? "Tried it? How was it?" : "Thanks for the feedback! 🥂")
                .font(.system(size: 18, weight: .heavy)).foregroundStyle(Theme.plum)
            HStack(spacing: 10) {
                ratingButton(emoji: "😍", label: "Loved it", value: 1, current: current)
                ratingButton(emoji: "🙂", label: "It was OK", value: 0, current: current)
                ratingButton(emoji: "😕", label: "Not for me", value: -1, current: current)
            }
        }
        .padding(.top, 18)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func ratingButton(emoji: String, label: String, value: Int, current: Int?) -> some View {
        let selected = current == value
        return Button {
            store.setRating(cocktail.id, value)
        } label: {
            VStack(spacing: 4) {
                Text(emoji).font(.system(size: 26))
                Text(label).font(.system(size: 12, weight: .bold))
                    .foregroundStyle(selected ? .white : Theme.plum)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(selected ? Theme.coral : Color.white, in: RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Theme.coral.opacity(0.4), lineWidth: selected ? 0 : 1)
            )
        }
    }

    @ViewBuilder
    private func section<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.system(size: 18, weight: .heavy)).foregroundStyle(Theme.plum)
            content()
        }
        .padding(.top, 18)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func fact(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label.uppercased()).font(.system(size: 11, weight: .bold))
                .foregroundStyle(Theme.ink.opacity(0.5))
            Text(value).font(.system(size: 14)).foregroundStyle(Theme.ink)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(.white, in: RoundedRectangle(cornerRadius: 18))
    }
}

private extension Text {
    func bodyRow() -> some View {
        self.font(.system(size: 15)).foregroundStyle(Theme.ink)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}
