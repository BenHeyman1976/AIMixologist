import SwiftUI

/// Per-cocktail comments with a composer.
struct CommentsView: View {
    let cocktail: Cocktail
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @State private var body_ = ""
    @State private var items: [Comment] = []

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if items.isEmpty {
                    Spacer()
                    Text("No comments yet — say cheers! 🥂")
                        .foregroundStyle(Theme.ink.opacity(0.5))
                    Spacer()
                } else {
                    ScrollView {
                        VStack(spacing: 12) {
                            ForEach(items) { c in
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("@\(c.username)").font(.system(size: 14, weight: .heavy))
                                        .foregroundStyle(Theme.plum)
                                    Text(c.body).foregroundStyle(Theme.ink.opacity(0.85))
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(12)
                                .background(.white, in: RoundedRectangle(cornerRadius: 18))
                            }
                        }
                        .padding(16)
                    }
                }

                HStack(spacing: 10) {
                    TextField("Add a comment…", text: $body_, axis: .vertical)
                        .lineLimit(1...4)
                        .padding(.horizontal, 14).padding(.vertical, 10)
                        .background(.white, in: RoundedRectangle(cornerRadius: 18))
                    Button("Post") {
                        let trimmed = body_.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        store.addComment(cocktailId: cocktail.id, body: trimmed)
                        items = store.comments(for: cocktail.id)
                        body_ = ""
                    }
                    .font(.system(size: 15, weight: .heavy)).foregroundStyle(.white)
                    .padding(.horizontal, 18).padding(.vertical, 12)
                    .background(Theme.coral, in: Capsule())
                    .opacity(body_.trimmingCharacters(in: .whitespaces).isEmpty ? 0.4 : 1)
                }
                .padding(16)
            }
            .background(Theme.cream)
            .navigationTitle("Comments (\(items.count))")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { dismiss() } label: { Image(systemName: "xmark.circle.fill") }
                        .tint(Theme.plum)
                }
            }
        }
        .presentationDetents([.large])
        .onAppear { items = store.comments(for: cocktail.id) }
    }
}
