import { createStackNavigator } from '@react-navigation/stack';
import Login from "../screens/Login";
import Main from "../screens/Main";


const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Main" component={Main} />

    </Stack.Navigator>
  );
}
