<?php
$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$docRoot = realpath(__DIR__ . '/..');

if (strpos($uriPath, '/uploads/') === 0) {
    $filePath = $docRoot . $uriPath;
    if (is_file($filePath)) {
        return false;
    }
}

if (strpos($uriPath, '/api') === 0) {
    require __DIR__ . '/index.php';
    return true;
}

http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => false,
    'message' => 'Not found',
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
return true;
