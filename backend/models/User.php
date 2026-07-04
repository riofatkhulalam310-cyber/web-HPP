<?php
// ============================================
// MODEL: User
// ============================================

class User {
    private $conn;
    private $table = 'users';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function login($email, $password) {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE email = :email LIMIT 1");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            unset($user['password_hash']);
            return $user;
        }
        return false;
    }

    public function register($data) {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (nama, email, password_hash, role) 
             VALUES (:nama, :email, :password_hash, :role)"
        );
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
        $stmt->bindParam(':nama', $data['nama']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password_hash', $passwordHash);
        $role = $data['role'] ?? 'admin';
        $stmt->bindParam(':role', $role);
        return $stmt->execute();
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT id, nama, email, role, created_at FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }
}
