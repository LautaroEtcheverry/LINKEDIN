<?php
require_once '../controller/PostulacionesController.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$controller = new PostulacionesController();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'postular':
        echo $controller->postular();
        break;
    case 'mis-postulaciones':
        echo $controller->misPostulaciones();
        break;
    case 'verificar':
        echo $controller->verificarPostulacion();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Acción no válida']);
        break;
}
