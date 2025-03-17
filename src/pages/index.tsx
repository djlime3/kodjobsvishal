import { useAuth } from '../auth/useAuth';
import { useRouter } from 'next/router';

export default function Home() {
  const { isAuthenticated, login, user } = useAuth();
  const router = useRouter();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome to Resume Builder</h1>
      {isAuthenticated ? (
        <div>
          <p>Welcome back, {user?.name}!</p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div>
          <p>Please log in to access your resume builder</p>
          <button
            onClick={() => login()}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Log In
          </button>
        </div>
      )}
    </div>
  );
} 