import SwiftUI

/// First-run login. Mock providers for the PoC (one tap signs you in).
/// TODO(auth): replace with Supabase Google/Apple OAuth + email magic links.
struct LoginView: View {
    @EnvironmentObject var store: AppStore
    @State private var email = ""

    var body: some View {
        ZStack {
            Theme.plum.ignoresSafeArea()
            VStack(spacing: 26) {
                VStack(spacing: 6) {
                    Text("🍹").font(.system(size: 64))
                    Text("Bob").font(.system(size: 52, weight: .black)).foregroundStyle(.white)
                    Text("The AI mixologist. Create stunning cocktails, share them, get voted up.")
                        .font(.system(size: 16))
                        .foregroundStyle(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 20)
                }

                VStack(spacing: 12) {
                    PrimaryButton(title: " Continue with Apple", variant: .dark) {
                        store.signIn(.apple)
                    }
                    PrimaryButton(title: "Continue with Google", variant: .secondary) {
                        store.signIn(.google)
                    }

                    HStack {
                        Rectangle().fill(.white.opacity(0.2)).frame(height: 1)
                        Text("or").foregroundStyle(.white.opacity(0.6)).font(.footnote)
                        Rectangle().fill(.white.opacity(0.2)).frame(height: 1)
                    }

                    TextField("", text: $email, prompt: Text("you@example.com").foregroundColor(.white.opacity(0.5)))
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16).padding(.vertical, 14)
                        .background(Color.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 16))

                    PrimaryButton(title: "Continue with email",
                                  disabled: !email.contains("@")) {
                        store.signIn(.email, email: email)
                    }

                    Button("Skip for now — continue as guest") {
                        store.continueAsGuest()
                    }
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.85))
                    .padding(.top, 4)

                    Text("Demo sign-in for the preview. By continuing you confirm you are 18+. Please drink responsibly.")
                        .font(.system(size: 12))
                        .foregroundStyle(.white.opacity(0.5))
                        .multilineTextAlignment(.center)
                        .padding(.top, 6)
                }
            }
            .padding(26)
        }
    }
}
