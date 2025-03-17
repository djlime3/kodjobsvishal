import { useAuth0 } from '@auth0/auth0-react';

export interface AuthUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export function useAuth() {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const login = () => {
    loginWithRedirect();
  };

  const signOut = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const getToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user: user as AuthUser | undefined,
    login,
    signOut,
    getToken,
  };
} 