<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION["account_id"])) {
    echo json_encode(["connected" => false]);
    exit();
}

echo json_encode([
    "connected" => true,
    "account_id" => $_SESSION["account_id"],
    "profile_id" => $_SESSION["profile_id"],
    "profile_name" => $_SESSION["profile_name"]
]);
