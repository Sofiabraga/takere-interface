import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

const STORAGE_KEY = 'notification_ids';

const isExpoGo = Constants.appOwnership === 'expo';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMedicationNotification(
  medicationId: string,
  name: string,
  dosage: string,
  time: string
): Promise<void> {
  if (isExpoGo) {
    Alert.alert(
      'Notificações indisponíveis',
      'O Expo Go não suporta notificações agendadas no iOS. Use uma build de desenvolvimento para ativar essa funcionalidade.',
      [{ text: 'OK' }]
    );
    return;
  }

  const [hour, minute] = time.split(':').map(Number);

  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Hora do remédio: ${name}`,
      body: dosage,
      data: { medicationId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const map: Record<string, string> = stored ? JSON.parse(stored) : {};
  map[medicationId] = notifId;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function cancelMedicationNotification(medicationId: string): Promise<void> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  const map: Record<string, string> = JSON.parse(stored);
  const notifId = map[medicationId];
  if (notifId) {
    await Notifications.cancelScheduledNotificationAsync(notifId);
    delete map[medicationId];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }
}
