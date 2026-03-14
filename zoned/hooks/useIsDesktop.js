import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateIsDesktop = () => {
      const { width } = Dimensions.get('window');
      setIsDesktop(Platform.OS === 'web' && width >= 768);
    };

    updateIsDesktop();
    const subscription = Dimensions.addEventListener('change', updateIsDesktop);

    return () => subscription?.remove();
  }, []);

  return isDesktop;
};