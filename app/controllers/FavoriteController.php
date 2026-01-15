<?php

namespace App\Controllers;

use App\Models\Favorite;
use App\Models\Parking;
use App\Models\Profile;

/**
 * Contrôleur de favoris
 */
class FavoriteController {
    private Favorite $favoriteModel;
    private Parking $parkingModel;
    private Profile $profileModel;

    public function __construct() {
        $this->favoriteModel = new Favorite();
        $this->parkingModel = new Parking();
        $this->profileModel = new Profile();
    }

    /**
     * Récupère tous les favoris
     */
    public function getAll(): void {
        session_start();
        header("Content-Type: application/json");

        if (!isset($_SESSION['profile_id'])) {
            echo json_encode(["success" => false]);
            exit;
        }

        $favorites = $this->favoriteModel->getAllByProfile($_SESSION['profile_id']);

        echo json_encode([
            "success" => true,
            "favorites" => $favorites
        ]);
    }

    /**
     * Ajoute un parking aux favoris
     */
    public function add(): void {
        session_start();
        header("Content-Type: application/json");

        if (!isset($_SESSION['profile_id'])) {
            echo json_encode(["success" => false, "message" => "Non connecté"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data) {
            echo json_encode(["success" => false, "message" => "JSON invalide"]);
            exit;
        }

        // Extraire les données
        $apiId = $data['parkingId'] ?? null;
        $name = $data['lib'] ?? null;
        $lat = $data['lat'] ?? null;
        $lng = $data['long'] ?? null;
        $totalSpots = $data['spot'] ?? null;
        $type = $data['type'] ?? null;
        $address = $data['address'] ?? null;
        $isFree = $data['is_free'] ?? null;

        if (!$apiId || !$name || !$lat || !$lng) {
            echo json_encode(["success" => false, "message" => "Données incomplètes"]);
            exit;
        }

        // Créer ou récupérer le parking
        $parkingId = $this->parkingModel->createOrUpdate([
            'apiId' => $apiId,
            'name' => $name,
            'latitude' => $lat,
            'longitude' => $lng,
            'total_spots' => $totalSpots,
            'type' => $type,
            'address' => $address,
            'is_free' => $isFree
        ]);

        // Ajouter aux favoris
        $success = $this->favoriteModel->add($_SESSION['profile_id'], $parkingId);

        echo json_encode([
            "success" => $success,
            "message" => $success ? "Ajouté aux favoris" : "Erreur lors de l'ajout"
        ]);
    }

    /**
     * Supprime un parking des favoris
     */
    public function remove(): void {
        session_start();
        header("Content-Type: application/json");

        if (!isset($_SESSION['profile_id'])) {
            echo json_encode(["success" => false]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $parkingId = (int)($data['parking_id'] ?? 0);

        if (!$parkingId) {
            echo json_encode(["success" => false, "message" => "ID parking invalide"]);
            exit;
        }

        $success = $this->favoriteModel->remove($_SESSION['profile_id'], $parkingId);

        echo json_encode(["success" => $success]);
    }
}
