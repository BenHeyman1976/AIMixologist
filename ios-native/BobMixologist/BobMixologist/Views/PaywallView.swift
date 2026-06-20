import SwiftUI

/// Siply+ paywall. The subscribe button is a stub today (it flips local premium
/// state so you can experience the full premium flow); real Apple In-App
/// Purchase goes in behind `TODO(billing)`.
struct PaywallView: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss

    enum Term { case annual, monthly }
    @State private var term: Term = .annual
    @State private var purchased = false

    private let benefits: [(String, String)] = [
        ("infinity", "Unlimited AI cocktail images"),
        ("sparkles", "Exclusive premium image styles"),
        ("moon.stars.fill", "Advanced night-planner — venues & bigger groups"),
        ("bolt.fill", "Priority generation, no waiting"),
        ("heart.fill", "Support the creators you love")
    ]

    var body: some View {
        ZStack(alignment: .top) {
            Theme.cream.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 22) {
                    header

                    VStack(alignment: .leading, spacing: 14) {
                        ForEach(benefits, id: \.1) { item in
                            HStack(spacing: 12) {
                                Image(systemName: item.0)
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundStyle(Theme.coral)
                                    .frame(width: 28)
                                Text(item.1)
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundStyle(Theme.ink)
                                Spacer()
                            }
                        }
                    }
                    .padding(18)
                    .background(.white, in: RoundedRectangle(cornerRadius: 22))

                    planCards

                    PrimaryButton(title: purchased ? "You're a Siply+ member 💛"
                                                    : "Start 7-day free trial",
                                  disabled: purchased) {
                        subscribe()
                    }

                    Button("Restore purchases") { store.restoreOrManage() }
                        .font(.footnote).foregroundStyle(Theme.plum)

                    Text("Cancel anytime. Free for 7 days, then \(priceLine). Recurring billing. Terms & Privacy apply. 18+. Please drink responsibly.")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.ink.opacity(0.5))
                        .multilineTextAlignment(.center)
                        .padding(.bottom, 30)
                }
                .padding(20)
                .padding(.top, 40)
            }

            HStack {
                Spacer()
                Button { dismiss() } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 30)).foregroundStyle(.white.opacity(0.9))
                }
            }
            .padding(.horizontal, 18).padding(.top, 14)
        }
    }

    private var header: some View {
        VStack(spacing: 6) {
            Text("✨").font(.system(size: 44))
            Text("Siply+")
                .font(.system(size: 40, weight: .black)).foregroundStyle(.white)
            Text("Your concierge, unlocked.")
                .font(.system(size: 16, weight: .heavy)).foregroundStyle(.white.opacity(0.9))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 30)
        .background(Theme.warmGradient, in: RoundedRectangle(cornerRadius: 26))
    }

    private var planCards: some View {
        HStack(spacing: 12) {
            planCard(.annual, title: "Annual", price: "£29.99/yr", note: "Save 50%", best: true)
            planCard(.monthly, title: "Monthly", price: "£4.99/mo", note: "Flexible", best: false)
        }
    }

    private func planCard(_ value: Term, title: String, price: String, note: String, best: Bool) -> some View {
        let selected = term == value
        return Button { term = value } label: {
            VStack(spacing: 6) {
                if best {
                    Text("BEST VALUE").font(.system(size: 10, weight: .heavy)).tracking(1)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8).padding(.vertical, 3)
                        .background(Theme.coral, in: Capsule())
                }
                Text(title).font(.system(size: 16, weight: .heavy)).foregroundStyle(Theme.plum)
                Text(price).font(.system(size: 18, weight: .black)).foregroundStyle(Theme.ink)
                Text(note).font(.system(size: 12, weight: .semibold)).foregroundStyle(Theme.ink.opacity(0.55))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(.white, in: RoundedRectangle(cornerRadius: 20))
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(selected ? Theme.coral : Theme.peach.opacity(0.5),
                            lineWidth: selected ? 2.5 : 1)
            )
        }
    }

    private var priceLine: String { term == .annual ? "£29.99/year" : "£4.99/month" }

    private func subscribe() {
        // TODO(billing): trigger the real StoreKit purchase for `term`.
        store.upgradeToPremium()
        purchased = true
    }
}
