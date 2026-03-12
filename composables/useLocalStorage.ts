import { Platform } from "react-native";

let AsyncStorage: any;
if (Platform.OS !== "web") {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

const useStorage = <T>(key: string) => {
  const setItem = async (value: T) => {
    const data = JSON.stringify(value);
    if (Platform.OS === "web") {
      localStorage.setItem(key, data);
    } else {
      await AsyncStorage.setItem(key, data);
    }
  };

  const getItem = async (): Promise<T | null> => {
    let item: string | null = null;
    if (Platform.OS === "web") {
      item = localStorage.getItem(key);
    } else {
      item = await AsyncStorage.getItem(key);
    }
    return item ? JSON.parse(item) : null;
  };

  const removeItem = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  };

  return { setItem, getItem, removeItem };
};

export default useStorage;
