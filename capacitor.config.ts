import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ruangiman.app',
  appName: 'Ruang Iman',
  webDir: 'out',
  server: {
    url: 'https://apps.ruangiman.com',
    cleartext: true
  },
  plugins: {
    // Only Google sign-in is used. Facebook, Apple and Twitter stay out of the app
    // (the Facebook SDK would add an advertising ID and data sharing we do not want).
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false
      }
    }
  }
};

export default config;
