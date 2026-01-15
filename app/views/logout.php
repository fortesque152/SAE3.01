<?php
/**
 * Déconnexion
 */

require_once __DIR__ . '/../../app/autoload.php';
require_once __DIR__ . '/../../app/controllers/AuthController.php';

use App\Controllers\AuthController;

$controller = new AuthController();
$controller->logout();
