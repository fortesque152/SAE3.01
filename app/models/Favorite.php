<?php

namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Modèle Favorite - Gestion des favoris
 */
class Favorite {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Ajoute un parking aux favoris
     */
    public function add(int $profileId, int $parkingId): bool {
        try {
            // Vérifier si déjà en favori
            if ($this->exists($profileId, $parkingId)) {
                return true;
            }

            $stmt = $this->db->prepare("
                INSERT INTO favorite (profile_id, parking_id, added_at)
                VALUES (?, ?, NOW())
            ");
            $stmt->execute([$profileId, $parkingId]);
            return true;
        } catch (\Exception $e) {
            error_log("Add favorite error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Supprime un parking des favoris
     */
    public function remove(int $profileId, int $parkingId): bool {
        try {
            $stmt = $this->db->prepare("
                DELETE FROM favorite
                WHERE profile_id = ? AND parking_id = ?
            ");
            $stmt->execute([$profileId, $parkingId]);
            return true;
        } catch (\Exception $e) {
            error_log("Remove favorite error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Vérifie si un parking est déjà en favori
     */
    public function exists(int $profileId, int $parkingId): bool {
        $stmt = $this->db->prepare("
            SELECT 1 FROM favorite
            WHERE profile_id = ? AND parking_id = ?
        ");
        $stmt->execute([$profileId, $parkingId]);
        return $stmt->fetch() !== false;
    }

    /**
     * Récupère tous les favoris d'un profil
     */
    public function getAllByProfile(int $profileId): array {
        $stmt = $this->db->prepare("
            SELECT 
                p.parking_id,
                p.apiId,
                p.name,
                p.latitude,
                p.longitude,
                p.total_spots,
                f.added_at
            FROM favorite f
            JOIN parking p ON p.parking_id = f.parking_id
            WHERE f.profile_id = ?
            ORDER BY f.added_at DESC
        ");
        $stmt->execute([$profileId]);
        return $stmt->fetchAll();
    }
}
