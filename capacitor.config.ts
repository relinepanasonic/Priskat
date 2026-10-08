import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ruangiman.app',
  appName: 'Ruang Iman',
  webDir: 'out',
  server: {
    url: 'https://apps.ruangiman.com',
    cleartext: true
  }
};

export default config;
