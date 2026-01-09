<?php
session_start();

// Connexion à la base
$host = "devbdd.iutmetz.univ-lorraine.fr";
$db   = "e27844u_SAE_bd";
$user = "e27844u_appli";
$pass = "32406845";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

// Vérification du formulaire
if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm-password'] ?? '';

    if($password !== $confirm){
        $error = "Les mots de passe ne correspondent pas";
        header("Location: inscription.php?error=" . urlencode($error));
        exit();
    }

    // Vérifier si l'utilisateur existe déjà
    $stmt = $pdo->prepare("SELECT * FROM user WHERE username = :username OR email = :email");
    $stmt->execute([
        ':username' => $username,
        ':email' => $email
    ]);

    if($stmt->fetch()){
        $error = "Nom d'utilisateur ou email déjà utilisé";
        header("Location: inscription.php?error=" . urlencode($error));
        exit();
    }

    // Insérer le nouvel utilisateur
    $stmt = $pdo->prepare("INSERT INTO user (username, email, password) VALUES (:username, :email, :password)");
    $stmt->execute([
        ':username' => $username,
        ':email' => $email,
        ':password' => $password // Pour plus de sécurité, on peut hasher avec password_hash()
    ]);

    $_SESSION['username'] = $username;
    header("Location: ../index.php");
    exit();
} else {
    header("Location: inscription.php");
    exit();
}
