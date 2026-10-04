import { useAuth } from '../../context/AuthContext';
import Login from '../../pages/Login/Login';

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <Login
      initialMode={authModalMode}
      isModal={true}
      onClose={closeAuthModal}
    />
  );
}
