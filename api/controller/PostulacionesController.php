<?php
require_once '../modelo/PostulacionesModel.php';

class PostulacionesController {
    
    public function postular() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return json_encode(['success' => false, 'message' => 'Método no permitido']);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['usuario_id']) || !isset($input['llamado_id'])) {
            return json_encode(['success' => false, 'message' => 'ID de usuario y llamado requeridos']);
        }
        
        $model = new PostulacionesModel();
        $resultado = $model->crearPostulacion($input['usuario_id'], $input['llamado_id']);
        
        return json_encode($resultado);
    }
    
    public function misPostulaciones() {
        session_start();
        
        if (!isset($_SESSION['usuario_id'])) {
            return json_encode(['success' => false, 'message' => 'Debes iniciar sesión']);
        }
        
        $model = new PostulacionesModel();
        $postulaciones = $model->obtenerPostulacionesUsuario($_SESSION['usuario_id']);
        
        return json_encode(['success' => true, 'postulaciones' => $postulaciones]);
    }
    
    public function verificarPostulacion() {
        session_start();
        
        if (!isset($_SESSION['usuario_id'])) {
            return json_encode(['postulado' => false]);
        }
        
        if (!isset($_GET['llamado_id'])) {
            return json_encode(['postulado' => false]);
        }
        
        $model = new PostulacionesModel();
        $yaPostulado = $model->yaSePostulo($_SESSION['usuario_id'], $_GET['llamado_id']);
        
        return json_encode(['postulado' => $yaPostulado]);
    }
}
