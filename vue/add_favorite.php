<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
session_start();
require_once "db.php";
header("Content-Type: application/json");

if (!isset($_SESSION['account_id'])) {
    echo json_encode(["success" => false, "message" => "Non connecté"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if ($data === null) {
    echo json_encode(["success" => false, "message" => "JSON invalide reçu"]);
    exit;
}


$apiId = $data['parkingId'] ?? null;  // correspond à JSON du front
$name = $data['lib'] ?? null;
$lat = $data['lat'] ?? null;
$lng = $data['long'] ?? null;
$totalSpots = $data['spot'] ?? null;
$type = $data['type'] ?? null;
$address = $data['address'] ?? null;
$isFree = $data['is_free'] ?? null;

if (!$apiId || !$name || !$lat || !$lng) {
    echo json_encode(["success" => false, "message" => "Données parking incomplètes"]);
    exit;
}


/* ===========================
   1️⃣ Récupérer le profil
   =========================== */
$stmt = $pdo->prepare("
    SELECT profile_id
    FROM profile
    WHERE account_id = ?
    AND is_default = 1
");
$stmt->execute([$_SESSION['account_id']]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profile) {
    echo json_encode(["success" => false, "message" => "Profil introuvable"]);
    exit;
}

/* ===========================
   2️⃣ Vérifier parking en BDD
   =========================== */
$stmt = $pdo->prepare("
    SELECT parking_id
    FROM parking
    WHERE apiId = ?
");
$stmt->execute([$apiId]);
$parking = $stmt->fetch(PDO::FETCH_ASSOC);

/* ===========================
   3️⃣ Insert parking si absent
   =========================== */
if (!$parking) {
    $insert = $pdo->prepare("
        INSERT INTO parking
        (apiId, name, type, address, latitude, longitude, is_free, total_spots, last_api_sync)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $insert->execute([
        $apiId,
        $name,
        $type,
        $address,
        $lat,
        $lng,
        $isFree,
        $totalSpots
    ]);

    $parkingId = $pdo->lastInsertId();
} else {
    $parkingId = $parking['parking_id'];
}

/* ===========================
   4️⃣ Ajouter le favori
   =========================== */
$check = $pdo->prepare("
    SELECT 1 FROM favorite
    WHERE profile_id = ? AND parking_id = ?
");
$check->execute([$profile['profile_id'], $parkingId]);

if ($check->fetch()) {
    echo json_encode(["success" => true, "message" => "Déjà en favori"]);
    exit;
}

$insertFav = $pdo->prepare("
    INSERT INTO favorite (profile_id, parking_id, added_at)
    VALUES (?, ?, NOW())
");
$insertFav->execute([$profile['profile_id'], $parkingId]);

echo json_encode(["success" => true, "message" => "Favori ajouté"]);
