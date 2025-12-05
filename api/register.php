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
if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Tous les champs sont requis'
    ]);
    exit;
}

$username = sanitizeInput($data['username']);
$email = sanitizeInput($data['email']);
$password = $data['password'];

// Validation
if (empty($username) || strlen($username) < 3) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
    ]);
    exit;
}

if (!isValidEmail($email)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email invalide'
    ]);
    exit;
}

if (!isValidPassword($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Le mot de passe doit contenir au moins 6 caractères'
    ]);
    exit;
}

try {
    $pdo = getDBConnection();

    // Vérifier si l'utilisateur existe déjà
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Un utilisateur avec ce nom ou cet email existe déjà'
        ]);
        exit;
    }

    // Hasher le mot de passe
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // Insérer le nouvel utilisateur
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash) 
        VALUES (?, ?, ?)
    ");

    $stmt->execute([$username, $email, $passwordHash]);

    $userId = $pdo->lastInsertId();

    // Créer un token JWT
    $token = createJWT($userId, $username, $email);

    // Optionnel: Sauvegarder le token en base de données
    $expiresAt = date('Y-m-d H:i:s', time() + JWT_EXPIRATION);
    $stmt = $pdo->prepare("
        INSERT INTO user_sessions (user_id, token, expires_at) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$userId, $token, $expiresAt]);

    // Retourner la réponse
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Inscription réussie',
        'token' => $token,
        'user' => [
            'id' => $userId,
            'username' => $username,
            'email' => $email,
            'createdAt' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (PDOException $e) {
    error_log("Register error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de l\'inscription'
    ]);
}
?>