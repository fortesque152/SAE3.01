<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
session_start();
require_once "db.php"; // fichier de connexion PDO

if (!isset($_SESSION['account_id'])) {
    echo json_encode(['success' => false, 'error' => 'Non connecté']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$name  = trim($data['name'] ?? '');
$type = $data['type'] ?? '';

$allowedTypes = ['car','electric','motorcycle','bike'];
if (!$name || !in_array($type, $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Nom ou type invalide']);
    exit;
}

try {
    // 1️⃣ Insérer le véhicule dans vehicle_type
    $stmt = $pdo->prepare("INSERT INTO vehicle_type (name,type_vehicule,created_at) VALUES (:name, :type, NOW())");
    $stmt->execute([
        ':name' => $name,
        ':type' => $type
    ]);

    // Récupérer l'ID du véhicule ajouté
    $vehicleTypeId = $pdo->lastInsertId();

    // 2️⃣ Lier le véhicule au profil utilisateur
    $stmt = $pdo->prepare("INSERT INTO profile_vehicle_type (profile_id,vehicle_type_id) VALUES (:profile_id, :vehicle_type_id)");
    $stmt->execute([
        ':profile_id' => $_SESSION['profile_id'],
        ':vehicle_type_id' => $vehicleTypeId
    ]);

    // 3️⃣ Retour JSON
    echo json_encode([
        'success' => true,
        'vehicle' => [
            'vehicle_type_id' => $vehicleTypeId,
            'name' => $name,
            'type' => $type
        ]
    ]);

} catch(PDOException $e){
    echo json_encode(['success'=>false, 'error'=>$e->getMessage()]);
}
