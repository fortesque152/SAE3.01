import { useAuth, useParkings, useGeolocation } from "../hooks";
import type { Parking } from "../types/Parking";
import { authService } from "../services/authService";
import styles from "./Profil.module.css";

interface ProfilProps {
  onLogout: () => void;
}

function Profil({ onLogout }: ProfilProps) {
  const { user } = useAuth();
  const { parkings, loading, error, getNearbyParkings } = useParkings();
  const { latitude, longitude, error: geoError } = useGeolocation();

  const nearbyParkings: Parking[] =
    latitude && longitude ? getNearbyParkings(latitude, longitude, 2) : [];

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>👤 Profil</h1>
        {user && (
          <p className={styles.subtitle}>
            Bienvenue, <strong>{user.username}</strong>
          </p>
        )}
      </header>

      <div className={styles.statsGrid}>
        {latitude && longitude && (
          <div className={styles.statCard}>
            <div className={styles.statTitle}>À proximité</div>
            <div className={styles.statValue}>{nearbyParkings.length}</div>
            <div className={styles.statSubtitle}>Dans un rayon de 2 km</div>
          </div>
        )}
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total des parkings</div>
          <div className={styles.statValue}>{parkings.length}</div>
          <div className={styles.statSubtitle}>Parkings disponibles</div>
        </div>
      </div>

      <div className={styles.logoutSection}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );
}

export default Profil;
