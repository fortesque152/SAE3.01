<?php
session_start();
require_once "db.php";
header("Content-Type: application/json");

if (!isset($_SESSION['account_id'])) {
  echo json_encode(["success" => false, "message" => "Non connecté"]);
  exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$parkingId = (int)($data['parkingId'] ?? 0);

if ($parkingId <= 0) {
  echo json_encode(["success" => false, "message" => "Parking invalide"]);
  exit();
}

/* Profil par défaut */
$stmt = $pdo->prepare("
  SELECT profile_id 
  FROM profile 
  WHERE account_id = ? AND is_default = TRUE
");
$stmt->execute([$_SESSION['account_id']]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profile) {
  echo json_encode(["success" => false, "message" => "Profil introuvable"]);
  exit();
}

/* Suppression */
$delete = $pdo->prepare("
  DELETE FROM favorite 
  WHERE profile_id = ? AND parking_id = ?
");
$delete->execute([$profile['profile_id'], $parkingId]);

if ($delete->rowCount() === 0) {
  echo json_encode(["success" => false, "message" => "Favori inexistant"]);
  exit();
}

echo json_encode(["success" => true, "message" => "Favori supprimé"]);
