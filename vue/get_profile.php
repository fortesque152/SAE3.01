<?php
session_start();
require_once "db.php"; // ton fichier de connexion PDO

header("Content-Type: application/json");

if(!isset($_SESSION['account_id'])) {
    echo json_encode(["connected" => false]);
    exit();
}

$accountId = $_SESSION['account_id'];

// Récupérer profil par défaut
$stmt = $pdo->prepare("
    SELECT profile_id, profile_name AS name, vehicle_type_id
    FROM profile
    LEFT JOIN profile_vehicle_type USING(profile_id)
    WHERE account_id = ? AND is_default = TRUE
");
$stmt->execute([$accountId]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$profile){
    echo json_encode(["connected" => false]);
    exit();
}

// Récupérer type de véhicule
$vehicleType = null;
if($profile['vehicle_type_id']){
    $vstmt = $pdo->prepare("SELECT name FROM vehicle_type WHERE vehicle_type_id = ?");
    $vstmt->execute([$profile['vehicle_type_id']]);
    $vehicle = $vstmt->fetch(PDO::FETCH_ASSOC);
    $vehicleType = $vehicle['name'] ?? null;
}

// Récupérer parkings favoris
$favStmt = $pdo->prepare("
    SELECT f.parking_id, p.name, p.latitude, p.longitude
    FROM favorite f
    JOIN parking p ON f.parking_id = p.parking_id
    WHERE f.profile_id = ?
");
$favStmt->execute([$profile['profile_id']]);
$favorites = $favStmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "connected" => true,
    "profile" => [
        "id" => $profile['profile_id'],
        "name" => $profile['name'],
        "vehicleType" => $vehicleType,
        "preferences" => [] // tu peux compléter si tu veux récupérer preferences
    ],
    "favorites" => $favorites
]);
