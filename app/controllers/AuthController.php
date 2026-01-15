<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\Profile;

/**
 * Contrôleur d'authentification
 * Gère la connexion et l'inscription
 */
class AuthController {
    private User $userModel;
    private Profile $profileModel;

    public function __construct() {
        $this->userModel = new User();
        $this->profileModel = new Profile();
    }

    /**
     * Connexion d'un utilisateur
     */
    public function login(): void {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            $this->redirect('../../');
            return;
        }

        $email = $_POST["email"] ?? "";
        $password = $_POST["password"] ?? "";

        // Récupérer l'utilisateur
        $user = $this->userModel->findByEmail($email);

        if (!$user || !$this->userModel->verifyPassword($password, $user["password_hash"])) {
            $this->redirect('../../?error=login');
            return;
        }

        // Mettre à jour la dernière connexion
        $this->userModel->updateLastLogin($user["account_id"]);

        // Créer la session
        $this->startSession($user);

        // Rediriger vers l'application
        $this->redirect('../../public/Application.html');
    }

    /**
     * Inscription d'un nouvel utilisateur
     */
    public function register(): void {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            $this->redirect('../../app/views/register.php');
            return;
        }

        $email = $_POST["email"] ?? "";
        $password = $_POST["password"] ?? "";
        $confirm = $_POST["confirm-password"] ?? "";
        $username = $_POST["username"] ?? "";

        // Validation
        if ($password !== $confirm) {
            $this->redirect('../../app/views/register.php?error=passwords');
            return;
        }

        // Vérifier si l'email existe déjà
        if ($this->userModel->emailExists($email)) {
            $this->redirect('../../app/views/register.php?error=email');
            return;
        }

        // Créer l'utilisateur
        $accountId = $this->userModel->create($email, $password, $username);

        if (!$accountId) {
            $this->redirect('../../app/views/register.php?error=server');
            return;
        }

        // Récupérer l'utilisateur créé
        $user = $this->userModel->findByEmail($email);

        // Créer la session
        $this->startSession($user);

        // Rediriger vers la page de connexion
        $this->redirect('../../');
    }

    /**
     * Déconnexion
     */
    public function logout(): void {
        session_start();
        session_unset();
        session_destroy();
        $this->redirect('../../');
    }

    /**
     * Démarre une session utilisateur
     */
    private function startSession(array $user): void {
        session_start();
        $_SESSION["account_id"] = $user["account_id"];
        $_SESSION["profile_id"] = $user["profile_id"];
        $_SESSION["profile_name"] = $user["profile_name"];
    }

    /**
     * Redirection
     */
    private function redirect(string $url): void {
        header("Location: $url");
        exit();
    }
}
