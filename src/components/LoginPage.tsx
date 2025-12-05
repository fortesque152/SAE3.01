import { useState } from "react";
import { authService } from "../services/authService";
import type { LoginCredentials, RegisterData } from "../types/User";
import styles from "./LoginPage.module.css";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState<LoginCredentials>({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(loginData);

      if (response.success) {
        console.log("Connexion réussie !", response.user);
        onLoginSuccess();
      } else {
        setError(response.message || "Erreur de connexion");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.register(registerData);

      if (response.success) {
        console.log("Inscription réussie !", response.user);
        onLoginSuccess();
      } else {
        setError(response.message || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <img src="../public/asset/images/Logo.svg" alt="" />
          </div>
          <h2 className={styles.title}>
            {isLogin ? "Connexion" : "Inscription"}
          </h2>
          <p className={styles.subtitle}>
            {isLogin
              ? "Ça n'a jamais été aussi simple de trouver une place de parking"
              : "Créez votre compte et rejoignez-nous dès aujourd'hui !"}
          </p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nom d'utilisateur</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
                required
                placeholder="Entrez votre nom d'utilisateur"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroupLast}>
              <label className={styles.label}>Mot de passe</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
                placeholder="••••••••"
                className={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nom d'utilisateur</label>
              <input
                type="text"
                value={registerData.username}
                onChange={(e) =>
                  setRegisterData({ ...registerData, username: e.target.value })
                }
                required
                placeholder="Choisissez un nom d'utilisateur"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                required
                placeholder="votre@email.com"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroupLast}>
              <label className={styles.label}>Mot de passe</label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                required
                placeholder="••••••••"
                className={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? "Inscription en cours..." : "Créer mon compte"}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className={styles.toggleButton}>
            {isLogin
              ? "Pas encore de compte ? S'inscrire →"
              : "← Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
