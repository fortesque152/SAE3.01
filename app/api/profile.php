<?php
/**
 * API Endpoint - Profile
 * Récupère le profil de l'utilisateur connecté
 */

require_once __DIR__ . '/../autoload.php';
require_once __DIR__ . '/../controllers/ProfileController.php';

use App\Controllers\ProfileController;

$controller = new ProfileController();
$controller->getProfile();
