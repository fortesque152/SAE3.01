<?php
/**
 * Page d'inscription
 */

error_reporting(E_ALL);
ini_set("display_errors", 1);
session_start();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Inscription</title>
<link rel="stylesheet" href="../../styles/pages/auth.css">
</head>
<body>
<div class="container">
    <div class="card">
        <div class="header">
            <div class="logoContainer">
                <img src="../../public/assets/logo.svg" alt="Logo">
            </div>
            <h1 class="title">Créer un compte</h1>
            <p class="subtitle">Rejoignez-nous dès aujourd'hui</p>
        </div>

        <?php if (isset($_GET['error'])): ?>
        <div class="errorMessage">
            <?php
            if ($_GET['error'] === 'passwords') {
                echo 'Les mots de passe ne correspondent pas';
            } elseif ($_GET['error'] === 'email') {
                echo 'Cette adresse email est déjà utilisée';
            } else {
                echo 'Une erreur est survenue';
            }
            ?>
        </div>
        <?php endif; ?>

        <form class="form" method="POST" action="register-handler.php">
            <div class="formGroup">
                <label for="username" class="label">Nom d'utilisateur</label>
                <input type="text" id="username" name="username" class="input" placeholder="Jean Dupont" required>
            </div>
            <div class="formGroup">
                <label for="email" class="label">Email</label>
                <input type="email" id="email" name="email" class="input" placeholder="votre@email.com" required>
            </div>
            <div class="formGroup">
                <label for="password" class="label">Mot de passe</label>
                <input type="password" id="password" name="password" class="input" placeholder="••••••••" required>
            </div>
            <div class="formGroupLast">
                <label for="confirm-password" class="label">Confirmer le mot de passe</label>
                <input type="password" id="confirm-password" name="confirm-password" class="input" placeholder="••••••••" required>
            </div>
            <button type="submit" class="button">S'inscrire</button>
        </form>

        <div class="footer">
            <p class="footerText">
                Déjà un compte ? <a href="../../" class="toggleButton">Connectez-vous</a>
            </p>
        </div>
    </div>
</div>
</body>
</html>
