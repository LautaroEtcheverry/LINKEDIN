<?php
require_once 'Conexion.php';

class UsuariosModel {
    private $conn;
    
    public function __construct() {
        $this->conn = connection();
    }
    
    public function registrarUsuario($nombre, $email, $password) {
        $emailExistente = $this->buscarPorEmail($email);
        if ($emailExistente) {
            return ['success' => false, 'message' => 'El email ya está registrado'];
        }
        
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sss", $nombre, $email, $hashedPassword);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Usuario registrado exitosamente'];
        } else {
            return ['success' => false, 'message' => 'Error al registrar usuario'];
        }
    }
    
    public function buscarPorEmail($email) {
        $sql = "SELECT * FROM usuarios WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function verificarLogin($email, $password) {
        $usuario = $this->buscarPorEmail($email);
        
        if ($usuario && password_verify($password, $usuario['password'])) {
            unset($usuario['password']);
            return ['success' => true, 'usuario' => $usuario];
        } else {
            return ['success' => false, 'message' => 'Credenciales incorrectas'];
        }
    }
    
    public function obtenerUsuario($id) {
        $sql = "SELECT id, nombre, email FROM usuarios WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
}
