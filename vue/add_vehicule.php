<?php
session_start();
require_once "db.php"; // fichier de connexion PDO

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Non connecté']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$type = $data['vehicleType'] ?? null;

$allowedTypes = ['car','electric','motorcycle','bike'];
if (!in_array($type, $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Type invalide']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO user_vehicles (user_id, type) VALUES (:uid, :type)");
$stmt->execute([
    ':uid' => $_SESSION['user_id'],
    ':type' => $type
]);

echo json_encode(['success' => true, 'vehicle' => ['vehicle_id' => $pdo->lastInsertId(), 'name' => $type]]);
