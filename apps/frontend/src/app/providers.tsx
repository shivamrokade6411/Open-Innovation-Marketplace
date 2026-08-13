'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store';
import { fetchMeThunk } from '../store/authSlice';
import type { AppDispatch } from '../store';

function AuthInitializer({ children }: { children: ReactNode }): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }): JSX.Element {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  }));

  return (
    <Provider store={store}>
      <AuthInitializer>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </AuthInitializer>
    </Provider>
  );
}
