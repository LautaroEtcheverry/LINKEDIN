<?php
function connection() {
    try {
        $host = "localhost";
        $bd = "linkedin2";
        $usuario = "root";
        $password = "";
        $puerto = "3306";
        $mysqli = new mysqli($host, $usuario, $password, $bd, $puerto);
        return $mysqli;
    } catch(Exception $e) {
        echo $e->getMessage();
    }
}
