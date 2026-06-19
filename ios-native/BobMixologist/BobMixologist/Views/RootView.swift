import SwiftUI

/// Login gate → main tab navigation.
struct RootView: View {
    @EnvironmentObject var store: AppStore
    @State private var selectedTab = 0

    var body: some View {
        if store.user == nil {
            LoginView()
        } else {
            TabView(selection: $selectedTab) {
                FeedView()
                    .tabItem { Label("Feed", systemImage: "play.square.stack") }
                    .tag(0)

                PlanView()
                    .tabItem { Label("Plan", systemImage: "moon.stars.fill") }
                    .tag(1)

                CreateView(onPublished: { selectedTab = 0 })
                    .tabItem { Label("Create", systemImage: "plus.circle.fill") }
                    .tag(2)

                ProfileView()
                    .tabItem { Label("Profile", systemImage: "person.crop.circle") }
                    .tag(3)
            }
            .tint(Theme.coral)
        }
    }
}

#Preview {
    RootView().environmentObject(AppStore())
}
