import SwiftUI

/// Bottom sheet with the full recipe + "shop the ingredients" affiliate links.
struct RecipeSheetView: View {
    let cocktail: Cocktail
    @Environment(\.dismiss) private var dismiss

    private var notes: [String] { Compliance.notes(for: cocktail.recipe) }
    private var shoppable: [String] { cocktail.recipe.ingredients.filter(Affiliates.isShoppable) }

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
