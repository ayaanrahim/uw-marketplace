export default () => ({
  expo: {
    name: "ripple",
    slug: "uw-marketplace",
    owner: 'phunt22',
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/favicon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: false,
      infoPlist: {
        NSPhotoLibraryUsageDescription: "This app requires access to your photo library to upload photos.",
        NSCameraUsageDescription: "This app requires access to your camera to take photos."
      },
      bundleIdentifier: "com.phunt22.uwmarketplace"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    newArchEnabled: true,
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ffffff",
          resizeMode: "contain",
          image: "./assets/images/ripplesplash.png",
          imageWidth: "250"
        }
      ],
      "expo-router",
      "expo-font"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "a6b6a98c-bdbb-4cbc-ba6a-9d850d1ecdf1"
      },
      APIKEY: process.env.REACT_APP_APIKEY,
      AUTHDOMAIN: process.env.REACT_APP_AUTHDOMAIN,
      PROJECT_ID: process.env.REACT_APP_PROJECT_ID,
      STORAGEBUCKET: process.env.REACT_APP_STORAGEBUCKET,
      MESSAGINGSENDER_ID: process.env.REACT_APP_MESSAGINGSENDER_ID,
      APP_ID: process.env.REACT_APP_APP_ID,
      MEASUREMENT_ID: process.env.REACT_APP_MEASUREMENT_ID,
    }
  }
})