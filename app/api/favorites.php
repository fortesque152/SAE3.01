<?php
/**
 * API Endpoint - Favorites
 * Gestion des parkings favoris
 */

require_once __DIR__ . '/../autoload.php';
require_once __DIR__ . '/../controllers/FavoriteController.php';

use App\Controllers\FavoriteController;

$controller = new FavoriteController();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $controller->getAll();
        break;
    
    case 'POST':
        $controller->add();
        break;
    
    case 'DELETE':
        $controller->remove();
        break;
    
    default:
        header("Content-Type: application/json");
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
