<?php
session_start();
header("Content-Type: application/json");

require_once "db.php";

if (!isset($_SESSION["profile_id"])) {
    echo json_encode(["success" => false, "message" => "Non connecté"]);
    exit;
}
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data["vehicleType"])) {
    echo json_encode(["success" => false, "message" => "Données invalides"]);
    exit;
}

$profileId = $_SESSION["profile_id"];
$vehicleType = $data["vehicleType"];

try {
    $stmt = $pdo->prepare("
        DELETE FROM vehicle_type
        WHERE vehicle_type_id = :type
    ");

    $stmt->execute([
        ":type" => $vehicleType
    ]);

    echo json_encode([
        "success" => true,
        "deleted" => $stmt->rowCount()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur SQL",
        "error" => $e->getMessage()
    ]);
}
