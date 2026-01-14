<?php
session_start();
require_once "db.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$parkingId = $data['parkingId'] ?? null;

if (!$parkingId) {
    echo json_encode(["success" => false, "message" => "Parking manquant"]);
    exit;
}

$stmt = $pdo->prepare("SELECT apiId,name,latitude, longitude FROM parking WHERE apiId = ?");
$stmt->execute([$parkingId]);
$parking = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$parking) {
    echo json_encode(["success" => false, "message" => "Parking introuvable"]);
    exit;
}

echo json_encode([
    "success" => true,
    "latitude" => $parking['latitude'],
    "longitude" => $parking['longitude'],
    "apiId" => $parking['apiId'],
    "name" => $parking['name']
]);
?>
