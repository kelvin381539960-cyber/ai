import { usePageStore } from "@aix/common";
import { Assets } from "@aix/resources";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View, Image, StyleSheet, Platform } from "react-native";
import { SplashCreator } from "./useSplashStore";

export function SplashPage() {

      const { deeplink } = useLocalSearchParams();

      const store = usePageStore(SplashCreator);
      const setDeepLink = store(s => s.setDeepLink);
      const gotoNext = store(s => s.gotoNext)

      useEffect(() => {
            if (Platform.OS === 'web') {
                  return;
            }
            if (deeplink == null) {
                  setDeepLink(null)
            } else {
                  const decodedPath = atob(decodeURIComponent(deeplink as string));
                  setDeepLink(decodedPath)
            }
            gotoNext()
      }, [deeplink, setDeepLink, gotoNext]);

      return (
            <View style={mainStyle.image}>
                  <Image
                        source={Assets.splash}
                        style={{ width: '100%', height: '100%', resizeMode: "cover" }}
                  />
            </View>

      )
}

const mainStyle = StyleSheet.create({
      image: {
            justifyContent: "center",
            alignItems: "center",
            flex: 1
      }
});