<?php
session_start();
require_once "db.php";
header("Content-Type: application/json");

if (!isset($_SESSION['account_id'])) {
    echo json_encode(["success" => false]);
    exit;
}

// profil par défaut
$stmt = $pdo->prepare("
    SELECT profile_id
    FROM profile
    WHERE account_id = ?
    AND is_default = 1
");
$stmt->execute([$_SESSION['account_id']]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profile) {
    echo json_encode(["success" => false]);
    exit;
}

// récupérer les favoris
$stmt = $pdo->prepare("
    SELECT 
        p.parking_id,
        p.name,
        p.latitude,
        p.longitude
    FROM favorite f
    JOIN parking p ON p.parking_id = f.parking_id
    WHERE f.profile_id = ?
    ORDER BY f.added_at DESC
");
$stmt->execute([$profile['profile_id']]);

$favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "favorites" => $favorites
]);
