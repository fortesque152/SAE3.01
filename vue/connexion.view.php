<?php
session_start();
require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: ../index.php");
    exit();
}

$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";

/* Récupération compte + profil */
$stmt = $pdo->prepare("
    SELECT 
        a.account_id,
        a.password_hash,
        p.profile_id,
        p.profile_name
    FROM account a
    JOIN profile p ON p.account_id = a.account_id
    WHERE a.email = ?
      AND p.is_default = TRUE
");
$stmt->execute([$email]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user["password_hash"])) {
    header("Location: ../index.php?error=login");
    exit();
}

/* Mise à jour last_login */
$pdo->prepare("
    UPDATE account SET last_login = NOW()
    WHERE account_id = ?
")->execute([$user["account_id"]]);

/* Session */
$_SESSION["account_id"] = $user["account_id"];
$_SESSION["profile_id"] = $user["profile_id"];
$_SESSION["profile_name"] = $user["profile_name"];

header("Location: ../Application.html");
exit();
