<?php
require_once 'Conexion.php';

class LlamadosModel {
    private $conn;
    
    public function __construct() {
        $this->conn = connection();
    }
    
    public function traerLlamados() {
        $sql = "SELECT l.id, l.titulo, l.descripcion, l.fecha, l.tipo, l.empresa_id,
                       e.nombre as empresa_nombre, e.logo, e.descripcion as empresa_descripcion
                FROM llamados l
                INNER JOIN empresas e ON l.empresa_id = e.id
                ORDER BY l.fecha DESC";
        
        $result = $this->conn->query($sql);
        $llamados = [];
        while ($row = $result->fetch_assoc()) {
            $llamados[] = $row;
        }
        return $llamados;
    }
    
    public function obtenerLlamado($id) {
        $sql = "SELECT l.id, l.titulo, l.descripcion, l.fecha, l.tipo, l.empresa_id,
                       e.nombre as empresa_nombre, e.logo, e.descripcion as empresa_descripcion
                FROM llamados l
                INNER JOIN empresas e ON l.empresa_id = e.id
                WHERE l.id = ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
}
