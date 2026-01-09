<?php
session_start();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Inscription</title>
<link rel="stylesheet" href="./style/connexion.css">
</head>
<body>
<div class="container">
    <form class="register-form" method="POST" action="inscription_functions.php">
        <h2>Créer un compte</h2>
        <div class="input-group">
            <label for="username">Nom d'utilisateur</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div class="input-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
        </div>
        <div class="input-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" name="password" required>
        </div>
        <div class="input-group">
            <label for="confirm-password">Confirmer le mot de passe</label>
            <input type="password" id="confirm-password" name="confirm-password" required>
        </div>
        <button type="submit">S'inscrire</button>
        <p class="message">Déjà un compte ? <a href="connexion.php">Connectez-vous</a></p>
    </form>
</div>
</body>
</html>
