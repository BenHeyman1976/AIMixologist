import SwiftUI

// Warm, premium cocktail palette — shared across the app.
enum Theme {
    static let peach  = Color(hex: 0xFFB17A)
    static let coral  = Color(hex: 0xFF6B6B)
    static let amber  = Color(hex: 0xF59E0B)
    static let sunset = Color(hex: 0xFF8C42)
    static let plum   = Color(hex: 0x5B2333)
    static let cream  = Color(hex: 0xFFF8F0)
    static let ink    = Color(hex: 0x1A1410)

    /// Warm hero gradient used on the login screen and placeholders.
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
