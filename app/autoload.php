<?php
/**
 * Autoloader PSR-4 simple pour charger les classes du namespace App
 */

spl_autoload_register(function ($class) {
    // Namespace de base
    $prefix = 'App\\';
    
    // Dossier de base pour le namespace
    $base_dir = __DIR__ . '/';
    
    // Vérifier si la classe utilise le namespace
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        // Non, passer à l'autoloader suivant
        return;
    }
    
    // Obtenir le nom relatif de la classe
    $relative_class = substr($class, $len);
    
    // Remplacer les backslashes par des slashes
    $path_parts = explode('\\', $relative_class);
    
    // Mettre le dossier en minuscules, garder le nom de classe intact
    if (count($path_parts) > 1) {
        $class_name = array_pop($path_parts);
        $directory = strtolower(implode('/', $path_parts));
        $file = $base_dir . $directory . '/' . $class_name . '.php';
    } else {
        $file = $base_dir . $relative_class . '.php';
    }
    
    // Si le fichier existe, le charger
    if (file_exists($file)) {
        require $file;
    }
});
