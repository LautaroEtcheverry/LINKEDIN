<?php
require_once '../controller/UsuariosController.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$controller = new UsuariosController();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        echo $controller->registrar();
        break;
    case 'login':
        echo $controller->login();
        break;
    case 'logout':
        echo $controller->logout();
        break;
    case 'verificar-sesion':
        echo $controller->verificarSesion();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Acción no válida']);
        break;
}
