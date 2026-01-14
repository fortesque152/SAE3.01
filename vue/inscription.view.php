<?php
session_start();
require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: inscription.php");
    exit();
}

$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";
$confirm = $_POST["confirm-password"] ?? "";
$username = $_POST["username"] ?? "";

if ($password !== $confirm) {
    header("Location: inscription.php?error=password");
    exit();
}

/* Vérifier si l'email existe déjà */
$stmt = $pdo->prepare("SELECT account_id FROM account WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->fetch()) {
    header("Location: inscription.php?error=email");
    exit();
}

/* Création du compte */
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("
    INSERT INTO account (email, password_hash)
    VALUES (?, ?)
");
$stmt->execute([$email, $passwordHash]);

$accountId = $pdo->lastInsertId();

/* Création du profil par défaut */
$stmt = $pdo->prepare("
    INSERT INTO profile (account_id, profile_name, is_default)
    VALUES (?, ?, TRUE)
");
$stmt->execute([$accountId, $username]);

$profileId = $pdo->lastInsertId();

/* Session */
$_SESSION["account_id"] = $accountId;
$_SESSION["profile_id"] = $profileId;
$_SESSION["profile_name"] = $username;

header("Location: ../index.php");
exit();
