import SwiftUI

/// Prompt → recipe (shown first) → image → publish. Recipe-first = drunk-proof.
struct CreateView: View {
    var onPublished: () -> Void
    @EnvironmentObject var store: AppStore

    @State private var prompt = ""
    @State private var recipe: Recipe?
    @State private var imageURL: String?
    @State private var published = false
    @State private var genLoading = false
    @State private var imgLoading = false
    @State private var showLimitNote = false

    private let examples = [
        "Aperol + Trip CBD summer spritz",
        "Low-alcohol Christmas cocktail",
        "Something tropical for a BBQ"
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Create a cocktail")
                    .font(.system(size: 30, weight: .black)).foregroundStyle(Theme.plum)
                Text("Describe an idea, mood, brand or occasion. Recipes are unlimited & free.")
                    .foregroundStyle(Theme.ink.opacity(0.7))

                TextField("e.g. Relaxing Aperol & Trip CBD spritz for summer",
                          text: $prompt, axis: .vertical)
                    .lineLimit(3...6)
                    .padding(16)
                    .background(.white, in: RoundedRectangle(cornerRadius: 18))
                    .foregroundStyle(Theme.ink)

                if recipe == nil {
                    ForEach(examples, id: \.self) { ex in
                        Button { prompt = ex } label: {
                            Text(ex).font(.system(size: 14, weight: .bold))
                                .foregroundStyle(Theme.plum)
                                .padding(.horizontal, 14).padding(.vertical, 10)
                                .background(Theme.peach.opacity(0.25), in: Capsule())
                        }
                    }
                }

                PrimaryButton(title: recipe == nil ? "Generate recipe 🍹" : "Regenerate 🔄",
                              loading: genLoading,
                              disabled: prompt.trimmingCharacters(in: .whitespaces).count < 3) {
                    generate()
                }

                if genLoading && recipe == nil {
                    VStack(spacing: 12) {
                        ProgressView().controlSize(.large).tint(Theme.coral)
                        Text("Siply is shaking things up…")
                            .font(.system(size: 18, weight: .heavy)).foregroundStyle(Theme.plum)
                    }
                    .frame(maxWidth: .infinity).padding(.vertical, 36)
                }

                if let recipe { resultCard(recipe) }
            }
            .padding(20)
            .padding(.top, 8)
        }
        .background(Theme.cream)
        .alert("That's your images for this month 📸", isPresented: $showLimitNote) {
            Button("Got it", role: .cancel) {}
        } message: {
            Text("You've used all \(AppStore.freeMonthlyImages) free AI images this month — they reset on the 1st. Recipes and night plans are still unlimited, so keep creating!")
        }
    }

    @ViewBuilder
    private func resultCard(_ recipe: Recipe) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            // Hero
            Group {
                if let imageURL {
                    AsyncImage(url: URL(string: imageURL)) { img in
                        img.resizable().scaledToFill()
                    } placeholder: { Theme.warmGradient }
                } else {
                    ZStack {
                        Theme.peach
                        VStack(spacing: 8) {
                            Text("🍸").font(.system(size: 48))
                            Text("Generate an image to bring it to life")
                                .foregroundStyle(Theme.plum)
                        }
                    }
                }
            }
            .frame(height: 200).frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: 18))

            Text(recipe.name).font(.system(size: 24, weight: .black))
                .foregroundStyle(Theme.plum).padding(.top, 10)

            label("Ingredients")
            ForEach(Array(recipe.ingredients.enumerated()), id: \.offset) { _, i in
                Text("•  \(i)").foregroundStyle(Theme.ink)
            }
            label("Method")
            ForEach(Array(recipe.method.enumerated()), id: \.offset) { idx, m in
                Text("\(idx + 1).  \(m)").foregroundStyle(Theme.ink)
            }

            Text(recipe.tastingNotes).italic()
                .foregroundStyle(Theme.ink.opacity(0.8)).padding(.top, 10)

            HStack { ForEach(recipe.tags, id: \.self) { ChipView(label: "#\($0)", tone: .peach) } }
                .padding(.top, 8)

            ForEach(Compliance.notes(for: recipe), id: \.self) { note in
                Text("⚠️  \(note)").font(.footnote).foregroundStyle(Theme.plum)
                    .padding(12).frame(maxWidth: .infinity, alignment: .leading)
                    .background(Theme.amber.opacity(0.12), in: RoundedRectangle(cornerRadius: 14))
            }

            HStack(spacing: 10) {
                PrimaryButton(title: imgLoading ? "Generating…" : (imageURL == nil ? "Image 🖼️" : "Re-image 🖼️"),
                              variant: .secondary, loading: imgLoading) { generateImage(recipe) }
                    .tint(Theme.plum)
                PrimaryButton(title: published ? "Published ✓" : "Publish 🌍",
                              disabled: published) { publish(recipe) }
            }
            .padding(.top, 16)
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 28))
        .padding(.top, 6)
    }

    private func label(_ t: String) -> some View {
        Text(t).font(.system(size: 17, weight: .heavy)).foregroundStyle(Theme.plum).padding(.top, 12)
    }

    // MARK: actions
    private func generate() {
        genLoading = true; published = false; imageURL = nil
        Task {
            recipe = await store.generateRecipe(prompt: prompt)
            genLoading = false
        }
    }

    private func generateImage(_ recipe: Recipe) {
        imgLoading = true
        Task {
            switch await store.generateImage(name: recipe.name) {
            case .success(let url): imageURL = url
            case .limitReached: showLimitNote = true   // out of free images this month
            }
            imgLoading = false
        }
    }

    private func publish(_ recipe: Recipe) {
        store.saveCocktail(prompt: prompt, recipe: recipe, imageURL: imageURL, isPublic: true)
        published = true
        onPublished()
    }
}
