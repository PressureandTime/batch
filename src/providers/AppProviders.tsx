import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import React from 'react';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
};
