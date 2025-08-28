<?php
require_once 'Conexion.php';

class PostulacionesModel {
    private $conn;
    
    public function __construct() {
        $this->conn = connection();
    }
    
    public function crearPostulacion($usuario_id, $llamado_id) {
        if ($this->yaSePostulo($usuario_id, $llamado_id)) {
            return ['success' => false, 'message' => 'Ya te has postulado a este llamado'];
        }
        
        $sql = "INSERT INTO postulaciones (usuario_id, llamado_id, fecha_postulacion) VALUES (?, ?, NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $usuario_id, $llamado_id);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Postulación enviada exitosamente'];
        } else {
            return ['success' => false, 'message' => 'Error al enviar postulación'];
        }
    }
    
    public function yaSePostulo($usuario_id, $llamado_id) {
        $sql = "SELECT id FROM postulaciones WHERE usuario_id = ? AND llamado_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $usuario_id, $llamado_id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->num_rows > 0;
    }
    
    public function obtenerPostulacionesUsuario($usuario_id) {
        $sql = "SELECT p.id as postulacion_id, p.fecha_postulacion,
                       l.id as llamado_id, l.titulo, l.descripcion, l.fecha, l.tipo,
                       e.nombre as empresa_nombre, e.logo,
                       u.nombre as usuario_nombre, u.email
                FROM postulaciones p
                INNER JOIN llamados l ON p.llamado_id = l.id
                INNER JOIN usuarios u ON p.usuario_id = u.id
                INNER JOIN empresas e ON l.empresa_id = e.id
                WHERE p.usuario_id = ?
                ORDER BY p.fecha_postulacion DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $postulaciones = [];
        while ($row = $result->fetch_assoc()) {
            $postulaciones[] = $row;
        }
        
        return $postulaciones;
    }
    
    public function obtenerTodasLasPostulaciones() {
        $sql = "SELECT p.id as postulacion_id, p.fecha_postulacion,
                       l.id as llamado_id, l.titulo, l.descripcion,
                       e.nombre as empresa_nombre,
                       u.nombre as usuario_nombre, u.email
                FROM postulaciones p
                INNER JOIN llamados l ON p.llamado_id = l.id
                INNER JOIN usuarios u ON p.usuario_id = u.id
                INNER JOIN empresas e ON l.empresa_id = e.id
                ORDER BY p.fecha_postulacion DESC";
        
        $result = $this->conn->query($sql);
        
        $postulaciones = [];
        while ($row = $result->fetch_assoc()) {
            $postulaciones[] = $row;
        }
        
        return $postulaciones;
    }
}
