import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabNavigator from './TabNavigator'
import { useContext } from 'react';
import AuthStackNavigator from './StackNavigators/AuthStackNavigator'
import FullLoadingScreen from '../screens/shared/FullLoadingScreen'
import { userContext } from '../context/UserContext';

const RootStack = createNativeStackNavigator()



const MainNavigator = () => {
  const { user, isLoading } = useContext(userContext);

  if (isLoading) {
    return <FullLoadingScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{
      contentStyle: { backgroundColor: 'white' }, // Set background for all screens
      headerShown: false,
    }}>
      {!user || (user && !user.emailVerified) ? (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      ) : (
        <RootStack.Screen name="Main" component={TabNavigator} />
      )}
    </RootStack.Navigator>
  );
}

export default MainNavigator;