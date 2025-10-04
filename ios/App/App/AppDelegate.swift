import UIKit
import Capacitor
import Firebase // Import Firebase module

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Initialize Firebase
    FirebaseApp.configure()
    return true
  }

  func application(_ application: UIApplication,
                   open url: URL,
                   options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // Let Capacitor handle the URL
    return ApplicationDelegateProxy.shared.application(application, open: url, options: options)
  }

  // Kung gumagamit ng SceneDelegate:
  func scene(_ scene: UIScene,
             openURLContexts URLContexts: Set<UIOpenURLContext>) {
    if let url = URLContexts.first?.url {
      _ = ApplicationDelegateProxy.shared.application(
          UIApplication.shared, open: url,
          options: [:]
      )
    }
  }
}