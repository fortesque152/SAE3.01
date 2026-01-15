<?php

namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Modèle Profile - Gestion des profils utilisateurs
 */
class Profile {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Récupère le profil par défaut d'un utilisateur
     */
    public function getDefaultProfile(int $accountId): ?array {
        $stmt = $this->db->prepare("
            SELECT 
                p.profile_id,
                p.profile_name AS name,
                p.is_pmr,
                pvt.vehicle_type_id
            FROM profile p
            LEFT JOIN profile_vehicle_type pvt ON pvt.profile_id = p.profile_id
            WHERE p.account_id = ? AND p.is_default = TRUE
        ");
        $stmt->execute([$accountId]);
        $profile = $stmt->fetch();

        if (!$profile) {
            return null;
        }

        // Récupérer les véhicules
        $profile['vehicles'] = $this->getVehicles($profile['profile_id']);

        // Récupérer les favoris
        $profile['favorites'] = $this->getFavorites($profile['profile_id']);

        return $profile;
    }

    /**
     * Récupère les véhicules d'un profil
     */
    public function getVehicles(int $profileId): array {
        $stmt = $this->db->prepare("
            SELECT 
                vt.vehicle_type_id,
                vt.name,
                vt.type_vehicule AS type
            FROM profile_vehicle_type pvt
            JOIN vehicle_type vt ON vt.vehicle_type_id = pvt.vehicle_type_id
            WHERE pvt.profile_id = ?
        ");
        $stmt->execute([$profileId]);
        return $stmt->fetchAll();
    }

    /**
     * Récupère les parkings favoris d'un profil
     */
    public function getFavorites(int $profileId): array {
        $stmt = $this->db->prepare("
            SELECT 
                p.parking_id,
                p.apiId,
                p.name,
                p.latitude,
                p.longitude,
                p.total_spots,
                p.type,
                p.address,
                p.is_free,
                f.added_at
            FROM favorite f
            JOIN parking p ON p.parking_id = f.parking_id
            WHERE f.profile_id = ?
            ORDER BY f.added_at DESC
        ");
        $stmt->execute([$profileId]);
        return $stmt->fetchAll();
    }

    /**
     * Ajoute un véhicule à un profil
     */
    public function addVehicle(int $profileId, string $name, string $type): ?int {
        try {
            $this->db->beginTransaction();

            // Créer le type de véhicule
            $stmt = $this->db->prepare("
                INSERT INTO vehicle_type (name, type_vehicule, created_at)
                VALUES (?, ?, NOW())
            ");
            $stmt->execute([$name, $type]);
            $vehicleTypeId = (int)$this->db->lastInsertId();

            // Lier au profil
            $stmt = $this->db->prepare("
                INSERT INTO profile_vehicle_type (profile_id, vehicle_type_id)
                VALUES (?, ?)
            ");
            $stmt->execute([$profileId, $vehicleTypeId]);

            $this->db->commit();
            return $vehicleTypeId;
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Add vehicle error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Supprime un véhicule
     */
    public function removeVehicle(int $profileId, int $vehicleTypeId): bool {
        try {
            // Supprimer la liaison
            $stmt = $this->db->prepare("
                DELETE FROM profile_vehicle_type
                WHERE profile_id = ? AND vehicle_type_id = ?
            ");
            $stmt->execute([$profileId, $vehicleTypeId]);

            return true;
        } catch (\Exception $e) {
            error_log("Remove vehicle error: " . $e->getMessage());
            return false;
        }
    }
}
