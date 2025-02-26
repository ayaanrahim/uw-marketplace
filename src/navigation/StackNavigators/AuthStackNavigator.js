import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Login from "../../screens/Auth/Login";
import Logo from '../../components/Logo'
import EmailOnboarding from "../../screens/Auth/EmailOnboarding";
import InfoOnboarding from "../../screens/Auth/InfoOnboarding";
import EducationOnboarding from "../../screens/Auth/EducationOnboarding";
import { TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LandingPage } from "../../screens/Auth/LandingPage";



const AuthStack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: 'white' },
        headerShadowVisible: false,
      }}
    >
      <AuthStack.Screen
        name="LandingPage"
        component={LandingPage}
        options={{
          headerShown: false
        }}
      />

      <AuthStack.Screen
        name="Login"
        component={Login}
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
          headerTitle: () => <Logo />,
        })}
      />
      <AuthStack.Screen
        name="EmailOnboarding"
        component={EmailOnboarding}
        options={({ navigation }) => ({
          headerTitle: () => <Logo />,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          )
        })}
      />

      <AuthStack.Screen
        name="EducationOnboarding"
        component={EducationOnboarding}
        options={({ navigation }) => ({
          headerTitle: () => <Logo />,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          )
        })}
      />
      <AuthStack.Screen
        name="InfoOnboarding"
        component={InfoOnboarding}
        options={({ navigation }) => ({
          headerTitle: () => <Logo />,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          )
        })}
      />
    </AuthStack.Navigator >
  );
}

export default AuthStackNavigator;