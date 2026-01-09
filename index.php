<?php
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
<link rel="stylesheet" href="./vue/style/connexion.css">
</head>
<body>
<div class="container">
    <form class="login-form" method="POST" action="./vue/connexion.view.php">
        <h2>Connexion</h2>
        <div class="input-group">
            <label for="username">Nom d'utilisateur</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div class="input-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" name="password" required>
        </div>
        <button type="submit">Se connecter</button>
        <p class="message">
            Pas de compte ? <a href="./vue/inscription.php">Inscrivez-vous</a>
        </p>
    </form>
</div>
</body>
</html>
