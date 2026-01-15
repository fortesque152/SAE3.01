<?php

namespace App\Controllers;

use App\Models\Profile;

/**
 * Contrôleur de profil utilisateur
 */
class ProfileController {
    private Profile $profileModel;

    public function __construct() {
        $this->profileModel = new Profile();
    }

    /**
     * Récupère le profil de l'utilisateur connecté
     */
    public function getProfile(): void {
        session_start();
        header("Content-Type: application/json");

        if (!isset($_SESSION['account_id'])) {
            echo json_encode(["connected" => false]);
            exit;
        }

        $profile = $this->profileModel->getDefaultProfile($_SESSION['account_id']);

        if (!$profile) {
            echo json_encode(["connected" => false]);
            exit;
        }

        // Récupérer le type de véhicule si existe
        $vehicleType = null;
        if (!empty($profile['vehicles'])) {
            $vehicleType = $profile['vehicles'][0]['type'] ?? null;
        }

        // Formater la réponse
        $response = [
            "connected" => true,
            "profile" => [
                "profile_id" => $profile['profile_id'],
                "name" => $profile['name'],
                "is_pmr" => (bool)$profile['is_pmr'],
                "vehicles" => $profile['vehicles'],
                "preferences" => $profile['favorites']
            ],
            "vehicleType" => $vehicleType
        ];

        echo json_encode($response);
    }

    /**
     * Vérifie l'état de connexion
     */
    public function checkAuth(): void {
        session_start();
        header("Content-Type: application/json");

        if (!isset($_SESSION["account_id"])) {
            echo json_encode(["connected" => false]);
            exit;
        }

        echo json_encode([
            "connected" => true,
            "account_id" => $_SESSION["account_id"],
            "profile_id" => $_SESSION["profile_id"],
            "profile_name" => $_SESSION["profile_name"]
        ]);
    }

    /**
     * Ajoute un véhicule au profil
     */
    public function addVehicle(): void {
        session_start();
        header("Content-Type: application/json");

        if (!isset($_SESSION['profile_id'])) {
            echo json_encode(['success' => false, 'error' => 'Non connecté']);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $name = trim($data['name'] ?? '');
        $type = $data['type'] ?? '';

        $allowedTypes = ['car', 'electric', 'motorcycle', 'bike'];
        if (!$name || !in_array($type, $allowedTypes)) {
            echo json_encode(['success' => false, 'error' => 'Nom ou type invalide']);
            exit;
        }

        $vehicleTypeId = $this->profileModel->addVehicle($_SESSION['profile_id'], $name, $type);

        if (!$vehicleTypeId) {
            echo json_encode(['success' => false, 'error' => 'Erreur serveur']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'vehicle' => [
                'vehicle_type_id' => $vehicleTypeId,
                'name' => $name,
                'type' => $type
            ]
        ]);
    }

    /**
     * Supprime un véhicule
     */
    public function removeVehicle(): void {
        session_start();
        header("Content-Type: application/json");

        if (!isset($_SESSION['profile_id'])) {
            echo json_encode(['success' => false, 'error' => 'Non connecté']);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $vehicleTypeId = (int)($data['vehicle_type_id'] ?? 0);

        if (!$vehicleTypeId) {
            echo json_encode(['success' => false, 'error' => 'ID véhicule invalide']);
            exit;
        }

        $success = $this->profileModel->removeVehicle($_SESSION['profile_id'], $vehicleTypeId);

        echo json_encode(['success' => $success]);
    }

    /**
     * Récupère tous les véhicules du profil
     */
    public function getVehicles(): void {
        session_start();
        header("Content-Type: application/json");

        if (!isset($_SESSION['profile_id'])) {
            echo json_encode(['success' => false]);
            exit;
        }

        $vehicles = $this->profileModel->getVehicles($_SESSION['profile_id']);

        echo json_encode([
            'success' => true,
            'vehicles' => $vehicles
        ]);
    }
}
