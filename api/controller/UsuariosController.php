<?php
require_once '../modelo/UsuariosModel.php';

class UsuariosController {
    
    public function registrar() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return json_encode(['success' => false, 'message' => 'Método no permitido']);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['nombre']) || !isset($input['email']) || !isset($input['password'])) {
            return json_encode(['success' => false, 'message' => 'Datos incompletos']);
        }
        
        if (strlen($input['password']) < 4) {
            return json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 4 caracteres']);
        }
        
        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            return json_encode(['success' => false, 'message' => 'Email inválido']);
        }
        
        $model = new UsuariosModel();
        $resultado = $model->registrarUsuario($input['nombre'], $input['email'], $input['password']);
        
        return json_encode($resultado);
    }
    
    public function login() {
        session_start();
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return json_encode(['success' => false, 'message' => 'Método no permitido']);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['email']) || !isset($input['password'])) {
            return json_encode(['success' => false, 'message' => 'Email y contraseña requeridos']);
        }
        
        $model = new UsuariosModel();
        $resultado = $model->verificarLogin($input['email'], $input['password']);
        
        if ($resultado['success']) {
            $_SESSION['usuario_id'] = $resultado['usuario']['id'];
            $_SESSION['usuario_nombre'] = $resultado['usuario']['nombre'];
            $_SESSION['usuario_email'] = $resultado['usuario']['email'];
        }
        
        return json_encode($resultado);
    }
    
    public function logout() {
        session_start();
        session_destroy();
        return json_encode(['success' => true, 'message' => 'Sesión cerrada exitosamente']);
    }
    
    public function verificarSesion() {
        session_start();
        
        if (isset($_SESSION['usuario_id'])) {
            return json_encode([
                'logueado' => true,
                'usuario' => [
                    'id' => $_SESSION['usuario_id'],
                    'nombre' => $_SESSION['usuario_nombre'],
                    'email' => $_SESSION['usuario_email']
                ]
            ]);
        } else {
            return json_encode(['logueado' => false]);
        }
    }
}
