import { useState } from "react";
import "./App.css";
import styles from "./App.module.css";
import Map from "./components/Map";
import LoginPage from "./components/LoginPage";
import { authService } from "./services/authService";
import Profil from "./components/Profil";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { isAuthenticated, loading, setIsAuthenticated } = useAuth();
  const [showProfil, setShowProfil] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowProfil(false);
  };

  return (
    <>
      {isAuthenticated ? (
        <>
          <nav className={styles.navbar}>
            <button
              onClick={() => setShowProfil(false)}
              className={
                !showProfil ? styles.navButtonActive : styles.navButton
              }>
              🗺️ Carte
            </button>

            <button
              onClick={() => setShowProfil(true)}
              className={
                showProfil ? styles.navButtonActive : styles.navButton
              }>
              👤 {authService.getCurrentUser()?.username}
            </button>
          </nav>
          {showProfil ? <Profil onLogout={handleLogout} /> : <Map />}
        </>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
