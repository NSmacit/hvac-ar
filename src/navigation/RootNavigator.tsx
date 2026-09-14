import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import ProjectsScreen from '../screens/ProjectsScreen';
import ARSceneScreen from '../screens/ARSceneScreen';
import ProjectViewerScreen from '../screens/ProjectViewerScreen';
import MetrajScreen from '../screens/MetrajScreen';
import CreditsScreen from '../screens/CreditsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Ana navigasyon:
 * - Projects: kayıtlı projeler listesi (giriş ekranı)
 * - ARScene: AR'da oluştur/düzenle (tam ekran, başlıksız)
 * - Viewer: saha dışı 3D inceleme (orbit)
 */
export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Projects"
      screenOptions={{
        headerStyle: { backgroundColor: '#14181f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#0e1116' },
      }}
    >
      <Stack.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{ title: 'HVAC AR · Projeler' }}
      />
      <Stack.Screen
        name="ARScene"
        component={ARSceneScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Viewer"
        component={ProjectViewerScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <Stack.Screen
        name="Metraj"
        component={MetrajScreen}
        options={({ route }) => ({ title: `Metraj · ${route.params.name}` })}
      />
      <Stack.Screen
        name="Credits"
        component={CreditsScreen}
        options={{ title: 'Krediler / Lisanslar' }}
      />
    </Stack.Navigator>
  );
}
