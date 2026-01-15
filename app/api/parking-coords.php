<?php
/**
 * API Endpoint - Parking Coordinates
 * Récupère les coordonnées d'un parking
 */

require_once __DIR__ . '/../autoload.php';
require_once __DIR__ . '/../models/Parking.php';

use App\Models\Parking;

session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['profile_id'])) {
    echo json_encode(["success" => false]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$parkingId = (int)($data['parkingId'] ?? 0);

if (!$parkingId) {
    echo json_encode(["success" => false, "message" => "ID parking invalide"]);
    exit;
}

$parkingModel = new Parking();
$db = \App\Config\Database::getInstance();

$stmt = $db->prepare("
    SELECT parking_id, apiId, name, latitude, longitude
    FROM parking
    WHERE parking_id = ?
");
$stmt->execute([$parkingId]);
$parking = $stmt->fetch();

if (!$parking) {
    echo json_encode(["success" => false, "message" => "Parking non trouvé"]);
    exit;
}

echo json_encode([
    "success" => true,
    "apiId" => $parking['apiId'],
    "name" => $parking['name'],
    "latitude" => $parking['latitude'],
    "longitude" => $parking['longitude']
]);
