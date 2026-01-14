<?php
$host = "devbdd.iutmetz.univ-lorraine.fr";
$db   = "e27844u_SAE_bd";
$user = "e27844u_appli";
$pass = "32406845";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );
} catch (PDOException $e) {
    die("Erreur BDD : " . $e->getMessage());
}
