import { createStackNavigator } from '@react-navigation/stack';
import Login from "../screens/Login";
import Main from "../screens/Main";
import AddKeys from "../screens/addKeys";
import adminSection from "../screens/adminSection";
import ShowKeys from "../screens/ShowKeys"



const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="adminSection" component={adminSection} />
      <Stack.Screen name="AddKeys" component={AddKeys}/>
      <Stack.Screen name="ShowKeys" component={ShowKeys}/>

    </Stack.Navigator>
  );
}
