<?php

namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Modèle User - Gestion des comptes utilisateurs
 */
class User {
    private PDO $db;
    
    public ?int $account_id = null;
    public ?string $email = null;
    public ?string $password_hash = null;
    public ?string $last_login = null;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Trouve un utilisateur par email
     */
    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("
            SELECT 
                a.account_id,
                a.email,
                a.password_hash,
                a.last_login,
                p.profile_id,
                p.profile_name
            FROM account a
            LEFT JOIN profile p ON p.account_id = a.account_id AND p.is_default = TRUE
            WHERE a.email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        return $user ?: null;
    }

    /**
     * Crée un nouvel utilisateur
     */
    public function create(string $email, string $password, string $username): ?int {
        try {
            $this->db->beginTransaction();

            // Créer le compte
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("
                INSERT INTO account (email, password_hash)
                VALUES (?, ?)
            ");
            $stmt->execute([$email, $passwordHash]);
            $accountId = (int)$this->db->lastInsertId();

            // Créer le profil par défaut
            $stmt = $this->db->prepare("
                INSERT INTO profile (account_id, profile_name, is_default)
                VALUES (?, ?, TRUE)
            ");
            $stmt->execute([$accountId, $username]);

            $this->db->commit();
            return $accountId;
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("User creation error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Vérifie si un email existe déjà
     */
    public function emailExists(string $email): bool {
        $stmt = $this->db->prepare("SELECT account_id FROM account WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch() !== false;
    }

    /**
     * Met à jour la date de dernière connexion
     */
    public function updateLastLogin(int $accountId): void {
        $stmt = $this->db->prepare("
            UPDATE account SET last_login = NOW()
            WHERE account_id = ?
        ");
        $stmt->execute([$accountId]);
    }

    /**
     * Vérifie le mot de passe
     */
    public function verifyPassword(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }
}
