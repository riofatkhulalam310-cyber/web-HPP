<?php
// ============================================
// CONTROLLER: Auth
// ============================================

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/JwtHelper.php';

class AuthController {
    private $userModel;

    public function __construct($db) {
        $this->userModel = new User($db);
    }

    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Email dan password wajib diisi'];
        }

        $user = $this->userModel->login($data['email'], $data['password']);
        if (!$user) {
            http_response_code(401);
            return ['success' => false, 'message' => 'Email atau password salah'];
        }

        $token = JwtHelper::encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);

        return [
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ];
    }

    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nama']) || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Nama, email, dan password wajib diisi'];
        }

        if (strlen($data['password']) < 6) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Password minimal 6 karakter'];
        }

        try {
            $this->userModel->register($data);
            return ['success' => true, 'message' => 'Registrasi berhasil'];
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                http_response_code(409);
                return ['success' => false, 'message' => 'Email sudah terdaftar'];
            }
            http_response_code(500);
            return ['success' => false, 'message' => 'Gagal mendaftar'];
        }
    }

    public function me($userData) {
        $user = $this->userModel->getById($userData['user_id']);
        if (!$user) {
            http_response_code(404);
            return ['success' => false, 'message' => 'User tidak ditemukan'];
        }
        return ['success' => true, 'data' => $user];
    }
}
