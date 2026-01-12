<?php
session_start();
require_once "db.php";
header("Content-Type: application/json");

if(!isset($_SESSION['account_id'])){
    echo json_encode(["success" => false, "message" => "Non connecté"]);
    exit();
}

$accountId = $_SESSION['account_id'];
$data = json_decode(file_get_contents("php://input"), true);
$vehicleType = $data['vehicleType'] ?? null;

if(!$vehicleType){
    echo json_encode(["success" => false, "message" => "Type de véhicule manquant"]);
    exit();
}

// Récupérer profil par défaut
$stmt = $pdo->prepare("SELECT profile_id FROM profile WHERE account_id = ? AND is_default = TRUE");
$stmt->execute([$accountId]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$profile){
    echo json_encode(["success" => false, "message" => "Profil introuvable"]);
    exit();
}

// Récupérer vehicle_type_id
$vstmt = $pdo->prepare("SELECT vehicle_type_id FROM vehicle_type WHERE name = ?");
$vstmt->execute([$vehicleType]);
$vehicle = $vstmt->fetch(PDO::FETCH_ASSOC);

if(!$vehicle){
    echo json_encode(["success" => false, "message" => "Type de véhicule invalide"]);
    exit();
}

// Supprimer les anciens liens
$pdo->prepare("DELETE FROM profile_vehicle_type WHERE profile_id = ?")->execute([$profile['profile_id']]);

// Ajouter le nouveau
$insert = $pdo->prepare("INSERT INTO profile_vehicle_type(profile_id, vehicle_type_id) VALUES (?, ?)");
$insert->execute([$profile['profile_id'], $vehicle['vehicle_type_id']]);

echo json_encode(["success" => true, "message" => "Véhicule mis à jour"]);
