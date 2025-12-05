<?php
require_once 'config.php';

setCORSHeaders();

// Récupérer le token
$token = getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Non authentifié'
    ]);
    exit;
}

// Valider le JWT
$payload = validateJWT($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Token invalide ou expiré'
    ]);
    exit;
}

try {
    $pdo = getDBConnection();

    // Vérifier que le token existe toujours en base
    $stmt = $pdo->prepare("
        SELECT s.*, u.username, u.email, u.created_at 
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > NOW()
    ");

    $stmt->execute([$token]);
    $session = $stmt->fetch();

    if (!$session) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Session expirée'
        ]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => (int) $session['user_id'],
            'username' => $session['username'],
            'email' => $session['email'],
            'createdAt' => $session['created_at']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Verify error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de vérification'
    ]);
}
?>