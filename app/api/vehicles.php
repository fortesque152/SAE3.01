<?php
/**
 * API Endpoint - Vehicles
 * Gestion des véhicules
 */

require_once __DIR__ . '/../autoload.php';
require_once __DIR__ . '/../controllers/ProfileController.php';

use App\Controllers\ProfileController;

$controller = new ProfileController();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $controller->getVehicles();
        break;
    
    case 'POST':
        $controller->addVehicle();
        break;
    
    case 'DELETE':
        $controller->removeVehicle();
        break;
    
    default:
        header("Content-Type: application/json");
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
