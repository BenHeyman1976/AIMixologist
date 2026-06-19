import SwiftUI

/// "Plan my night" — describe your evening; Siply returns a paced, responsible
/// drink itinerary that reacts to your timings, food and vibe.
struct PlanView: View {
    @EnvironmentObject var store: AppStore
    @State private var prompt = ""
    @State private var plan: NightPlan?
    @State private var loading = false

    private let examples = [
        "Finish work at 6, West End show at 8, eating Italian — a couple of drinks before",
        "Big night — 10 bars, spread out my intake!",
        "Chilled girls' night in, tapas and something fizzy"
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Plan your night")
                    .font(.system(size: 30, weight: .black)).foregroundStyle(Theme.plum)
                Text("Tell Siply your evening — timings, food, the vibe — and get a perfectly paced plan.")
                    .foregroundStyle(Theme.ink.opacity(0.7))

                TextField("e.g. Finishing work at 6, theatre at 8, Italian dinner — a couple of drinks first",
                          text: $prompt, axis: .vertical)
                    .lineLimit(3...6)
                    .padding(16)
                    .background(.white, in: RoundedRectangle(cornerRadius: 18))
                    .foregroundStyle(Theme.ink)

                if plan == nil {
                    ForEach(examples, id: \.self) { ex in
                        Button { prompt = ex } label: {
                            Text(ex).font(.system(size: 14, weight: .bold))
                                .foregroundStyle(Theme.plum)
                                .multilineTextAlignment(.leading)
                                .padding(.horizontal, 14).padding(.vertical, 10)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Theme.peach.opacity(0.3), in: RoundedRectangle(cornerRadius: 16))
                        }
                    }
                }

                PrimaryButton(title: plan == nil ? "Plan my night 🌙" : "Re-plan 🔄",
                              loading: loading,
                              disabled: prompt.trimmingCharacters(in: .whitespaces).count < 5) {
                    generate()
                }

                if loading && plan == nil {
                    VStack(spacing: 12) {
                        ProgressView().controlSize(.large).tint(Theme.coral)
                        Text("Planning your night…")
                            .font(.system(size: 18, weight: .heavy)).foregroundStyle(Theme.plum)
                    }
                    .frame(maxWidth: .infinity).padding(.vertical, 36)
                }

                if let plan { result(plan) }
            }
            .padding(20)
            .padding(.top, 8)
        }
        .background(Theme.cream)
    }

    @ViewBuilder
    private func result(_ plan: NightPlan) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(plan.headline)
                .font(.system(size: 20, weight: .heavy)).foregroundStyle(Theme.plum)
                .padding(.top, 6)

            VStack(spacing: 0) {
                ForEach(Array(plan.items.enumerated()), id: \.element.id) { idx, item in
                    HStack(alignment: .top, spacing: 14) {
                        VStack(spacing: 0) {
                            ZStack {
                                Circle().fill(color(item.kind).opacity(0.18)).frame(width: 42, height: 42)
                                Image(systemName: item.kind.icon)
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundStyle(color(item.kind))
                            }
                            if idx < plan.items.count - 1 {
                                Rectangle().fill(Theme.peach.opacity(0.5))
                                    .frame(width: 2).frame(maxHeight: .infinity)
                            }
                        }
                        VStack(alignment: .leading, spacing: 3) {
                            if let time = item.time {
                                Text(time.uppercased())
                                    .font(.system(size: 11, weight: .heavy)).tracking(1)
                                    .foregroundStyle(Theme.coral)
                            }
                            Text(item.title)
                                .font(.system(size: 17, weight: .heavy)).foregroundStyle(Theme.ink)
                            Text(item.detail)
                                .font(.system(size: 15)).foregroundStyle(Theme.ink.opacity(0.75))
                        }
                        .padding(.bottom, 18)
                        Spacer(minLength: 0)
                    }
                }
            }

            // Responsible-drinking note — core to the feature.
            Text(plan.safety)
                .font(.footnote).foregroundStyle(Theme.plum)
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Theme.amber.opacity(0.14), in: RoundedRectangle(cornerRadius: 16))

            ShareLink(item: plan.shareText) {
                Label("Share plan with the group", systemImage: "square.and.arrow.up")
                    .font(.system(size: 16, weight: .heavy)).foregroundStyle(.white)
                    .frame(maxWidth: .infinity).padding(.vertical, 14)
                    .background(Theme.coral, in: Capsule())
            }
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 28))
        .padding(.top, 6)
    }

    private func color(_ kind: PlanItemKind) -> Color {
        switch kind {
        case .drink: return Theme.coral
        case .food:  return Theme.amber
        case .water: return Theme.plum
        case .tip:   return Theme.sunset
        case .move:  return Theme.plum
        }
    }

    private func generate() {
        loading = true
        Task {
            plan = await store.planNight(prompt: prompt)
            loading = false
        }
    }
}
