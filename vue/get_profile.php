<?php
session_start();
require_once "db.php";

if (!isset($_SESSION["profile_id"])) {
    echo json_encode(["connected" => false]);
    exit();
}

$profileId = $_SESSION["profile_id"];

/* Infos profil */
$stmt = $pdo->prepare("
    SELECT 
        profile_id,
        profile_name,
        is_pmr,
        avatar_color
    FROM profile
    WHERE profile_id = ?
");
$stmt->execute([$profileId]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

/* Types de véhicules */
$stmt = $pdo->prepare("
    SELECT vt.vehicle_type_id, vt.name
    FROM vehicle_type vt
    JOIN profile_vehicle_type pvt 
        ON pvt.vehicle_type_id = vt.vehicle_type_id
    WHERE pvt.profile_id = ?
");
$stmt->execute([$profileId]);
$vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* Préférences */
$stmt = $pdo->prepare("
    SELECT pt.key, pp.value
    FROM profile_preference pp
    JOIN preference_type pt 
        ON pt.preference_type_id = pp.preference_type_id
    WHERE pp.profile_id = ?
");
$stmt->execute([$profileId]);
$preferences = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "connected" => true,
    "profile" => $profile,
    "vehicles" => $vehicles,
    "preferences" => $preferences
]);
