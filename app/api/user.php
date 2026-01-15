<?php
/**
 * API Endpoint - User Auth Check
 * Vérifie l'état de connexion de l'utilisateur
 */

require_once __DIR__ . '/../autoload.php';
require_once __DIR__ . '/../controllers/ProfileController.php';

use App\Controllers\ProfileController;

$controller = new ProfileController();
$controller->checkAuth();
