<?php
require_once '../controller/LlamadosController.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $controller = new LlamadosController();
    echo $controller->getLlamados();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}

