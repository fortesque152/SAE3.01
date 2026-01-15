<?php

namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Modèle Parking - Gestion des parkings
 */
class Parking {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Trouve un parking par son API ID
     */
    public function findByApiId(string $apiId): ?array {
        $stmt = $this->db->prepare("
            SELECT parking_id, name, latitude, longitude, total_spots, type, address, is_free
            FROM parking
            WHERE apiId = ?
        ");
        $stmt->execute([$apiId]);
        $parking = $stmt->fetch();
        
        return $parking ?: null;
    }

    /**
     * Crée ou met à jour un parking
     */
    public function createOrUpdate(array $data): int {
        // Vérifier si le parking existe
        $existing = $this->findByApiId($data['apiId']);

        if ($existing) {
            // Mettre à jour
            $stmt = $this->db->prepare("
                UPDATE parking
                SET name = ?, latitude = ?, longitude = ?, total_spots = ?,
                    type = ?, address = ?, is_free = ?, last_api_sync = NOW()
                WHERE apiId = ?
            ");
            $stmt->execute([
                $data['name'],
                $data['latitude'],
                $data['longitude'],
                $data['total_spots'] ?? null,
                $data['type'] ?? null,
                $data['address'] ?? null,
                $data['is_free'] ?? null,
                $data['apiId']
            ]);
            return $existing['parking_id'];
        } else {
            // Créer
            $stmt = $this->db->prepare("
                INSERT INTO parking
                (apiId, name, type, address, latitude, longitude, is_free, total_spots, last_api_sync)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $data['apiId'],
                $data['name'],
                $data['type'] ?? null,
                $data['address'] ?? null,
                $data['latitude'],
                $data['longitude'],
                $data['is_free'] ?? null,
                $data['total_spots'] ?? null
            ]);
            return (int)$this->db->lastInsertId();
        }
    }
}
