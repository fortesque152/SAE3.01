<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
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
    $password = $_POST['password'] ?? '';

    // Préparer la requête pour éviter les injections SQL
    $stmt = $pdo->prepare("SELECT * FROM user WHERE username = :username AND password = :password");
    $stmt->execute([
        ':username' => $username,
        ':password' => $password
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if($user){
        // Connexion réussie
        $_SESSION['username'] = $user['username'];
        header("Location: dashboard.php"); // redirection vers ton tableau de bord
        exit();
    } else {
        // Échec
        $error = "Nom d'utilisateur ou mot de passe incorrect";
        header("Location: connexion.php?error=" . urlencode($error));
        exit();
    }
} else {
    // Accès direct au fichier sans POST
    header("Location: connexion.php");
    exit();
}
