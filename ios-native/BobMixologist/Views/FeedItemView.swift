import SwiftUI

/// One full-screen, swipeable cocktail — the core of the feed.
struct FeedItemView: View {
    let cocktail: Cocktail
    let commentCount: Int
    let onLike: () -> Void
    let onRecipe: () -> Void
    let onComments: () -> Void

    var body: some View {
        ZStack {
            // Background image
            AsyncImage(url: URL(string: cocktail.imageURL ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                default:
                    Theme.warmGradient
                }
            }
            .clipped()

            // Legibility scrims
            LinearGradient(colors: [.black.opacity(0.35), .clear],
                           startPoint: .top, endPoint: .center)
            LinearGradient(colors: [.clear, .black.opacity(0.55)],
                           startPoint: .center, endPoint: .bottom)

            // Right action rail
            HStack {
                Spacer()
                VStack(spacing: 22) {
                    railButton(cocktail.voted ? "heart.fill" : "heart",
                               label: "\(cocktail.voteCount)",
                               tint: cocktail.voted ? Theme.coral : .white,
                               action: onLike)
                    railButton("bubble.right", label: "\(commentCount)", action: onComments)

                    ShareLink(item: shareText) {
                        railLabelStack(systemName: "square.and.arrow.up", label: "Share")
                    }
                    railButton("book", label: "Recipe", action: onRecipe)
                }
                .padding(.trailing, 14)
                .padding(.bottom, 150)
            }

            // Bottom info
            VStack(alignment: .leading, spacing: 6) {
                Spacer()
                ChipView(label: cocktail.alcoholLevel.label)
                Text(cocktail.name)
                    .font(.system(size: 28, weight: .black)).foregroundStyle(.white)
                Text("@\(cocktail.creatorUsername)")
                    .font(.system(size: 15, weight: .bold)).foregroundStyle(Theme.peach)
                Text(cocktail.tastingNotes)
                    .font(.system(size: 14)).foregroundStyle(.white.opacity(0.9))
                    .lineLimit(2)
                HStack(spacing: 10) {
                    ForEach(cocktail.tags.prefix(3), id: \.self) { t in
                        Text("#\(t)").font(.system(size: 13, weight: .bold)).foregroundStyle(.white)
                    }
                }
                Button(action: onRecipe) {
                    Text("View full recipe →")
                        .font(.system(size: 14, weight: .heavy)).foregroundStyle(.white)
                        .padding(.horizontal, 16).padding(.vertical, 10)
                        .background(Color.white.opacity(0.16), in: Capsule())
                }
                .padding(.top, 6)
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 130)
            .padding(.trailing, 70)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Theme.ink)
    }

    private var shareText: String {
        "\(cocktail.name) 🍹 — \(cocktail.tastingNotes)\nMade with Bob the AI Mixologist"
    }

    private func railButton(_ systemName: String, label: String, tint: Color = .white,
                            action: @escaping () -> Void) -> some View {
        Button(action: action) {
            railLabelStack(systemName: systemName, label: label, tint: tint)
        }
    }

    private func railLabelStack(systemName: String, label: String, tint: Color = .white) -> some View {
        VStack(spacing: 4) {
            Image(systemName: systemName)
                .font(.system(size: 28))
                .foregroundStyle(tint)
            Text(label).font(.system(size: 12, weight: .bold)).foregroundStyle(.white)
        }
    }
}
