import SwiftUI

// Chic blush / rose / gold palette — feminine, premium, social.
// Property names are kept stable so every screen restyles from here.
enum Theme {
    static let peach  = Color(hex: 0xFFC9DD) // soft pink (chips / light fills)
    static let coral  = Color(hex: 0xE85D8A) // rose — primary accent (buttons, likes)
    static let amber  = Color(hex: 0xC9A14A) // gold accent
    static let sunset = Color(hex: 0xFF9EC0) // rose-peach (gradient top)
    static let plum   = Color(hex: 0x5A1F3D) // deep berry — brand dark / headings
    static let cream  = Color(hex: 0xFFF5F8) // blush — light backgrounds
    static let ink    = Color(hex: 0x2A1620) // deep plum-black — text / feed bg

    /// Rose hero gradient used on the login screen and placeholders.
    static let warmGradient = LinearGradient(
        colors: [sunset, coral, plum],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

extension Color {
    /// Create a Color from a 0xRRGGBB hex literal.
    init(hex: UInt, alpha: Double = 1.0) {
        let r = Double((hex >> 16) & 0xFF) / 255.0
        let g = Double((hex >> 8) & 0xFF) / 255.0
        let b = Double(hex & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)
    }
}
