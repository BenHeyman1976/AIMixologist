import SwiftUI

/// In-app settings — flip real AI on and point the app at your backend without
/// touching code. Values persist (UserDefaults) via AppStore.
struct SettingsView: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @State private var testing = false
    @State private var testResult: (ok: Bool, message: String)?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Toggle("Use real AI", isOn: $store.useRemote)
                        .tint(Theme.coral)
                    TextField("http://192.168.1.42:3000", text: $store.apiBaseURL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .keyboardType(.URL)
                        .disabled(!store.useRemote)

                    Button {
                        testing = true
                        testResult = nil
                        Task {
                            testResult = await store.testConnection()
                            testing = false
                        }
                    } label: {
                        HStack {
                            Text("Test connection")
                            Spacer()
                            if testing { ProgressView() }
                        }
                    }
                    .disabled(!store.useRemote || testing)

                    if let result = testResult {
                        Label(result.message, systemImage: result.ok ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .font(.footnote)
                            .foregroundStyle(result.ok ? .green : .red)
                    }
                } header: {
                    Text("AI backend")
                } footer: {
                    Text("On: recipes, images and night plans come from your live backend (real OpenAI). Off: instant on-device demo content.\n\nEnter your Mac's local IP while developing (e.g. http://192.168.1.42:3000), or your deployed URL. Run the backend with OPENAI_API_KEY and AI_MODE=openai set.")
                }

                Section {
                    LabeledContent("Images this month",
                                   value: "\(store.imageUsage.used)/\(store.imageUsage.limit)")
                } header: {
                    Text("Plan")
                } footer: {
                    Text("Free plan: \(store.imageUsage.limit) AI images per month. Recipes and night plans are unlimited.")
                }

                Section {
                    Text("Siply — Your Cocktail Concierge")
                        .font(.footnote).foregroundStyle(.secondary)
                    Text("Please drink responsibly. 18+.")
                        .font(.footnote).foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }.fontWeight(.bold).tint(Theme.coral)
                }
            }
        }
    }
}
