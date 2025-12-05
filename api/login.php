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

// Récupérer les données JSON
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

if (!$data) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Données invalides'
    ]);
    exit;
}

// Valider les champs requis
if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Nom d\'utilisateur et mot de passe requis'
    ]);
    exit;
}

$username = sanitizeInput($data['username']);
$password = $data['password'];

// Validation basique
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Nom d\'utilisateur et mot de passe requis'
    ]);
    exit;
}

try {
    $pdo = getDBConnection();

    // Récupérer l'utilisateur
    $stmt = $pdo->prepare("
        SELECT id, username, email, password_hash, created_at 
        FROM users 
        WHERE username = ?
    ");

    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Nom d\'utilisateur ou mot de passe incorrect'
        ]);
        exit;
    }

    // Vérifier le mot de passe
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Nom d\'utilisateur ou mot de passe incorrect'
        ]);
        exit;
    }

    // Créer un token JWT
    $token = createJWT($user['id'], $user['username'], $user['email']);

    // Optionnel: Sauvegarder le token en base de données
    $expiresAt = date('Y-m-d H:i:s', time() + JWT_EXPIRATION);

    // Nettoyer les anciens tokens expirés de cet utilisateur
    $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE user_id = ? AND expires_at < NOW()");
    $stmt->execute([$user['id']]);

    // Insérer le nouveau token
    $stmt = $pdo->prepare("
        INSERT INTO user_sessions (user_id, token, expires_at) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$user['id'], $token, $expiresAt]);

    // Retourner la réponse
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie',
        'token' => $token,
        'user' => [
            'id' => (int) $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'createdAt' => $user['created_at']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la connexion'
    ]);
}
?>