<?php
// ============================================
// AUTH MIDDLEWARE
// ============================================

require_once __DIR__ . '/JwtHelper.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($authHeader)) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Token tidak ditemukan. Silakan login.'
            ]);
            exit;
        }

        // Extract Bearer token
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Format token tidak valid.'
            ]);
            exit;
        }

        $decoded = JwtHelper::decode($token);
        if ($decoded === null) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Token expired atau tidak valid. Silakan login ulang.'
            ]);
            exit;
        }

        return $decoded;
    }
}
