import SwiftUI

/// "Tell the Barman" — the recipe in big, glanceable text to hold up at a
/// busy/noisy bar. Bright high-contrast screen (boosts display brightness),
/// large ingredient list with single/double measures.
struct BarmanView: View {
    let cocktail: Cocktail
    @Environment(\.dismiss) private var dismiss
    @State private var previousBrightness: CGFloat = UIScreen.main.brightness

    private var lines: [String] { cocktail.recipe.ingredients.map(Measures.annotate) }

    var body: some View {
        ZStack {
            Color.white.ignoresSafeArea()

            VStack(alignment: .leading, spacing: 18) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("SHOW THE BARTENDER")
                            .font(.system(size: 14, weight: .heavy))
                            .tracking(2)
                            .foregroundStyle(Theme.coral)
                        Text(cocktail.name)
                            .font(.system(size: 38, weight: .black))
                            .foregroundStyle(Theme.ink)
                            .minimumScaleFactor(0.6)
                            .lineLimit(2)
                    }
                    Spacer()
                    Button { dismiss() } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 34))
                            .foregroundStyle(Theme.ink.opacity(0.25))
                    }
                }

                Text("Serve in: \(cocktail.recipe.glassware)")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(Theme.plum)

                Divider()

                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("INGREDIENTS")
                            .font(.system(size: 14, weight: .heavy)).tracking(2)
                            .foregroundStyle(Theme.coral)
                        ForEach(Array(lines.enumerated()), id: \.offset) { _, line in
                            HStack(alignment: .firstTextBaseline, spacing: 12) {
                                Circle().fill(Theme.coral).frame(width: 12, height: 12)
                                    .offset(y: -4)
                                Text(line)
                                    .font(.system(size: 30, weight: .heavy))
                                    .foregroundStyle(Theme.ink)
                            }
                        }

                        if !cocktail.recipe.method.isEmpty {
                            Text("HOW TO SERVE")
                                .font(.system(size: 14, weight: .heavy)).tracking(2)
                                .foregroundStyle(Theme.coral)
                                .padding(.top, 14)
                            ForEach(Array(cocktail.recipe.method.enumerated()), id: \.offset) { i, step in
                                HStack(alignment: .firstTextBaseline, spacing: 12) {
                                    Text("\(i + 1)")
                                        .font(.system(size: 24, weight: .black))
                                        .foregroundStyle(Theme.coral)
                                    Text(step)
                                        .font(.system(size: 23, weight: .bold))
                                        .foregroundStyle(Theme.ink)
                                }
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }

                Spacer(minLength: 0)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Single = 25ml · Double = 50ml")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(Theme.ink.opacity(0.55))
                    Text("Please drink responsibly. 18+.")
                        .font(.footnote)
                        .foregroundStyle(Theme.ink.opacity(0.4))
                }
            }
            .padding(24)
        }
        // Boost brightness so it's readable in a dark, noisy venue.
        .onAppear {
            previousBrightness = UIScreen.main.brightness
            UIScreen.main.brightness = 1.0
        }
        .onDisappear { UIScreen.main.brightness = previousBrightness }
        .statusBarHidden(true)
    }
}
