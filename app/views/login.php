<?php
/**
 * Page de connexion
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
<title>Connexion</title>
<link rel="stylesheet" href="./styles/pages/auth.css">
</head>
<body>
<div class="container">
    <div class="card">
        <div class="header">
            <div class="logoContainer">
                <img src="./assets/logo.svg" alt="Logo">
            </div>
            <h1 class="title">Connexion</h1>
            <p class="subtitle">Accédez à votre compte</p>
        </div>

        <?php if (isset($_GET['error']) && $_GET['error'] === 'login'): ?>
        <div class="errorMessage">
            Email ou mot de passe incorrect
        </div>
        <?php endif; ?>

        <form class="form" method="POST" action="./app/views/login-handler.php">
            <div class="formGroup">
                <label for="email" class="label">Email</label>
                <input type="email" id="email" name="email" class="input" placeholder="votre@email.com" required>
            </div>
            <div class="formGroupLast">
                <label for="password" class="label">Mot de passe</label>
                <input type="password" id="password" name="password" class="input" placeholder="••••••••" required>
            </div>
            <button type="submit" class="button">Se connecter</button>
        </form>

        <div class="footer">
            <p class="footerText">
                Pas de compte ? <a href="./app/views/register.php" class="toggleButton">Inscrivez-vous</a>
            </p>
        </div>
    </div>
</div>
</body>
</html>
