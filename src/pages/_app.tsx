import type { AppProps } from 'next/app';
import { Auth0Provider } from '../auth/Auth0Provider';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider>
      <Component {...pageProps} />
    </Auth0Provider>
  );
}

export default MyApp;

// This empty export makes TypeScript treat this file as a module
export {} 