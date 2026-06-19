import SwiftUI

/// Full-screen, vertically-swipeable feed — the TikTok-style discovery surface.
struct FeedView: View {
    @EnvironmentObject var store: AppStore
    @State private var sort: FeedSort = .trending
    @State private var recipeSheet: Cocktail?
    @State private var commentsSheet: Cocktail?

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            LazyVStack(spacing: 0) {
                ForEach(store.feed(sort: sort)) { cocktail in
                    FeedItemView(
                        cocktail: cocktail,
                        commentCount: store.comments(for: cocktail.id).count,
                        onLike: { store.toggleVote(cocktail) },
                        onRecipe: { recipeSheet = cocktail },
                        onComments: { commentsSheet = cocktail }
                    )
                    // Size each page to the full scroll container for exact paging.
                    .containerRelativeFrame([.horizontal, .vertical])
                }
            }
            .scrollTargetLayout()
        }
        .scrollTargetBehavior(.paging)
        .ignoresSafeArea()
        .background(Theme.ink)
        .overlay(alignment: .top) { header }
        .sheet(item: $recipeSheet) { RecipeSheetView(cocktail: $0) }
        .sheet(item: $commentsSheet) { CommentsView(cocktail: $0) }
        // Loads the live feed in remote mode; no-op in local/mock mode.
        .task(id: sort) { await store.refreshFeed(sort: sort) }
    }

    private var header: some View {
        HStack {
            Text("Siply").font(.system(size: 22, weight: .black)).foregroundStyle(.white)
            Spacer()
            HStack(spacing: 16) {
                ForEach(FeedSort.allCases, id: \.self) { s in
                    Button { sort = s } label: {
                        Text(s.label)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundStyle(sort == s ? .white : .white.opacity(0.6))
                            .overlay(alignment: .bottom) {
                                if sort == s {
                                    Rectangle().fill(Theme.coral).frame(height: 2).offset(y: 4)
                                }
                            }
                    }
                }
            }
        }
        .padding(.horizontal, 18)
        .padding(.top, 8)
    }
}

#Preview {
    FeedView().environmentObject(AppStore())
}
