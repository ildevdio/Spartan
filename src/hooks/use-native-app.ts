import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export function useNativeApp() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const init = async () => {
      try {
        // Status bar
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#1e293b' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (e) {
        console.warn('StatusBar plugin not available', e);
      }

      try {
        // Splash screen
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch (e) {
        console.warn('SplashScreen plugin not available', e);
      }

      try {
        // Keyboard adjustments
        const { Keyboard } = await import('@capacitor/keyboard');
        Keyboard.addListener('keyboardWillShow', () => {
          document.body.classList.add('keyboard-open');
        });
        Keyboard.addListener('keyboardWillHide', () => {
          document.body.classList.remove('keyboard-open');
        });
      } catch (e) {
        console.warn('Keyboard plugin not available', e);
      }
    };

    init();
  }, []);
}
