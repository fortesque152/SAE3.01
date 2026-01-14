<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
session_start();
require_once "db.php"; // connexion PDO

header('Content-Type: application/json');

// Vérification session
if (!isset($_SESSION['profile_id'])) {
    echo json_encode(['success' => false, 'error' => 'Utilisateur non connecté']);
    exit;
}

$profile_id = $_SESSION['profile_id'];

try {
    // Requête pour récupérer les véhicules liés au profil
    $stmt = $pdo->prepare("
        SELECT vt.vehicle_type_id, vt.name, vt.type_vehicule AS type
        FROM vehicle_type vt
        INNER JOIN profile_vehicle_type pvt 
            ON vt.vehicle_type_id = pvt.vehicle_type_id
        WHERE pvt.profile_id = :profile_id
    ");
    $stmt->execute([':profile_id' => $profile_id]);

    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'vehicles' => $vehicles
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
