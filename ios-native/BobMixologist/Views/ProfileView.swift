import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var store: AppStore

    private let cols = [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Header
                HStack(spacing: 14) {
                    ZStack {
                        Circle().fill(Theme.peach).frame(width: 60, height: 60)
                        Text("🍹").font(.system(size: 28))
                    }
                    VStack(alignment: .leading) {
                        Text("@\(store.user?.username ?? "guest")")
                            .font(.system(size: 22, weight: .black)).foregroundStyle(Theme.plum)
                        Text("\(store.user?.plan ?? "free") plan")
                            .foregroundStyle(Theme.ink.opacity(0.6))
                    }
                    Spacer()
                    Button("Log out") { store.logout() }
                        .font(.system(size: 15, weight: .heavy)).foregroundStyle(Theme.coral)
                }

                // Image allowance
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Monthly image allowance")
                            .font(.system(size: 16, weight: .heavy)).foregroundStyle(Theme.plum)
                        Spacer()
                        Text("\(store.imageUsage.used)/\(store.imageUsage.limit)")
                            .font(.system(size: 16, weight: .heavy)).foregroundStyle(Theme.plum)
                    }
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Theme.peach.opacity(0.25))
                            Capsule().fill(Theme.coral)
                                .frame(width: geo.size.width * progress)
                        }
                    }
                    .frame(height: 12)
                    Text("\(store.imageUsage.remaining) image generations left this month. Recipes are always unlimited.")
                        .font(.footnote).foregroundStyle(Theme.ink.opacity(0.6))
                    // TODO(billing): "Upgrade" → paid plan raises this allowance.
                    Text("Upgrade for more images (coming soon)")
                        .font(.system(size: 14, weight: .bold)).foregroundStyle(Theme.ink.opacity(0.5))
                        .frame(maxWidth: .infinity).padding(.vertical, 12)
                        .background(Color.black.opacity(0.05), in: Capsule())
                }
                .padding(18)
                .background(.white, in: RoundedRectangle(cornerRadius: 28))

                Text("Your published cocktails (\(published.count))")
                    .font(.system(size: 18, weight: .heavy)).foregroundStyle(Theme.plum)

                if published.isEmpty {
                    Text("Nothing published yet — head to Create and share your first one!")
                        .foregroundStyle(Theme.ink.opacity(0.6))
                } else {
                    LazyVGrid(columns: cols, spacing: 12) {
                        ForEach(published) { c in tile(c) }
                    }
                }
            }
            .padding(20)
            .padding(.top, 8)
        }
        .background(Theme.cream)
    }

    private var published: [Cocktail] { store.myCocktails.filter { $0.isPublic } }
    private var progress: CGFloat {
        store.imageUsage.limit == 0 ? 0 :
            min(1, CGFloat(store.imageUsage.used) / CGFloat(store.imageUsage.limit))
    }

    private func tile(_ c: Cocktail) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            AsyncImage(url: URL(string: c.imageURL ?? "")) { img in
                img.resizable().scaledToFill()
            } placeholder: {
                ZStack { Theme.peach; Text("🍸").font(.system(size: 28)) }
            }
            .frame(maxWidth: .infinity).aspectRatio(1, contentMode: .fill)
            .clipShape(RoundedRectangle(cornerRadius: 18))

            Text(c.name).font(.system(size: 14, weight: .heavy))
                .foregroundStyle(Theme.plum).lineLimit(1)
            Text("❤️ \(c.voteCount)").font(.footnote).foregroundStyle(Theme.ink.opacity(0.6))
        }
    }
}
