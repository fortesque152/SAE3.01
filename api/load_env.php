<?php
/**
 * Charge les variables d'environnement depuis le fichier .env
 */
function loadEnv($path)
{
    if (!file_exists($path)) {
        throw new Exception("Le fichier .env est introuvable à : $path");
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        // Ignorer les commentaires
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parser la ligne KEY=VALUE
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        // Retirer les guillemets si présents
        $value = trim($value, '"\'');

        // Définir la variable d'environnement
        if (!array_key_exists($name, $_ENV)) {
            putenv("$name=$value");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Charger le .env depuis la racine du projet
$envPath = __DIR__ . '/../.env';
loadEnv($envPath);
?>