<?php
/**
 * API Endpoint - Route Proxy
 * Proxy vers OpenRouteService pour éviter les problèmes CORS
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

$body = file_get_contents("php://input");
if (!$body) {
    http_response_code(400);
    echo json_encode(["error" => "Empty body"]);
    exit;
}

// Charger la clé API depuis .env
require_once __DIR__ . '/../config/Database.php';

use App\Config\Database;

// Initialiser Database pour charger les variables d'environnement
Database::getInstance();

$ORS_KEY = $_ENV['ORS_API_KEY'] ?? '';

if (!$ORS_KEY || $ORS_KEY === 'your_ors_api_key_here') {
    http_response_code(500);
    echo json_encode(["error" => "ORS API key not configured"]);
    exit;
}

$ch = curl_init("https://api.openrouteservice.org/v2/directions/driving-car/geojson");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: $ORS_KEY",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(["error" => "cURL failed", "detail" => $error]);
    exit;
}

http_response_code($http);
echo $response;
