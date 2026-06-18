import SwiftUI

// MARK: - Chip

struct ChipView: View {
    enum Tone { case glass, coral, peach }
    let label: String
    var tone: Tone = .glass

    var body: some View {
        Text(label)
            .font(.system(size: 12, weight: .bold))
            .foregroundStyle(fg)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(bg, in: Capsule())
    }

    private var bg: Color {
        switch tone {
        case .glass: return Color.white.opacity(0.16)
        case .coral: return Theme.coral
        case .peach: return Theme.peach.opacity(0.25)
        }
    }
    private var fg: Color {
        switch tone {
        case .glass, .coral: return .white
        case .peach: return Theme.plum
        }
    }
}

// MARK: - Primary button

struct PrimaryButton: View {
    enum Variant { case primary, secondary, dark }
    let title: String
    var variant: Variant = .primary
    var loading: Bool = false
    var disabled: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack {
                if loading { ProgressView().tint(.white) }
                else { Text(title).font(.system(size: 16, weight: .heavy)) }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 15)
            .foregroundStyle(.white)
            .background(bg, in: Capsule())
            .opacity(disabled || loading ? 0.5 : 1)
        }
        .disabled(disabled || loading)
    }

    private var bg: Color {
        switch variant {
        case .primary: return Theme.coral
        case .secondary: return Color.white.opacity(0.14)
        case .dark: return Theme.ink
        }
    }
}
