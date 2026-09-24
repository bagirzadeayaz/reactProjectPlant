import { getAnalytics, isSupported } from 'firebase/analytics';
import { firebaseApp } from './firebase';

export const startAnalytics = async (): Promise<void> => {
  if (await isSupported()) getAnalytics(firebaseApp);
};
