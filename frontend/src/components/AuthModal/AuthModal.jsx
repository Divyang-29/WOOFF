import { Suspense, lazy } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = lazy(() => import('../../pages/Login/Login'));

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <Suspense fallback={null}>
      <Login
        initialMode={authModalMode}
        isModal={true}
        onClose={closeAuthModal}
      />
    </Suspense>
  );
}
