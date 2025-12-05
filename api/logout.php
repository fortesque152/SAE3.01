<?php
require_once 'config.php';

setCORSHeaders();

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée'
    ]);
    exit;
}

// Récupérer le token
$token = getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Token manquant'
    ]);
    exit;
}

try {
    $pdo = getDBConnection();

    // Supprimer le token de la base de données
    $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE token = ?");
    $stmt->execute([$token]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Déconnexion réussie'
    ]);

} catch (PDOException $e) {
    error_log("Logout error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la déconnexion'
    ]);
}
?>