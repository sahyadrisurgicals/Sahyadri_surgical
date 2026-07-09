<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');

const APP_ROOT = __DIR__ . '/..';
const BACKEND_ROOT = __DIR__;

function load_environment_file(): void {
    static $loaded = false;
    if ($loaded) {
        return;
    }

    $path = APP_ROOT . DIRECTORY_SEPARATOR . '.env';
    if (is_file($path)) {
        $lines = file($path, FILE_IGNORE_NEW_LINES);
        if (is_array($lines)) {
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#') {
                    continue;
                }
                if (strpos($line, '=') === false) {
                    continue;
                }

                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                if ($key === '') {
                    continue;
                }

                $startsAndEndsWithDoubleQuotes = strlen($value) >= 2 && substr($value, 0, 1) === '"' && substr($value, -1) === '"';
                $startsAndEndsWithSingleQuotes = strlen($value) >= 2 && substr($value, 0, 1) === "'" && substr($value, -1) === "'";
                if ($startsAndEndsWithDoubleQuotes || $startsAndEndsWithSingleQuotes) {
                    $value = substr($value, 1, -1);
                }

                if (getenv($key) === false || getenv($key) === '') {
                    putenv($key . '=' . $value);
                    $_ENV[$key] = $value;
                    $_SERVER[$key] = $value;
                }
            }
        }
    }

    $loaded = true;
}

function env_value(string $key, $default = null) {
    load_environment_file();
    $value = getenv($key);
    if ($value === false || $value === null || $value === '') {
        return $default;
    }
    return $value;
}

function app_config(): array {
    return [
        'db_host' => env_value('DB_HOST', 'localhost'),
        'db_user' => env_value('DB_USER', 'root'),
        'db_password' => env_value('DB_PASSWORD', 'root'),
        'db_name' => env_value('DB_NAME', 'sahyadri_surgical'),
        'jwt_secret' => env_value('JWT_SECRET', 'sahyadri-surgical-secret'),
        'frontend_origin' => env_value('FRONTEND_ORIGIN', '*'),
    ];
}

function json_encode_safe($value): string {
    $encoded = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    return $encoded === false ? 'null' : $encoded;
}

function parse_json_value($value, $fallback = null) {
    if ($value === null || $value === '') {
        return $fallback;
    }
    if (!is_string($value)) {
        return $value;
    }
    $decoded = json_decode($value, true);
    return json_last_error() === JSON_ERROR_NONE ? $decoded : $fallback;
}

function is_list_array($value): bool {
    if (!is_array($value)) {
        return false;
    }
    if ($value === []) {
        return true;
    }
    return array_keys($value) === range(0, count($value) - 1);
}

function parse_array_value($value, array $fallback = []): array {
    if (is_array($value)) {
        return $value;
    }
    if (is_string($value) && trim($value) !== '') {
        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            if (is_array($decoded) && is_list_array($decoded)) {
                return $decoded;
            }
            return $fallback;
        }
        return array_values(array_filter(array_map('trim', preg_split("/\r?\n/", $value) ?: []), static function ($item) {
            return $item !== '';
        }));
    }
    return $fallback;
}

function parse_object_value($value, array $fallback = []): array {
    if (is_array($value) && !is_list_array($value)) {
        return $value;
    }
    if (is_string($value) && trim($value) !== '') {
        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded) && !is_list_array($decoded)) {
            return $decoded;
        }
    }
    return $fallback;
}

function to_boolean($value, bool $fallback = false): bool {
    if ($value === null || $value === '') {
        return $fallback;
    }
    if (is_bool($value)) {
        return $value;
    }
    if (is_int($value) || is_float($value)) {
        return (bool) $value;
    }
    $normalized = strtolower(trim((string) $value));
    if (in_array($normalized, ['1', 'true', 'yes', 'on', 'active', 'published', 'enabled'], true)) {
        return true;
    }
    if (in_array($normalized, ['0', 'false', 'no', 'off', 'inactive', 'unpublished', 'disabled'], true)) {
        return false;
    }
    return (bool) $value;
}

function to_number($value, $fallback = 0) {
    if (is_int($value) || is_float($value)) {
        return $value;
    }
    if (is_string($value) && is_numeric(trim($value))) {
        return $value + 0;
    }
    return $fallback;
}

function normalize_identifier($value): string {
    return trim((string) ($value ?? ''));
}

function is_numeric_identifier($value): bool {
    return preg_match('/^\d+$/', normalize_identifier($value)) === 1;
}

function slugify(string $value): string {
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-');
}

function send_json($payload, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode_safe($payload);
    exit;
}

function send_success($data = null, string $message = 'Success', int $status = 200): void {
    send_json([
        'success' => true,
        'message' => $message,
        'data' => $data,
    ], $status);
}

function send_error(int $status, string $message, $details = null): void {
    $payload = [
        'success' => false,
        'message' => $message,
    ];
    if ($details !== null) {
        $payload['details'] = $details;
    }
    send_json($payload, $status);
}

function request_method(): string {
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function request_path(): string {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    if ($path !== '/' && substr($path, -1) === '/') {
        $path = rtrim($path, '/');
    }
    return $path ?: '/';
}

function request_query(string $key, $default = null) {
    return $_GET[$key] ?? $default;
}

function request_body(): array {
    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }

    $contentType = strtolower($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
    if (strpos($contentType, 'multipart/form-data') !== false || strpos($contentType, 'application/x-www-form-urlencoded') !== false) {
        $cached = $_POST;
        return $cached;
    }

    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        $cached = [];
        return $cached;
    }

    $decoded = json_decode($raw, true);
    $cached = json_last_error() === JSON_ERROR_NONE && is_array($decoded) ? $decoded : [];
    return $cached;
}

function base64url_encode_value(string $value): string {
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function base64url_decode_value(string $value): string {
    $remainder = strlen($value) % 4;
    if ($remainder > 0) {
        $value .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($value, '-_', '+/')) ?: '';
}

function jwt_encode(array $payload, string $secret, int $ttlSeconds = 28800): string {
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];
    if (!isset($payload['exp'])) {
        $payload['exp'] = time() + $ttlSeconds;
    }

    $segments = [
        base64url_encode_value(json_encode_safe($header)),
        base64url_encode_value(json_encode_safe($payload)),
    ];
    $signingInput = implode('.', $segments);
    $signature = hash_hmac('sha256', $signingInput, $secret, true);
    $segments[] = base64url_encode_value($signature);
    return implode('.', $segments);
}

function jwt_decode(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$header64, $payload64, $signature64] = $parts;
    $signingInput = $header64 . '.' . $payload64;
    $expectedSignature = base64url_encode_value(hash_hmac('sha256', $signingInput, $secret, true));
    if (!hash_equals($expectedSignature, $signature64)) {
        return null;
    }

    $payload = json_decode(base64url_decode_value($payload64), true);
    if (!is_array($payload)) {
        return null;
    }
    if (isset($payload['exp']) && is_numeric($payload['exp']) && (int) $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}

function bearer_token(): ?string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? '';
    if ($header === '') {
        return null;
    }
    if (preg_match('/Bearer\s+(.+)/i', $header, $matches) !== 1) {
        return null;
    }
    $token = trim($matches[1]);
    return $token !== '' ? $token : null;
}

function optional_auth_context(string $jwtSecret): ?array {
    $token = bearer_token();
    if ($token === null) {
        return null;
    }

    $payload = jwt_decode($token, $jwtSecret);
    return is_array($payload) ? $payload : null;
}

function required_auth_context(string $jwtSecret): array {
    $token = bearer_token();
    if ($token === null) {
        send_error(401, 'Authorization token is required');
    }

    $payload = jwt_decode($token, $jwtSecret);
    if (!is_array($payload)) {
        send_error(401, 'Invalid or expired token');
    }

    return $payload;
}

function sanitize_admin(array $row): ?array {
    if (!$row) {
        return null;
    }
    unset($row['password_hash']);
    if (isset($row['id'])) {
        $row['id'] = (int) $row['id'];
    }
    if (isset($row['is_active'])) {
        $row['is_active'] = (int) $row['is_active'];
    }
    return $row;
}

function client_ip(): string {
    return trim((string) ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'));
}

function rate_limit_allow(string $bucket, int $limit, int $windowSeconds): bool {
    $path = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'vital_home_solutions_' . md5($bucket) . '.json';
    $now = time();
    $fp = fopen($path, 'c+');
    if ($fp === false) {
        return true;
    }

    flock($fp, LOCK_EX);
    $contents = stream_get_contents($fp);
    $state = ['hits' => []];
    if (is_string($contents) && trim($contents) !== '') {
        $decoded = json_decode($contents, true);
        if (is_array($decoded) && isset($decoded['hits']) && is_array($decoded['hits'])) {
            $state = $decoded;
        }
    }

    $state['hits'] = array_values(array_filter($state['hits'], static function ($timestamp) use ($now, $windowSeconds) {
        return is_numeric($timestamp) && ((int) $timestamp) >= ($now - $windowSeconds);
    }));

    if (count($state['hits']) >= $limit) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode_safe($state));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return false;
    }

    $state['hits'][] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode_safe($state));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

function allowed_origins(): array {
    $config = app_config();
    if ($config['frontend_origin'] === '*') {
        return ['*'];
    }

    $values = array_filter(array_map('trim', explode(',', (string) $config['frontend_origin'])));
    return array_values($values);
}

function apply_cors_headers(): void {
    $originHeader = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = allowed_origins();
    $allowAny = count($allowedOrigins) === 1 && $allowedOrigins[0] === '*';
    $allowOrigin = null;

    if ($allowAny) {
        if ($originHeader !== '') {
            $allowOrigin = $originHeader;
        }
    } elseif ($originHeader !== '' && in_array($originHeader, $allowedOrigins, true)) {
        $allowOrigin = $originHeader;
    }

    if ($allowOrigin !== null) {
        header('Access-Control-Allow-Origin: ' . $allowOrigin);
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, Accept, Origin');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}

function apply_security_headers(): void {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}

function load_seed_data(): array {
    static $data = null;
    if ($data !== null) {
        return $data;
    }

    $path = BACKEND_ROOT . DIRECTORY_SEPARATOR . 'seed-data.json';
    $json = file_get_contents($path);
    if ($json === false) {
        throw new RuntimeException('Seed data file is missing');
    }

    $decoded = json_decode($json, true);
    if (!is_array($decoded)) {
        throw new RuntimeException('Seed data file is invalid');
    }

    $data = $decoded;
    return $data;
}

function create_connection(bool $withDatabase = true): PDO {
    $config = app_config();
    $dsn = 'mysql:host=' . $config['db_host'] . ';charset=utf8mb4';
    if ($withDatabase) {
        $dsn .= ';dbname=' . $config['db_name'];
    }

    return new PDO($dsn, $config['db_user'], $config['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

function bootstrap_database(): void {
    static $bootstrapped = false;
    if ($bootstrapped) {
        return;
    }

    $config = app_config();
    $pdo = create_connection(false);
    $database = str_replace('`', '``', (string) $config['db_name']);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $bootstrapped = true;
}

function get_pdo(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    bootstrap_database();
    $pdo = create_connection(true);
    return $pdo;
}

function db_query(PDO $pdo, string $sql, array $params = []): array {
    $statement = $pdo->prepare($sql);
    $statement->execute($params);
    return $statement->fetchAll();
}

function db_exec(PDO $pdo, string $sql, array $params = []): PDOStatement {
    $statement = $pdo->prepare($sql);
    $statement->execute($params);
    return $statement;
}

function db_scalar(PDO $pdo, string $sql, array $params = []) {
    $rows = db_query($pdo, $sql, $params);
    if (!$rows) {
        return null;
    }
    $first = $rows[0];
    return is_array($first) ? (array_values($first)[0] ?? null) : null;
}

function ensure_schema(PDO $pdo): void {
    $schemaPath = APP_ROOT . DIRECTORY_SEPARATOR . 'database-schema.sql';
    $sql = file_get_contents($schemaPath);
    if ($sql === false) {
        throw new RuntimeException('database-schema.sql is missing');
    }

    $statements = preg_split('/;\s*(?:\r?\n|$)/', $sql) ?: [];
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if ($statement === '') {
            continue;
        }
        if (stripos($statement, 'CREATE TABLE') === 0) {
            $pdo->exec($statement);
        }
    }
}

function seed_if_empty(PDO $pdo, string $tableName, array $rows, array $columns): void {
    $count = db_scalar($pdo, "SELECT COUNT(*) AS count FROM `{$tableName}`");
    if ((int) $count > 0 || !$rows) {
        return;
    }

    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
    $sql = "INSERT INTO `{$tableName}` (" . implode(', ', $columns) . ") VALUES ({$placeholders})";
    foreach ($rows as $row) {
        $values = [];
        foreach ($columns as $column) {
            $values[] = $row[$column] ?? null;
        }
        db_exec($pdo, $sql, $values);
    }
}

function seed_admins(PDO $pdo): void {
    $seed = load_seed_data();
    $admin = $seed['defaultAdmin'] ?? null;
    if (!is_array($admin)) {
        return;
    }

    $hash = password_hash((string) ($admin['password'] ?? ''), PASSWORD_BCRYPT);
    $matched = db_query(
        $pdo,
        "SELECT id FROM admins WHERE username IN (?, ?) ORDER BY CASE WHEN username = ? THEN 0 ELSE 1 END, id ASC LIMIT 1",
        [
            $admin['username'] ?? '',
            'admin',
            $admin['username'] ?? '',
        ]
    );

    if ($matched) {
        db_exec(
            $pdo,
            "UPDATE admins SET name = ?, username = ?, password_hash = ?, role = ?, is_active = 1 WHERE id = ?",
            [
                $admin['name'] ?? '',
                $admin['username'] ?? '',
                $hash,
                $admin['role'] ?? 'admin',
                $matched[0]['id'],
            ]
        );
        return;
    }

    $fallback = db_query(
        $pdo,
        "SELECT id FROM admins ORDER BY CASE WHEN role = 'super_admin' THEN 0 ELSE 1 END, id ASC LIMIT 1"
    );

    if ($fallback) {
        db_exec(
            $pdo,
            "UPDATE admins SET name = ?, username = ?, password_hash = ?, role = ?, is_active = 1 WHERE id = ?",
            [
                $admin['name'] ?? '',
                $admin['username'] ?? '',
                $hash,
                $admin['role'] ?? 'admin',
                $fallback[0]['id'],
            ]
        );
        return;
    }

    db_exec(
        $pdo,
        "INSERT INTO admins (name, username, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)",
        [
            $admin['name'] ?? '',
            $admin['username'] ?? '',
            $hash,
            $admin['role'] ?? 'admin',
        ]
    );
}

function seed_products_bundle(PDO $pdo): void {
    $seed = load_seed_data();
    $products = $seed['products'] ?? [];
    if (!is_array($products) || !$products) {
        return;
    }

    $count = db_scalar($pdo, "SELECT COUNT(*) AS count FROM products");
    if ((int) $count > 0) {
        return;
    }

    $categoryMap = [];
    foreach (db_query($pdo, "SELECT id, slug FROM categories") as $row) {
        $categoryMap[(string) $row['slug']] = (int) $row['id'];
    }

    foreach ($products as $product) {
        $insert = db_exec(
            $pdo,
            "INSERT INTO products
            (name, slug, category_id, rent_price, buy_price, rent_unit, price_type, image, description,
             benefits_json, specifications_json, features_json, related_products_json, is_top_selling, display_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $product['name'] ?? '',
                $product['slug'] ?? '',
                isset($product['category_slug']) ? ($categoryMap[(string) $product['category_slug']] ?? null) : null,
                $product['rent_price'] ?? null,
                $product['buy_price'] ?? null,
                $product['rent_unit'] ?? 'month',
                $product['price_type'] ?? 'both',
                $product['image'] ?? null,
                $product['description'] ?? '',
                json_encode_safe($product['benefits'] ?? []),
                json_encode_safe($product['specifications'] ?? []),
                json_encode_safe($product['features'] ?? []),
                json_encode_safe([]),
                !empty($product['is_top_selling']) ? 1 : 0,
                $product['display_order'] ?? 0,
                !empty($product['is_active']) ? 1 : 0,
            ]
        );

        $productId = (int) $pdo->lastInsertId();
        db_exec(
            $pdo,
            "INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_active) VALUES (?, ?, ?, ?, ?)",
            [
                $productId,
                $product['image'] ?? '',
                $product['name'] ?? '',
                1,
                1,
            ]
        );

        $displayOrder = 1;
        foreach (($product['features'] ?? []) as $feature) {
            db_exec(
                $pdo,
                "INSERT INTO product_features (product_id, title, description, display_order, is_active) VALUES (?, ?, ?, ?, ?)",
                [
                    $productId,
                    $feature,
                    null,
                    $displayOrder++,
                    1,
                ]
            );
        }

        $displayOrder = 1;
        foreach (($product['specifications'] ?? []) as $spec) {
            db_exec(
                $pdo,
                "INSERT INTO product_specifications (product_id, label, value, display_order, is_active) VALUES (?, ?, ?, ?, ?)",
                [
                    $productId,
                    $spec,
                    null,
                    $displayOrder++,
                    1,
                ]
            );
        }
    }
}

function initialize_database(): PDO {
    $pdo = get_pdo();
    ensure_schema($pdo);
    seed_admins($pdo);

    $seed = load_seed_data();

    if (isset($seed['categories']) && is_array($seed['categories'])) {
        seed_if_empty($pdo, 'categories', $seed['categories'], [
            'name',
            'slug',
            'icon',
            'image',
            'display_order',
            'is_active',
        ]);
    }

    if (isset($seed['services']) && is_array($seed['services'])) {
        $serviceRows = [];
        foreach ($seed['services'] as $service) {
            $service['features_json'] = json_encode_safe($service['features'] ?? []);
            $serviceRows[] = $service;
        }
        seed_if_empty($pdo, 'services', $serviceRows, [
            'title',
            'slug',
            'short_description',
            'full_description',
            'image',
            'icon',
            'features_json',
            'display_order',
            'is_active',
        ]);
    }

    seed_products_bundle($pdo);

    if (isset($seed['gallery']) && is_array($seed['gallery'])) {
        seed_if_empty($pdo, 'gallery', $seed['gallery'], [
            'title',
            'category',
            'image_url',
            'alt_text',
            'display_order',
            'is_active',
        ]);
    }

    if (isset($seed['testimonials']) && is_array($seed['testimonials'])) {
        seed_if_empty($pdo, 'testimonials', $seed['testimonials'], [
            'client_name',
            'client_photo',
            'review_text',
            'rating',
            'location',
            'display_order',
            'is_active',
        ]);
    }

    if (isset($seed['contactSettings']) && is_array($seed['contactSettings'])) {
        $contactSeed = $seed['contactSettings'];
        $contactSeed['social_links_json'] = $contactSeed['social_links'] ?? '{}';
        seed_if_empty($pdo, 'contact_settings', [$contactSeed], [
            'phone',
            'whatsapp',
            'email',
            'address',
            'map_iframe',
            'business_hours',
            'social_links_json',
        ]);
    }

    if (isset($seed['blogs']) && is_array($seed['blogs'])) {
        seed_if_empty($pdo, 'blogs', $seed['blogs'], [
            'title',
            'slug',
            'image',
            'short_description',
            'content',
            'seo_title',
            'meta_description',
            'keywords',
            'published',
            'display_order',
        ]);
    }

    if (isset($seed['seoSettings']) && is_array($seed['seoSettings'])) {
        seed_if_empty($pdo, 'seo_settings', $seed['seoSettings'], [
            'page_name',
            'meta_title',
            'meta_description',
            'keywords',
            'og_image',
            'canonical_url',
        ]);
    }

    if (isset($seed['siteSettings']) && is_array($seed['siteSettings'])) {
        seed_if_empty($pdo, 'site_settings', $seed['siteSettings'], [
            'setting_key',
            'setting_value',
        ]);
    }

    if (isset($seed['homeSections']) && is_array($seed['homeSections'])) {
        seed_if_empty($pdo, 'home_sections', $seed['homeSections'], [
            'section_key',
            'section_label',
            'content_json',
            'is_active',
        ]);
    }

    if (isset($seed['aboutSections']) && is_array($seed['aboutSections'])) {
        seed_if_empty($pdo, 'about_sections', $seed['aboutSections'], [
            'section_key',
            'section_label',
            'content_json',
            'is_active',
        ]);
    }

    return $pdo;
}

function get_admin_by_username(PDO $pdo, string $username): ?array {
    $rows = db_query($pdo, "SELECT * FROM admins WHERE username = ? LIMIT 1", [$username]);
    return $rows[0] ?? null;
}

function get_admin_by_id(PDO $pdo, $id): ?array {
    $rows = db_query($pdo, "SELECT * FROM admins WHERE id = ? LIMIT 1", [$id]);
    return $rows[0] ?? null;
}

function load_site_settings(PDO $pdo): array {
    $rows = db_query($pdo, "SELECT setting_key, setting_value FROM site_settings ORDER BY setting_key ASC");
    $result = [];
    foreach ($rows as $row) {
        $result[$row['setting_key']] = parse_json_value($row['setting_value'], $row['setting_value']);
    }
    return $result;
}

function upsert_setting(PDO $pdo, string $settingKey, $settingValue): void {
    db_exec(
        $pdo,
        "INSERT INTO site_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        [
            $settingKey,
            is_string($settingValue) ? $settingValue : json_encode_safe($settingValue),
        ]
    );
}

function load_contact_settings(PDO $pdo): array {
    $rows = db_query($pdo, "SELECT * FROM contact_settings ORDER BY id ASC LIMIT 1");
    $row = $rows[0] ?? [];
    return [
        'id' => isset($row['id']) ? (int) $row['id'] : null,
        'phone' => $row['phone'] ?? '',
        'whatsapp' => $row['whatsapp'] ?? '',
        'email' => $row['email'] ?? '',
        'address' => $row['address'] ?? '',
        'map_iframe' => $row['map_iframe'] ?? '',
        'business_hours' => $row['business_hours'] ?? '',
        'social_links' => parse_json_value($row['social_links_json'] ?? null, [
            'facebook' => '',
            'instagram' => '',
            'linkedin' => '',
            'youtube' => '',
        ]),
        'updated_at' => $row['updated_at'] ?? null,
    ];
}

function save_contact_settings(PDO $pdo, array $payload): int {
    $rows = db_query($pdo, "SELECT id FROM contact_settings ORDER BY id ASC LIMIT 1");
    $row = $rows[0] ?? null;
    $values = [
        $payload['phone'] ?? '',
        $payload['whatsapp'] ?? '',
        $payload['email'] ?? '',
        $payload['address'] ?? '',
        $payload['map_iframe'] ?? '',
        $payload['business_hours'] ?? '',
        json_encode_safe($payload['social_links'] ?? []),
    ];

    if ($row) {
        db_exec(
            $pdo,
            "UPDATE contact_settings
             SET phone = ?, whatsapp = ?, email = ?, address = ?, map_iframe = ?, business_hours = ?, social_links_json = ?
             WHERE id = ?",
            array_merge($values, [$row['id']])
        );
        return (int) $row['id'];
    }

    db_exec(
        $pdo,
        "INSERT INTO contact_settings (phone, whatsapp, email, address, map_iframe, business_hours, social_links_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
        $values
    );
    return (int) $pdo->lastInsertId();
}

function upsert_section(PDO $pdo, string $tableName, string $sectionKey, string $sectionLabel, $content, $isActive = 1): void {
    db_exec(
        $pdo,
        "INSERT INTO {$tableName} (section_key, section_label, content_json, is_active)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE section_label = VALUES(section_label), content_json = VALUES(content_json), is_active = VALUES(is_active)",
        [
            $sectionKey,
            $sectionLabel,
            json_encode_safe($content),
            to_boolean($isActive, true) ? 1 : 0,
        ]
    );
}

function build_categories(PDO $pdo, bool $includeInactive = false): array {
    $rows = db_query($pdo, "SELECT * FROM categories ORDER BY display_order ASC, id ASC");
    $counts = db_query($pdo, "SELECT category_id, COUNT(*) AS count FROM products WHERE is_active = 1 GROUP BY category_id");
    $countMap = [];
    foreach ($counts as $row) {
        $countMap[(string) $row['category_id']] = (int) $row['count'];
    }

    $items = [];
    foreach ($rows as $row) {
        if (!$includeInactive && (int) ($row['is_active'] ?? 0) !== 1) {
            continue;
        }
        $items[] = [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'icon' => $row['icon'],
            'image' => $row['image'],
            'display_order' => (int) $row['display_order'],
            'is_active' => (int) $row['is_active'],
            'count' => $countMap[(string) $row['id']] ?? 0,
        ];
    }
    return $items;
}

function build_services(PDO $pdo, bool $includeInactive = false): array {
    $rows = db_query($pdo, "SELECT * FROM services ORDER BY display_order ASC, id ASC");
    $items = [];
    foreach ($rows as $row) {
        if (!$includeInactive && (int) ($row['is_active'] ?? 0) !== 1) {
            continue;
        }
        $items[] = [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'slug' => $row['slug'],
            'short_description' => $row['short_description'] ?? '',
            'full_description' => $row['full_description'] ?? '',
            'image' => $row['image'] ?? '',
            'icon' => $row['icon'] ?? '',
            'features' => parse_array_value($row['features_json'] ?? null, []),
            'display_order' => (int) $row['display_order'],
            'is_active' => (int) $row['is_active'],
        ];
    }
    return $items;
}

function products_with_related(PDO $pdo, array $ids): array {
    if (!$ids) {
        return [[], [], []];
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $imagesRows = db_query($pdo, "SELECT * FROM product_images WHERE product_id IN ({$placeholders}) ORDER BY display_order ASC, id ASC", $ids);
    $featureRows = db_query($pdo, "SELECT * FROM product_features WHERE product_id IN ({$placeholders}) ORDER BY display_order ASC, id ASC", $ids);
    $specRows = db_query($pdo, "SELECT * FROM product_specifications WHERE product_id IN ({$placeholders}) ORDER BY display_order ASC, id ASC", $ids);
    return [$imagesRows, $featureRows, $specRows];
}

function build_products(PDO $pdo, bool $includeInactive = false, array $filters = []): array {
    $rows = db_query(
        $pdo,
        "SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         ORDER BY p.display_order ASC, p.id DESC"
    );

    $filtered = $rows;
    if (!$includeInactive) {
        $filtered = array_values(array_filter($filtered, static function ($row) {
            return (int) ($row['is_active'] ?? 0) === 1;
        }));
    }

    if (!empty($filters['topSellingOnly'])) {
        $filtered = array_values(array_filter($filtered, static function ($row) {
            return (int) ($row['is_top_selling'] ?? 0) === 1;
        }));
    }

    if (isset($filters['search']) && trim((string) $filters['search']) !== '') {
        $search = strtolower(trim((string) $filters['search']));
        $filtered = array_values(array_filter($filtered, static function ($row) use ($search) {
            foreach ([
                $row['name'] ?? '',
                $row['slug'] ?? '',
                $row['category_name'] ?? '',
                $row['category_slug'] ?? '',
            ] as $value) {
                if (strpos(strtolower((string) $value), $search) !== false) {
                    return true;
                }
            }
            return false;
        }));
    }

    if (isset($filters['category']) && trim((string) $filters['category']) !== '') {
        $categoryFilter = trim((string) $filters['category']);
        $filtered = array_values(array_filter($filtered, static function ($row) use ($categoryFilter) {
            return (string) ($row['category_slug'] ?? '') === $categoryFilter || (string) ($row['category_id'] ?? '') === $categoryFilter;
        }));
    }

    $ids = array_values(array_map(static function ($row) {
        return (int) $row['id'];
    }, $filtered));

    [$imagesRows, $featureRows, $specRows] = products_with_related($pdo, $ids);

    $imagesMap = [];
    foreach ($imagesRows as $row) {
        $productId = (int) $row['product_id'];
        if (!isset($imagesMap[$productId])) {
            $imagesMap[$productId] = [];
        }
        $imagesMap[$productId][] = [
            'id' => (int) $row['id'],
            'image_url' => $row['image_url'],
            'alt_text' => $row['alt_text'],
            'display_order' => (int) $row['display_order'],
            'is_active' => (int) $row['is_active'],
        ];
    }

    $featureMap = [];
    foreach ($featureRows as $row) {
        $productId = (int) $row['product_id'];
        if (!isset($featureMap[$productId])) {
            $featureMap[$productId] = [];
        }
        $featureMap[$productId][] = [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'display_order' => (int) $row['display_order'],
            'is_active' => (int) $row['is_active'],
        ];
    }

    $specMap = [];
    foreach ($specRows as $row) {
        $productId = (int) $row['product_id'];
        if (!isset($specMap[$productId])) {
            $specMap[$productId] = [];
        }
        $specMap[$productId][] = [
            'id' => (int) $row['id'],
            'label' => $row['label'],
            'value' => $row['value'],
            'display_order' => (int) $row['display_order'],
            'is_active' => (int) $row['is_active'],
        ];
    }

    $items = [];
    foreach ($filtered as $row) {
        $productId = (int) $row['id'];
        $images = $imagesMap[$productId] ?? [];
        $features = $featureMap[$productId] ?? [];
        $specs = $specMap[$productId] ?? [];
        $items[] = [
            'id' => $productId,
            'slug' => $row['slug'],
            'name' => $row['name'],
            'category_id' => $row['category_id'],
            'category' => $row['category_slug'] ?? '',
            'category_name' => $row['category_name'] ?? '',
            'category_icon' => $row['category_icon'] ?? '',
            'rent_price' => (float) ($row['rent_price'] ?? 0),
            'buy_price' => (float) ($row['buy_price'] ?? 0),
            'rent_unit' => $row['rent_unit'] ?? 'month',
            'price_type' => $row['price_type'] ?? 'both',
            'image' => $row['image'] ?? '',
            'images' => array_values(array_map(static function ($item) {
                return $item['image_url'];
            }, $images)),
            'description' => $row['description'] ?? '',
            'benefits' => parse_array_value($row['benefits_json'] ?? null, []),
            'specifications' => parse_array_value($row['specifications_json'] ?? null, []),
            'features' => parse_array_value($row['features_json'] ?? null, []),
            'related_products' => parse_array_value($row['related_products_json'] ?? null, []),
            'product_images' => $images,
            'product_features' => $features,
            'product_specifications' => $specs,
            'is_top_selling' => (int) ($row['is_top_selling'] ?? 0) === 1,
            'display_order' => (int) ($row['display_order'] ?? 0),
            'available' => (int) ($row['is_active'] ?? 0) === 1,
            'is_active' => (int) ($row['is_active'] ?? 0),
        ];
    }

    return $items;
}

function find_row_by_identifier(PDO $pdo, string $tableName, $identifier): ?array {
    $normalized = normalize_identifier($identifier);
    if ($normalized === '') {
        return null;
    }

    if (is_numeric_identifier($normalized)) {
        $rows = db_query($pdo, "SELECT * FROM {$tableName} WHERE id = ? LIMIT 1", [(int) $normalized]);
        if ($rows) {
            return $rows[0];
        }
    }

    $rows = db_query($pdo, "SELECT * FROM {$tableName} WHERE slug = ? LIMIT 1", [$normalized]);
    return $rows[0] ?? null;
}

function delete_row_by_identifier(PDO $pdo, string $tableName, $identifier): array {
    $normalized = normalize_identifier($identifier);
    if ($normalized === '') {
        return ['affectedRows' => 0];
    }

    if (is_numeric_identifier($normalized)) {
        $statement = db_exec($pdo, "DELETE FROM {$tableName} WHERE id = ?", [(int) $normalized]);
        if ($statement->rowCount() > 0) {
            return ['affectedRows' => $statement->rowCount()];
        }
    }

    $statement = db_exec($pdo, "DELETE FROM {$tableName} WHERE slug = ?", [$normalized]);
    return ['affectedRows' => $statement->rowCount()];
}

function find_product_by_identifier(PDO $pdo, $identifier): ?array {
    $normalized = normalize_identifier($identifier);
    if ($normalized === '') {
        return null;
    }

    if (is_numeric_identifier($normalized)) {
        $rows = db_query(
            $pdo,
            "SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.id = ?
             LIMIT 1",
            [(int) $normalized]
        );
        if ($rows) {
            return $rows[0];
        }
    }

    $rows = db_query(
        $pdo,
        "SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.slug = ?
         LIMIT 1",
        [$normalized]
    );

    return $rows[0] ?? null;
}

function find_category_id_by_identifier(PDO $pdo, $identifier): ?int {
    $normalized = normalize_identifier($identifier);
    if ($normalized === '') {
        return null;
    }

    if (is_numeric_identifier($normalized)) {
        $rows = db_query($pdo, "SELECT id FROM categories WHERE id = ? LIMIT 1", [(int) $normalized]);
        if ($rows) {
            return (int) $rows[0]['id'];
        }
    }

    $rows = db_query($pdo, "SELECT id FROM categories WHERE slug = ? LIMIT 1", [$normalized]);
    return $rows[0]['id'] ?? null;
}

function build_testimonials(PDO $pdo, bool $includeInactive = false): array {
    $rows = db_query($pdo, "SELECT * FROM testimonials ORDER BY display_order ASC, id ASC");
    $items = [];
    foreach ($rows as $row) {
        if (!$includeInactive && (int) ($row['is_active'] ?? 0) !== 1) {
            continue;
        }
        $items[] = [
            'id' => (int) $row['id'],
            'client_name' => $row['client_name'],
            'client_photo' => $row['client_photo'] ?? '',
            'review_text' => $row['review_text'] ?? '',
            'rating' => (int) ($row['rating'] ?? 5),
            'location' => $row['location'] ?? '',
            'display_order' => (int) $row['display_order'],
            'is_active' => (int) $row['is_active'],
        ];
    }
    return $items;
}

function build_gallery(PDO $pdo, bool $includeInactive = false): array {
    $rows = db_query($pdo, "SELECT * FROM gallery ORDER BY display_order ASC, id ASC");
    $items = [];
    foreach ($rows as $row) {
        if (!$includeInactive && (int) ($row['is_active'] ?? 0) !== 1) {
            continue;
        }
        $items[] = [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'category' => $row['category'] ?? '',
            'image_url' => $row['image_url'] ?? '',
            'alt_text' => $row['alt_text'] ?? '',
            'display_order' => (int) $row['display_order'],
            'is_active' => (int) $row['is_active'],
        ];
    }
    return $items;
}

function build_blogs(PDO $pdo, bool $includeInactive = false): array {
    $rows = db_query($pdo, "SELECT * FROM blogs ORDER BY display_order ASC, published_at DESC, id DESC");
    $items = [];
    foreach ($rows as $row) {
        if (!$includeInactive && (int) ($row['published'] ?? 0) !== 1) {
            continue;
        }
        $items[] = [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'slug' => $row['slug'],
            'image' => $row['image'] ?? '',
            'short_description' => $row['short_description'] ?? '',
            'content' => $row['content'] ?? '',
            'seo_title' => $row['seo_title'] ?? '',
            'meta_description' => $row['meta_description'] ?? '',
            'keywords' => $row['keywords'] ?? '',
            'published' => (int) ($row['published'] ?? 0) === 1,
            'published_at' => $row['published_at'] ?? null,
            'display_order' => (int) $row['display_order'],
        ];
    }
    return $items;
}

function build_seo(PDO $pdo, ?string $pageName = null): ?array {
    $rows = db_query($pdo, "SELECT * FROM seo_settings ORDER BY page_name ASC, id ASC");
    $items = [];
    foreach ($rows as $row) {
        $items[] = [
            'id' => (int) $row['id'],
            'page_name' => $row['page_name'],
            'meta_title' => $row['meta_title'] ?? '',
            'meta_description' => $row['meta_description'] ?? '',
            'keywords' => $row['keywords'] ?? '',
            'og_image' => $row['og_image'] ?? '',
            'canonical_url' => $row['canonical_url'] ?? '',
        ];
    }

    if ($pageName === null || $pageName === '') {
        return $items;
    }

    foreach ($items as $item) {
        if ($item['page_name'] === $pageName) {
            return $item;
        }
    }

    return null;
}

function build_home_content(PDO $pdo, bool $includeInactive = false): array {
    $rows = db_query($pdo, "SELECT * FROM home_sections ORDER BY id ASC");
    $sections = [];
    foreach ($rows as $row) {
        if (!$includeInactive && (int) ($row['is_active'] ?? 0) !== 1) {
            continue;
        }
        $sections[$row['section_key']] = [
            'id' => (int) $row['id'],
            'section_key' => $row['section_key'],
            'section_label' => $row['section_label'],
            'content' => parse_json_value($row['content_json'] ?? null, null),
            'is_active' => (int) $row['is_active'],
            'updated_at' => $row['updated_at'] ?? null,
        ];
    }

    return [
        'heroSlides' => $sections['hero_slides']['content'] ?? [],
        'trustHighlights' => $sections['trust_highlights']['content'] ?? [],
        'clientLogos' => $sections['client_logos']['content'] ?? [],
        'homeImages' => $sections['home_images']['content'] ?? [],
        'seo' => $sections['seo']['content'] ?? null,
        'sections' => $sections,
    ];
}

function build_about_content(PDO $pdo, bool $includeInactive = false): array {
    $rows = db_query($pdo, "SELECT * FROM about_sections ORDER BY id ASC");
    $sections = [];
    foreach ($rows as $row) {
        if (!$includeInactive && (int) ($row['is_active'] ?? 0) !== 1) {
            continue;
        }
        $sections[$row['section_key']] = [
            'id' => (int) $row['id'],
            'section_key' => $row['section_key'],
            'section_label' => $row['section_label'],
            'content' => parse_json_value($row['content_json'] ?? null, null),
            'is_active' => (int) $row['is_active'],
            'updated_at' => $row['updated_at'] ?? null,
        ];
    }

    return [
        'hero' => $sections['hero']['content'] ?? null,
        'overview' => $sections['overview']['content'] ?? null,
        'mission' => $sections['mission']['content'] ?? null,
        'vision' => $sections['vision']['content'] ?? null,
        'values' => $sections['values']['content'] ?? [],
        'counters' => $sections['counters']['content'] ?? [],
        'process' => $sections['process']['content'] ?? [],
        'seo' => $sections['seo']['content'] ?? null,
        'sections' => $sections,
    ];
}

function save_product_relations(PDO $pdo, int $productId, array $payload, ?array $current = null): void {
    $imagePayload = array_key_exists('images', $payload) || array_key_exists('product_images', $payload)
        ? parse_array_value($payload['images'] ?? $payload['product_images'] ?? [], [])
        : (($current['images'] ?? []) ?: []);
    $featurePayload = array_key_exists('features', $payload) || array_key_exists('product_features', $payload)
        ? parse_array_value($payload['features'] ?? $payload['product_features'] ?? [], [])
        : (($current['features'] ?? []) ?: []);
    $specPayload = array_key_exists('specifications', $payload) || array_key_exists('product_specifications', $payload)
        ? parse_array_value($payload['specifications'] ?? $payload['product_specifications'] ?? [], [])
        : (($current['specifications'] ?? []) ?: []);
    $relatedPayload = array_key_exists('related_products', $payload)
        ? parse_array_value($payload['related_products'] ?? [], [])
        : (($current['related_products'] ?? []) ?: []);
    $benefitPayload = array_key_exists('benefits', $payload)
        ? parse_array_value($payload['benefits'] ?? [], [])
        : (($current['benefits'] ?? []) ?: []);

    db_exec($pdo, "DELETE FROM product_images WHERE product_id = ?", [$productId]);
    db_exec($pdo, "DELETE FROM product_features WHERE product_id = ?", [$productId]);
    db_exec($pdo, "DELETE FROM product_specifications WHERE product_id = ?", [$productId]);

    $order = 1;
    $imageCandidates = $imagePayload ?: array_values(array_filter([
        $payload['image'] ?? null,
        $payload['image1'] ?? null,
        $payload['image2'] ?? null,
        $payload['image3'] ?? null,
        $current['image'] ?? null,
    ], static function ($item) {
        return $item !== null && $item !== '';
    }));
    foreach ($imageCandidates as $image) {
        db_exec(
            $pdo,
            "INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_active) VALUES (?, ?, ?, ?, 1)",
            [
                $productId,
                $image,
                $payload['name'] ?? $payload['title'] ?? 'Product',
                $order++,
            ]
        );
    }

    $order = 1;
    foreach ($featurePayload as $feature) {
        $featureValue = is_array($feature) ? ($feature['title'] ?? $feature['name'] ?? '') : (string) $feature;
        $featureDescription = is_array($feature) ? ($feature['description'] ?? '') : '';
        if ($featureValue === '') {
            continue;
        }
        db_exec(
            $pdo,
            "INSERT INTO product_features (product_id, title, description, display_order, is_active) VALUES (?, ?, ?, ?, 1)",
            [
                $productId,
                $featureValue,
                $featureDescription,
                $order++,
            ]
        );
    }

    $order = 1;
    foreach ($specPayload as $spec) {
        if (is_string($spec)) {
            $parts = explode(':', $spec, 2);
            db_exec(
                $pdo,
                "INSERT INTO product_specifications (product_id, label, value, display_order, is_active) VALUES (?, ?, ?, ?, 1)",
                [
                    $productId,
                    trim($parts[0]),
                    isset($parts[1]) ? trim($parts[1]) : null,
                    $order++,
                ]
            );
            continue;
        }

        $label = is_array($spec) ? ($spec['label'] ?? $spec['title'] ?? $spec['name'] ?? '') : '';
        if ($label === '') {
            continue;
        }
        db_exec(
            $pdo,
            "INSERT INTO product_specifications (product_id, label, value, display_order, is_active) VALUES (?, ?, ?, ?, 1)",
            [
                $productId,
                $label,
                is_array($spec) ? ($spec['value'] ?? $spec['description'] ?? null) : null,
                $order++,
            ]
        );
    }

    db_exec(
        $pdo,
        "UPDATE products SET benefits_json = ?, related_products_json = ? WHERE id = ?",
        [
            json_encode_safe($benefitPayload),
            json_encode_safe($relatedPayload),
            $productId,
        ]
    );
}

function upsert_product(PDO $pdo, array $payload, ?int $existingId = null): int {
    $currentRow = null;
    $currentProduct = null;

    if ($existingId !== null) {
        $rows = db_query($pdo, "SELECT * FROM products WHERE id = ? LIMIT 1", [$existingId]);
        $currentRow = $rows[0] ?? null;
        if ($currentRow) {
            $currentProductRows = build_products($pdo, true, ['search' => $currentRow['slug']]);
            $currentProduct = $currentProductRows[0] ?? null;
        }
    }

    $name = trim((string) ($payload['name'] ?? $currentRow['name'] ?? ''));
    if ($name === '') {
        throw new RuntimeException('Product name is required');
    }

    $slug = trim((string) ($payload['slug'] ?? ''));
    if ($slug === '') {
        $slug = $currentRow['slug'] ?? slugify($name);
    }

    $categoryIdentifier = $payload['category_id'] ?? $payload['category'] ?? $currentRow['category_id'] ?? $currentRow['category_slug'] ?? null;
    $categoryId = $categoryIdentifier !== null ? find_category_id_by_identifier($pdo, $categoryIdentifier) : null;

    $resolvedImage = $payload['image'] ?? $payload['image1'] ?? $currentRow['image'] ?? null;
    $benefitsSource = array_key_exists('benefits', $payload) ? $payload['benefits'] : ($currentProduct['benefits'] ?? parse_array_value($currentRow['benefits_json'] ?? null, []));
    $specificationsSource = array_key_exists('specifications', $payload) ? $payload['specifications'] : ($currentProduct['specifications'] ?? parse_array_value($currentRow['specifications_json'] ?? null, []));
    $featuresSource = array_key_exists('features', $payload) ? $payload['features'] : ($currentProduct['features'] ?? parse_array_value($currentRow['features_json'] ?? null, []));
    $relatedSource = array_key_exists('related_products', $payload) ? $payload['related_products'] : ($currentProduct['related_products'] ?? parse_array_value($currentRow['related_products_json'] ?? null, []));
    $rentPrice = $payload['rent_price'] ?? $currentRow['rent_price'] ?? null;
    $buyPrice = $payload['buy_price'] ?? $currentRow['buy_price'] ?? null;
    $rentUnit = $payload['rent_unit'] ?? $currentRow['rent_unit'] ?? 'month';
    $priceType = $payload['price_type'] ?? $currentRow['price_type'] ?? 'both';
    $displayOrder = array_key_exists('display_order', $payload) ? $payload['display_order'] : ($currentRow['display_order'] ?? 0);
    $isTopSelling = array_key_exists('is_top_selling', $payload) ? to_boolean($payload['is_top_selling'], false) : to_boolean($currentRow['is_top_selling'] ?? 0, false);
    $isActive = array_key_exists('is_active', $payload) ? to_boolean($payload['is_active'], true) : to_boolean($currentRow['is_active'] ?? 1, true);
    $description = array_key_exists('description', $payload) ? $payload['description'] : ($currentRow['description'] ?? '');

    $values = [
        $name,
        $slug,
        $categoryId,
        $rentPrice,
        $buyPrice,
        $rentUnit,
        $priceType,
        $resolvedImage,
        $description,
        json_encode_safe(parse_array_value($benefitsSource ?? [], [])),
        json_encode_safe(parse_array_value($specificationsSource ?? [], [])),
        json_encode_safe(parse_array_value($featuresSource ?? [], [])),
        json_encode_safe(parse_array_value($relatedSource ?? [], [])),
        $isTopSelling ? 1 : 0,
        to_number($displayOrder, 0),
        $isActive ? 1 : 0,
    ];

    if ($existingId !== null) {
        db_exec(
            $pdo,
            "UPDATE products
             SET name = ?, slug = ?, category_id = ?, rent_price = ?, buy_price = ?, rent_unit = ?, price_type = ?,
                 image = ?, description = ?, benefits_json = ?, specifications_json = ?, features_json = ?,
                 related_products_json = ?, is_top_selling = ?, display_order = ?, is_active = ?
             WHERE id = ?",
            array_merge($values, [$existingId])
        );
        save_product_relations($pdo, $existingId, $payload, $currentProduct ?: $currentRow);
        return $existingId;
    }

    db_exec(
        $pdo,
        "INSERT INTO products
         (name, slug, category_id, rent_price, buy_price, rent_unit, price_type, image, description,
          benefits_json, specifications_json, features_json, related_products_json, is_top_selling, display_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        $values
    );

    $productId = (int) $pdo->lastInsertId();
    save_product_relations($pdo, $productId, $payload, null);
    return $productId;
}

function resolve_product(array $productRow, PDO $pdo): ?array {
    if (!$productRow) {
        return null;
    }

    $products = build_products($pdo, true, ['search' => $productRow['slug'] ?? '']);
    if ($products) {
        return $products[0];
    }

    return [
        'id' => (int) $productRow['id'],
        'slug' => $productRow['slug'],
        'name' => $productRow['name'],
        'category_id' => $productRow['category_id'],
        'category' => $productRow['category_slug'] ?? '',
        'category_name' => $productRow['category_name'] ?? '',
        'category_icon' => $productRow['category_icon'] ?? '',
        'rent_price' => (float) ($productRow['rent_price'] ?? 0),
        'buy_price' => (float) ($productRow['buy_price'] ?? 0),
        'rent_unit' => $productRow['rent_unit'] ?? 'month',
        'price_type' => $productRow['price_type'] ?? 'both',
        'image' => $productRow['image'] ?? '',
        'images' => [],
        'description' => $productRow['description'] ?? '',
        'benefits' => parse_array_value($productRow['benefits_json'] ?? null, []),
        'specifications' => parse_array_value($productRow['specifications_json'] ?? null, []),
        'features' => parse_array_value($productRow['features_json'] ?? null, []),
        'related_products' => parse_array_value($productRow['related_products_json'] ?? null, []),
        'product_images' => [],
        'product_features' => [],
        'product_specifications' => [],
        'is_top_selling' => (int) ($productRow['is_top_selling'] ?? 0) === 1,
        'display_order' => (int) ($productRow['display_order'] ?? 0),
        'available' => (int) ($productRow['is_active'] ?? 0) === 1,
        'is_active' => (int) ($productRow['is_active'] ?? 0),
    ];
}

function parse_upload_file(array $file, ?string $fieldName = null): array {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException($fieldName ? "{$fieldName} upload failed" : 'File upload failed');
    }

    if (($file['size'] ?? 0) > 10 * 1024 * 1024) {
        throw new RuntimeException('File exceeds 10MB limit');
    }

    $tmpName = $file['tmp_name'] ?? '';
    if ($tmpName === '' || !is_uploaded_file($tmpName)) {
        throw new RuntimeException('File upload failed');
    }

    $allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
    ];
    $svgFallbackMimeTypes = [
        'text/plain',
        'application/xml',
        'text/xml',
    ];

    $detectedMime = null;
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo !== false) {
            $detectedMime = finfo_file($finfo, $tmpName) ?: null;
            finfo_close($finfo);
        }
    }

    $originalName = (string) ($file['name'] ?? 'upload');
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if ($detectedMime !== null && !in_array($detectedMime, $allowedMimeTypes, true)) {
        if ($extension !== 'svg' || !in_array($detectedMime, $svgFallbackMimeTypes, true)) {
            throw new RuntimeException('Only image uploads are allowed');
        }
    }

    if ($detectedMime === null && !in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'], true)) {
        throw new RuntimeException('Only image uploads are allowed');
    }

    $baseName = strtolower(pathinfo($originalName, PATHINFO_FILENAME));
    $baseName = preg_replace('/[^a-z0-9]+/', '-', $baseName) ?? '';
    $baseName = trim($baseName, '-');
    if ($baseName === '') {
        $baseName = 'upload';
    }

    $uploadsDir = APP_ROOT . DIRECTORY_SEPARATOR . 'uploads';
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0777, true);
    }

    $filename = (string) round(microtime(true) * 1000) . '-' . $baseName . ($extension !== '' ? '.' . $extension : '');
    $target = $uploadsDir . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($tmpName, $target)) {
        throw new RuntimeException('Unable to save uploaded file');
    }

    return [
        'filename' => $filename,
        'originalName' => $originalName,
        'url' => '/uploads/' . $filename,
    ];
}

function normalize_multiple_uploads(array $files): array {
    if (!isset($files['name'])) {
        return [];
    }

    if (!is_array($files['name'])) {
        return [[
            'name' => $files['name'] ?? '',
            'type' => $files['type'] ?? '',
            'tmp_name' => $files['tmp_name'] ?? '',
            'error' => $files['error'] ?? UPLOAD_ERR_NO_FILE,
            'size' => $files['size'] ?? 0,
        ]];
    }

    $normalized = [];
    $count = count($files['name'] ?? []);
    for ($i = 0; $i < $count; $i++) {
        $normalized[] = [
            'name' => $files['name'][$i] ?? '',
            'type' => $files['type'][$i] ?? '',
            'tmp_name' => $files['tmp_name'][$i] ?? '',
            'error' => $files['error'][$i] ?? UPLOAD_ERR_NO_FILE,
            'size' => $files['size'][$i] ?? 0,
        ];
    }
    return $normalized;
}

function handle_not_found(): void {
    send_error(404, 'Not found');
}

function handle_request(): void {
    apply_cors_headers();
    apply_security_headers();

    if (request_method() === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    try {
        $pdo = initialize_database();
        dispatch_request($pdo);
    } catch (Throwable $error) {
        error_log('API Error: ' . $error->getMessage());
        send_error(500, $error->getMessage() ?: 'Internal server error');
    }
}

function dispatch_request(PDO $pdo): void {
    $config = app_config();
    $jwtSecret = (string) $config['jwt_secret'];
    $method = request_method();
    $path = request_path();
    $body = request_body();
    $auth = optional_auth_context($jwtSecret);
    $bodyObject = parse_object_value($body, []);

    if ($method === 'GET' && $path === '/api/health') {
        send_success(null, 'API is healthy');
    }

    if ($method === 'POST' && $path === '/api/admin/login') {
        if (!rate_limit_allow('admin_login|' . client_ip(), 10, 15 * 60)) {
            send_error(429, 'Too many login attempts. Please try again later.');
        }

        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        if ($username === '' || $password === '') {
            send_error(400, 'Username and password are required');
        }

        $admin = get_admin_by_username($pdo, $username);
        if (!$admin || (int) ($admin['is_active'] ?? 0) !== 1) {
            send_error(401, 'Invalid credentials');
        }

        if (!password_verify($password, (string) $admin['password_hash'])) {
            send_error(401, 'Invalid credentials');
        }

        db_exec($pdo, 'UPDATE admins SET last_login_at = NOW() WHERE id = ?', [$admin['id']]);
        $token = jwt_encode([
            'id' => (int) $admin['id'],
            'username' => $admin['username'],
            'role' => $admin['role'],
            'name' => $admin['name'],
        ], $jwtSecret, 8 * 60 * 60);

        send_success([
            'token' => $token,
            'admin' => sanitize_admin($admin),
        ], 'Login successful');
    }

    if ($method === 'GET' && $path === '/api/admin/me') {
        $user = required_auth_context($jwtSecret);
        $admin = get_admin_by_id($pdo, $user['id']);
        if (!$admin) {
            send_error(404, 'Admin not found');
        }
        send_success(sanitize_admin($admin));
    }

    if ($method === 'POST' && $path === '/api/admin/logout') {
        required_auth_context($jwtSecret);
        send_success(null, 'Logged out');
    }

    if ($method === 'POST' && $path === '/api/admin/change-password') {
        $user = required_auth_context($jwtSecret);
        $currentPassword = (string) ($body['currentPassword'] ?? '');
        $newPassword = (string) ($body['newPassword'] ?? '');
        if ($currentPassword === '' || $newPassword === '') {
            send_error(400, 'Current password and new password are required');
        }
        if (strlen($newPassword) < 8) {
            send_error(400, 'New password must be at least 8 characters long');
        }
        $admin = get_admin_by_id($pdo, $user['id']);
        if (!$admin) {
            send_error(404, 'Admin not found');
        }
        if (!password_verify($currentPassword, (string) $admin['password_hash'])) {
            send_error(400, 'Current password is incorrect');
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        db_exec($pdo, 'UPDATE admins SET password_hash = ? WHERE id = ?', [$newHash, $admin['id']]);
        send_success(null, 'Password updated');
    }

    if ($method === 'GET' && $path === '/api/dashboard/stats') {
        required_auth_context($jwtSecret);
        $serviceCount = db_scalar($pdo, 'SELECT COUNT(*) AS count FROM services') ?? 0;
        $enquiryCount = db_scalar($pdo, 'SELECT COUNT(*) AS count FROM enquiries') ?? 0;
        $galleryCount = db_scalar($pdo, 'SELECT COUNT(*) AS count FROM gallery') ?? 0;
        $testimonialCount = db_scalar($pdo, 'SELECT COUNT(*) AS count FROM testimonials') ?? 0;
        $categoryCount = db_scalar($pdo, 'SELECT COUNT(*) AS count FROM categories') ?? 0;
        $productCount = db_scalar($pdo, 'SELECT COUNT(*) AS count FROM products') ?? 0;
        $blogCount = db_scalar($pdo, 'SELECT COUNT(*) AS count FROM blogs') ?? 0;
        $vendorCount = db_scalar($pdo, 'SELECT COUNT(*) AS count FROM vendors') ?? 0;
        $recentEnquiries = db_query(
            $pdo,
            'SELECT id, name, phone, email, service_interested, message, status, admin_notes, created_at
             FROM enquiries
             ORDER BY created_at DESC, id DESC
             LIMIT 5'
        );
        send_success([
            'totalServices' => (int) $serviceCount,
            'totalEnquiries' => (int) $enquiryCount,
            'totalGallery' => (int) $galleryCount,
            'totalTestimonials' => (int) $testimonialCount,
            'totalCategories' => (int) $categoryCount,
            'totalProducts' => (int) $productCount,
            'totalBlogs' => (int) $blogCount,
            'totalVendors' => (int) $vendorCount,
            'recentEnquiries' => $recentEnquiries,
        ]);
    }

    if ($method === 'GET' && $path === '/api/site-settings') {
        send_success(load_site_settings($pdo));
    }

    if ($method === 'PUT' && $path === '/api/site-settings') {
        required_auth_context($jwtSecret);
        $entries = [];
        if (isset($body['entries']) && is_array($body['entries'])) {
            $entries = $body['entries'];
        } else {
            foreach ($body as $settingKey => $settingValue) {
                $entries[] = [
                    'setting_key' => $settingKey,
                    'setting_value' => $settingValue,
                ];
            }
        }

        foreach ($entries as $entry) {
            if (!is_array($entry) || empty($entry['setting_key'])) {
                continue;
            }
            upsert_setting($pdo, (string) $entry['setting_key'], $entry['setting_value'] ?? null);
        }

        send_success(load_site_settings($pdo), 'Site settings updated');
    }

    if ($method === 'GET' && $path === '/api/contact-settings') {
        send_success(load_contact_settings($pdo));
    }

    if ($method === 'PUT' && $path === '/api/contact-settings') {
        required_auth_context($jwtSecret);
        $payload = [
            'phone' => (string) ($body['phone'] ?? ''),
            'whatsapp' => (string) ($body['whatsapp'] ?? ''),
            'email' => (string) ($body['email'] ?? ''),
            'address' => (string) ($body['address'] ?? ''),
            'map_iframe' => (string) ($body['map_iframe'] ?? ''),
            'business_hours' => (string) ($body['business_hours'] ?? ''),
            'social_links' => parse_object_value($body['social_links'] ?? $body['social_links_json'] ?? [], []),
        ];
        save_contact_settings($pdo, $payload);
        send_success(load_contact_settings($pdo), 'Contact settings updated');
    }

    if ($method === 'GET' && $path === '/api/categories') {
        $includeInactive = $auth !== null || (string) request_query('all', '') === '1';
        send_success(build_categories($pdo, $includeInactive));
    }

    if ($method === 'POST' && $path === '/api/categories') {
        required_auth_context($jwtSecret);
        $name = trim((string) ($bodyObject['name'] ?? ''));
        if ($name === '') {
            send_error(400, 'Category name is required');
        }
        $slug = trim((string) ($bodyObject['slug'] ?? ''));
        if ($slug === '') {
            $slug = slugify($name);
        }
        db_exec(
            $pdo,
            'INSERT INTO categories (name, slug, icon, image, display_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?)',
            [
                $name,
                $slug,
                $bodyObject['icon'] ?? null,
                $bodyObject['image'] ?? null,
                to_number($bodyObject['display_order'] ?? 0, 0),
                array_key_exists('is_active', $bodyObject) ? (to_boolean($bodyObject['is_active'], true) ? 1 : 0) : 1,
            ]
        );
        send_success([
            'id' => (int) $pdo->lastInsertId(),
            'slug' => $slug,
        ], 'Category created');
    }

    if (preg_match('#^/api/categories/([^/]+)$#', $path, $matches) === 1) {
        $categoryIdentifier = $matches[1];
        if ($method === 'PUT') {
            required_auth_context($jwtSecret);
            $existing = find_row_by_identifier($pdo, 'categories', $categoryIdentifier);
            if (!$existing) {
                send_error(404, 'Category not found');
            }
            $name = trim((string) ($bodyObject['name'] ?? $existing['name']));
            $slug = trim((string) ($bodyObject['slug'] ?? $existing['slug']));
            if ($slug === '') {
                $slug = slugify($name);
            }
            db_exec(
                $pdo,
                'UPDATE categories SET name = ?, slug = ?, icon = ?, image = ?, display_order = ?, is_active = ? WHERE id = ?',
                [
                    $name,
                    $slug,
                    array_key_exists('icon', $bodyObject) ? $bodyObject['icon'] : ($existing['icon'] ?? null),
                    array_key_exists('image', $bodyObject) ? $bodyObject['image'] : ($existing['image'] ?? null),
                    to_number($bodyObject['display_order'] ?? ($existing['display_order'] ?? 0), 0),
                    array_key_exists('is_active', $bodyObject) ? (to_boolean($bodyObject['is_active'], (int) ($existing['is_active'] ?? 1) === 1) ? 1 : 0) : (int) ($existing['is_active'] ?? 1),
                    $existing['id'],
                ]
            );
            send_success([
                'id' => (int) $existing['id'],
                'slug' => $slug,
            ], 'Category updated');
        }
        if ($method === 'DELETE') {
            required_auth_context($jwtSecret);
            $result = delete_row_by_identifier($pdo, 'categories', $categoryIdentifier);
            if ((int) ($result['affectedRows'] ?? 0) === 0) {
                send_error(404, 'Category not found');
            }
            send_success(null, 'Category deleted');
        }
    }

    if ($method === 'GET' && $path === '/api/services') {
        $includeInactive = $auth !== null || (string) request_query('all', '') === '1';
        send_success(build_services($pdo, $includeInactive));
    }

    if (preg_match('#^/api/services/([^/]+)$#', $path, $matches) === 1) {
        $serviceIdentifier = $matches[1];
        if ($method === 'GET') {
            $row = find_row_by_identifier($pdo, 'services', $serviceIdentifier);
            if (!$row) {
                send_error(404, 'Service not found');
            }
            if ($auth === null && (int) ($row['is_active'] ?? 0) !== 1) {
                send_error(404, 'Service not found');
            }
            send_success([
                'id' => (int) $row['id'],
                'title' => $row['title'],
                'slug' => $row['slug'],
                'short_description' => $row['short_description'] ?? '',
                'full_description' => $row['full_description'] ?? '',
                'image' => $row['image'] ?? '',
                'icon' => $row['icon'] ?? '',
                'features' => parse_array_value($row['features_json'] ?? null, []),
                'display_order' => (int) $row['display_order'],
                'is_active' => (int) $row['is_active'],
            ]);
        }
        if ($method === 'PUT') {
            required_auth_context($jwtSecret);
            $existing = find_row_by_identifier($pdo, 'services', $serviceIdentifier);
            if (!$existing) {
                send_error(404, 'Service not found');
            }
            $title = trim((string) ($bodyObject['title'] ?? $existing['title']));
            $slug = trim((string) ($bodyObject['slug'] ?? $existing['slug']));
            if ($slug === '') {
                $slug = slugify($title);
            }
            db_exec(
                $pdo,
                'UPDATE services SET title = ?, slug = ?, short_description = ?, full_description = ?, image = ?, icon = ?, features_json = ?, display_order = ?, is_active = ? WHERE id = ?',
                [
                    $title,
                    $slug,
                    array_key_exists('short_description', $bodyObject) ? $bodyObject['short_description'] : ($existing['short_description'] ?? ''),
                    array_key_exists('full_description', $bodyObject) ? $bodyObject['full_description'] : ($existing['full_description'] ?? ''),
                    array_key_exists('image', $bodyObject) ? $bodyObject['image'] : ($existing['image'] ?? null),
                    array_key_exists('icon', $bodyObject) ? $bodyObject['icon'] : ($existing['icon'] ?? null),
                    json_encode_safe(parse_array_value($bodyObject['features'] ?? parse_json_value($existing['features_json'] ?? null, []), [])),
                    to_number($bodyObject['display_order'] ?? ($existing['display_order'] ?? 0), 0),
                    array_key_exists('is_active', $bodyObject) ? (to_boolean($bodyObject['is_active'], (int) ($existing['is_active'] ?? 1) === 1) ? 1 : 0) : (int) ($existing['is_active'] ?? 1),
                    $existing['id'],
                ]
            );
            send_success([
                'id' => (int) $existing['id'],
                'slug' => $slug,
            ], 'Service updated');
        }
        if ($method === 'DELETE') {
            required_auth_context($jwtSecret);
            $result = delete_row_by_identifier($pdo, 'services', $serviceIdentifier);
            if ((int) ($result['affectedRows'] ?? 0) === 0) {
                send_error(404, 'Service not found');
            }
            send_success(null, 'Service deleted');
        }
    }

    if ($method === 'POST' && $path === '/api/services') {
        required_auth_context($jwtSecret);
        $title = trim((string) ($bodyObject['title'] ?? ''));
        if ($title === '') {
            send_error(400, 'Service title is required');
        }
        $slug = trim((string) ($bodyObject['slug'] ?? ''));
        if ($slug === '') {
            $slug = slugify($title);
        }
        db_exec(
            $pdo,
            'INSERT INTO services (title, slug, short_description, full_description, image, icon, features_json, display_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $title,
                $slug,
                $bodyObject['short_description'] ?? '',
                $bodyObject['full_description'] ?? '',
                $bodyObject['image'] ?? null,
                $bodyObject['icon'] ?? null,
                json_encode_safe(parse_array_value($bodyObject['features'] ?? [], [])),
                to_number($bodyObject['display_order'] ?? 0, 0),
                array_key_exists('is_active', $bodyObject) ? (to_boolean($bodyObject['is_active'], true) ? 1 : 0) : 1,
            ]
        );
        send_success([
            'id' => (int) $pdo->lastInsertId(),
            'slug' => $slug,
        ], 'Service created');
    }

    if ($method === 'GET' && $path === '/api/products') {
        $includeInactive = $auth !== null || (string) request_query('all', '') === '1';
        send_success(build_products($pdo, $includeInactive, [
            'search' => request_query('search', ''),
            'category' => request_query('category', ''),
            'topSellingOnly' => (string) request_query('top_selling', '') === '1',
        ]));
    }

    if (preg_match('#^/api/products/([^/]+)$#', $path, $matches) === 1) {
        $productIdentifier = $matches[1];
        if ($method === 'GET') {
            $row = find_product_by_identifier($pdo, $productIdentifier);
            if (!$row) {
                send_error(404, 'Product not found');
            }
            if ($auth === null && (int) ($row['is_active'] ?? 0) !== 1) {
                send_error(404, 'Product not found');
            }
            send_success(resolve_product($row, $pdo));
        }
        if ($method === 'PUT') {
            required_auth_context($jwtSecret);
            $existing = find_row_by_identifier($pdo, 'products', $productIdentifier);
            if (!$existing) {
                send_error(404, 'Product not found');
            }
            $pdo->beginTransaction();
            try {
                upsert_product($pdo, $bodyObject, (int) $existing['id']);
                $pdo->commit();
                send_success(['id' => (int) $existing['id']], 'Product updated');
            } catch (Throwable $error) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                throw $error;
            }
        }
        if ($method === 'DELETE') {
            required_auth_context($jwtSecret);
            $result = delete_row_by_identifier($pdo, 'products', $productIdentifier);
            if ((int) ($result['affectedRows'] ?? 0) === 0) {
                send_error(404, 'Product not found');
            }
            send_success(null, 'Product deleted');
        }
    }

    if ($method === 'POST' && $path === '/api/products') {
        required_auth_context($jwtSecret);
        $pdo->beginTransaction();
        try {
            $productId = upsert_product($pdo, $bodyObject, null);
            $pdo->commit();
            send_success(['id' => $productId], 'Product created');
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $error;
        }
    }

    if ($method === 'GET' && $path === '/api/gallery') {
        $includeInactive = $auth !== null || (string) request_query('all', '') === '1';
        send_success(build_gallery($pdo, $includeInactive));
    }

    if ($method === 'POST' && $path === '/api/gallery') {
        required_auth_context($jwtSecret);
        $title = trim((string) ($bodyObject['title'] ?? ''));
        $imageUrl = trim((string) ($bodyObject['image_url'] ?? $bodyObject['image'] ?? ''));
        if ($title === '' || $imageUrl === '') {
            send_error(400, 'Gallery title and image are required');
        }
        db_exec(
            $pdo,
            'INSERT INTO gallery (title, category, image_url, alt_text, display_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?)',
            [
                $title,
                $bodyObject['category'] ?? '',
                $imageUrl,
                $bodyObject['alt_text'] ?? '',
                to_number($bodyObject['display_order'] ?? 0, 0),
                array_key_exists('is_active', $bodyObject) ? (to_boolean($bodyObject['is_active'], true) ? 1 : 0) : 1,
            ]
        );
        send_success(['id' => (int) $pdo->lastInsertId()], 'Gallery item created');
    }

    if (preg_match('#^/api/gallery/([^/]+)$#', $path, $matches) === 1) {
        $galleryId = $matches[1];
        if ($method === 'PUT') {
            required_auth_context($jwtSecret);
            $existing = db_query($pdo, 'SELECT * FROM gallery WHERE id = ? LIMIT 1', [$galleryId])[0] ?? null;
            if (!$existing) {
                send_error(404, 'Gallery item not found');
            }
            db_exec(
                $pdo,
                'UPDATE gallery SET title = ?, category = ?, image_url = ?, alt_text = ?, display_order = ?, is_active = ? WHERE id = ?',
                [
                    $bodyObject['title'] ?? $existing['title'],
                    $bodyObject['category'] ?? $existing['category'],
                    $bodyObject['image_url'] ?? $bodyObject['image'] ?? $existing['image_url'],
                    $bodyObject['alt_text'] ?? $existing['alt_text'],
                    to_number($bodyObject['display_order'] ?? ($existing['display_order'] ?? 0), 0),
                    array_key_exists('is_active', $bodyObject) ? (to_boolean($bodyObject['is_active'], (int) ($existing['is_active'] ?? 1) === 1) ? 1 : 0) : (int) ($existing['is_active'] ?? 1),
                    $existing['id'],
                ]
            );
            send_success(['id' => (int) $existing['id']], 'Gallery item updated');
        }
        if ($method === 'DELETE') {
            required_auth_context($jwtSecret);
            db_exec($pdo, 'DELETE FROM gallery WHERE id = ?', [$galleryId]);
            send_success(null, 'Gallery item deleted');
        }
    }

    if ($method === 'GET' && $path === '/api/testimonials') {
        $includeInactive = $auth !== null || (string) request_query('all', '') === '1';
        send_success(build_testimonials($pdo, $includeInactive));
    }

    if ($method === 'POST' && $path === '/api/testimonials') {
        required_auth_context($jwtSecret);
        $clientName = trim((string) ($bodyObject['client_name'] ?? ''));
        $reviewText = trim((string) ($bodyObject['review_text'] ?? ''));
        if ($clientName === '' || $reviewText === '') {
            send_error(400, 'Client name and review text are required');
        }
        db_exec(
            $pdo,
            'INSERT INTO testimonials (client_name, client_photo, review_text, rating, location, display_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                $clientName,
                $bodyObject['client_photo'] ?? '',
                $reviewText,
                (int) ($bodyObject['rating'] ?? 5),
                $bodyObject['location'] ?? '',
                to_number($bodyObject['display_order'] ?? 0, 0),
                array_key_exists('is_active', $bodyObject) ? (to_boolean($bodyObject['is_active'], true) ? 1 : 0) : 1,
            ]
        );
        send_success(['id' => (int) $pdo->lastInsertId()], 'Testimonial created');
    }

    if (preg_match('#^/api/testimonials/([^/]+)$#', $path, $matches) === 1) {
        $testimonialId = $matches[1];
        if ($method === 'PUT') {
            required_auth_context($jwtSecret);
            $existing = db_query($pdo, 'SELECT * FROM testimonials WHERE id = ? LIMIT 1', [$testimonialId])[0] ?? null;
            if (!$existing) {
                send_error(404, 'Testimonial not found');
            }
            db_exec(
                $pdo,
                'UPDATE testimonials SET client_name = ?, client_photo = ?, review_text = ?, rating = ?, location = ?, display_order = ?, is_active = ? WHERE id = ?',
                [
                    $bodyObject['client_name'] ?? $existing['client_name'],
                    $bodyObject['client_photo'] ?? $existing['client_photo'],
                    $bodyObject['review_text'] ?? $existing['review_text'],
                    (int) ($bodyObject['rating'] ?? $existing['rating'] ?? 5),
                    $bodyObject['location'] ?? $existing['location'],
                    to_number($bodyObject['display_order'] ?? ($existing['display_order'] ?? 0), 0),
                    array_key_exists('is_active', $bodyObject) ? (to_boolean($bodyObject['is_active'], (int) ($existing['is_active'] ?? 1) === 1) ? 1 : 0) : (int) ($existing['is_active'] ?? 1),
                    $existing['id'],
                ]
            );
            send_success(['id' => (int) $existing['id']], 'Testimonial updated');
        }
        if ($method === 'DELETE') {
            required_auth_context($jwtSecret);
            db_exec($pdo, 'DELETE FROM testimonials WHERE id = ?', [$testimonialId]);
            send_success(null, 'Testimonial deleted');
        }
    }

    if ($method === 'GET' && $path === '/api/blogs') {
        $includeInactive = $auth !== null || (string) request_query('all', '') === '1';
        send_success(build_blogs($pdo, $includeInactive));
    }

    if (preg_match('#^/api/blogs/([^/]+)$#', $path, $matches) === 1) {
        $blogIdentifier = $matches[1];
        if ($method === 'GET') {
            $row = find_row_by_identifier($pdo, 'blogs', $blogIdentifier);
            if (!$row) {
                send_error(404, 'Blog not found');
            }
            if ($auth === null && (int) ($row['published'] ?? 0) !== 1) {
                send_error(404, 'Blog not found');
            }
            send_success([
                'id' => (int) $row['id'],
                'title' => $row['title'],
                'slug' => $row['slug'],
                'image' => $row['image'] ?? '',
                'short_description' => $row['short_description'] ?? '',
                'content' => $row['content'] ?? '',
                'seo_title' => $row['seo_title'] ?? '',
                'meta_description' => $row['meta_description'] ?? '',
                'keywords' => $row['keywords'] ?? '',
                'published' => (int) ($row['published'] ?? 0) === 1,
                'published_at' => $row['published_at'] ?? null,
                'display_order' => (int) $row['display_order'],
            ]);
        }
        if ($method === 'PUT') {
            required_auth_context($jwtSecret);
            $existing = find_row_by_identifier($pdo, 'blogs', $blogIdentifier);
            if (!$existing) {
                send_error(404, 'Blog not found');
            }
            $title = trim((string) ($bodyObject['title'] ?? $existing['title']));
            $slug = trim((string) ($bodyObject['slug'] ?? $existing['slug']));
            if ($slug === '') {
                $slug = slugify($title);
            }
            $published = array_key_exists('published', $bodyObject) ? to_boolean($bodyObject['published'], (int) ($existing['published'] ?? 0) === 1) : ((int) ($existing['published'] ?? 0) === 1);
            $publishedAt = null;
            if ($published) {
                $publishedAt = $bodyObject['published_at'] ?? $existing['published_at'] ?? date('Y-m-d H:i:s');
            }
            db_exec(
                $pdo,
                'UPDATE blogs SET title = ?, slug = ?, image = ?, short_description = ?, content = ?, seo_title = ?, meta_description = ?, keywords = ?, published = ?, published_at = ?, display_order = ? WHERE id = ?',
                [
                    $title,
                    $slug,
                    array_key_exists('image', $bodyObject) ? $bodyObject['image'] : ($existing['image'] ?? null),
                    array_key_exists('short_description', $bodyObject) ? $bodyObject['short_description'] : ($existing['short_description'] ?? ''),
                    array_key_exists('content', $bodyObject) ? $bodyObject['content'] : ($existing['content'] ?? ''),
                    array_key_exists('seo_title', $bodyObject) ? $bodyObject['seo_title'] : ($existing['seo_title'] ?? ''),
                    array_key_exists('meta_description', $bodyObject) ? $bodyObject['meta_description'] : ($existing['meta_description'] ?? ''),
                    array_key_exists('keywords', $bodyObject) ? $bodyObject['keywords'] : ($existing['keywords'] ?? ''),
                    $published ? 1 : 0,
                    $publishedAt,
                    to_number($bodyObject['display_order'] ?? ($existing['display_order'] ?? 0), 0),
                    $existing['id'],
                ]
            );
            send_success([
                'id' => (int) $existing['id'],
                'slug' => $slug,
            ], 'Blog updated');
        }
        if ($method === 'DELETE') {
            required_auth_context($jwtSecret);
            $result = delete_row_by_identifier($pdo, 'blogs', $blogIdentifier);
            if ((int) ($result['affectedRows'] ?? 0) === 0) {
                send_error(404, 'Blog not found');
            }
            send_success(null, 'Blog deleted');
        }
    }

    if ($method === 'POST' && $path === '/api/blogs') {
        required_auth_context($jwtSecret);
        $title = trim((string) ($bodyObject['title'] ?? ''));
        if ($title === '') {
            send_error(400, 'Blog title is required');
        }
        $slug = trim((string) ($bodyObject['slug'] ?? ''));
        if ($slug === '') {
            $slug = slugify($title);
        }
        $published = array_key_exists('published', $bodyObject) ? to_boolean($bodyObject['published'], false) : false;
        $publishedAt = $published ? ($bodyObject['published_at'] ?? date('Y-m-d H:i:s')) : null;
        db_exec(
            $pdo,
            'INSERT INTO blogs (title, slug, image, short_description, content, seo_title, meta_description, keywords, published, published_at, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $title,
                $slug,
                $bodyObject['image'] ?? null,
                $bodyObject['short_description'] ?? '',
                $bodyObject['content'] ?? '',
                $bodyObject['seo_title'] ?? '',
                $bodyObject['meta_description'] ?? '',
                $bodyObject['keywords'] ?? '',
                $published ? 1 : 0,
                $publishedAt,
                to_number($bodyObject['display_order'] ?? 0, 0),
            ]
        );
        send_success([
            'id' => (int) $pdo->lastInsertId(),
            'slug' => $slug,
        ], 'Blog created');
    }

    if ($method === 'GET' && $path === '/api/seo') {
        $page = trim((string) request_query('page', ''));
        send_success(build_seo($pdo, $page !== '' ? $page : null));
    }

    if ($method === 'PUT' && $path === '/api/seo') {
        required_auth_context($jwtSecret);
        $entries = [];
        if (isset($body['entries']) && is_array($body['entries'])) {
            $entries = $body['entries'];
        } elseif (isset($bodyObject['page_name']) && trim((string) $bodyObject['page_name']) !== '') {
            $entries = [$bodyObject];
        } else {
            foreach ($body as $pageName => $item) {
                $entry = ['page_name' => $pageName];
                if (is_array($item)) {
                    $entry = array_merge($entry, $item);
                } else {
                    $entry['meta_title'] = (string) $item;
                }
                $entries[] = $entry;
            }
        }

        foreach ($entries as $entry) {
            if (!is_array($entry) || empty($entry['page_name'])) {
                continue;
            }
            db_exec(
                $pdo,
                'INSERT INTO seo_settings (page_name, meta_title, meta_description, keywords, og_image, canonical_url)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE meta_title = VALUES(meta_title), meta_description = VALUES(meta_description), keywords = VALUES(keywords), og_image = VALUES(og_image), canonical_url = VALUES(canonical_url)',
                [
                    $entry['page_name'],
                    $entry['meta_title'] ?? '',
                    $entry['meta_description'] ?? '',
                    $entry['keywords'] ?? '',
                    $entry['og_image'] ?? '',
                    $entry['canonical_url'] ?? '',
                ]
            );
        }
        send_success(build_seo($pdo, null), 'SEO settings updated');
    }

    if ($method === 'GET' && $path === '/api/home') {
        $includeInactive = $auth !== null || (string) request_query('all', '') === '1';
        send_success(build_home_content($pdo, $includeInactive));
    }

    if ($method === 'PUT' && $path === '/api/home') {
        required_auth_context($jwtSecret);
        if (array_key_exists('heroSlides', $body)) {
            upsert_section($pdo, 'home_sections', 'hero_slides', 'Hero Slides', $body['heroSlides'], $body['heroSlidesActive'] ?? 1);
        }
        if (array_key_exists('trustHighlights', $body)) {
            upsert_section($pdo, 'home_sections', 'trust_highlights', 'Trust Highlights', $body['trustHighlights'], $body['trustHighlightsActive'] ?? 1);
        }
        if (array_key_exists('clientLogos', $body)) {
            upsert_section($pdo, 'home_sections', 'client_logos', 'Client Logos', $body['clientLogos'], $body['clientLogosActive'] ?? 1);
        }
        if (array_key_exists('homeImages', $body)) {
            upsert_section($pdo, 'home_sections', 'home_images', 'Home Images', $body['homeImages'], $body['homeImagesActive'] ?? 1);
        }
        if (array_key_exists('seo', $body)) {
            upsert_section($pdo, 'home_sections', 'seo', 'Home SEO', $body['seo'], $body['seoActive'] ?? 1);
        }
        send_success(build_home_content($pdo, true), 'Home content updated');
    }

    if ($method === 'GET' && $path === '/api/about') {
        $includeInactive = $auth !== null || (string) request_query('all', '') === '1';
        send_success(build_about_content($pdo, $includeInactive));
    }

    if ($method === 'PUT' && $path === '/api/about') {
        required_auth_context($jwtSecret);
        if (array_key_exists('hero', $body)) {
            upsert_section($pdo, 'about_sections', 'hero', 'About Hero', $body['hero'], $body['heroActive'] ?? 1);
        }
        if (array_key_exists('overview', $body)) {
            upsert_section($pdo, 'about_sections', 'overview', 'About Overview', $body['overview'], $body['overviewActive'] ?? 1);
        }
        if (array_key_exists('mission', $body)) {
            upsert_section($pdo, 'about_sections', 'mission', 'Mission', $body['mission'], $body['missionActive'] ?? 1);
        }
        if (array_key_exists('vision', $body)) {
            upsert_section($pdo, 'about_sections', 'vision', 'Vision', $body['vision'], $body['visionActive'] ?? 1);
        }
        if (array_key_exists('values', $body)) {
            upsert_section($pdo, 'about_sections', 'values', 'Why Choose Us', $body['values'], $body['valuesActive'] ?? 1);
        }
        if (array_key_exists('counters', $body)) {
            upsert_section($pdo, 'about_sections', 'counters', 'Experience Counters', $body['counters'], $body['countersActive'] ?? 1);
        }
        if (array_key_exists('process', $body)) {
            upsert_section($pdo, 'about_sections', 'process', 'Process', $body['process'], $body['processActive'] ?? 1);
        }
        if (array_key_exists('seo', $body)) {
            upsert_section($pdo, 'about_sections', 'seo', 'About SEO', $body['seo'], $body['seoActive'] ?? 1);
        }
        send_success(build_about_content($pdo, true), 'About content updated');
    }

    if ($method === 'POST' && $path === '/api/enquiries') {
        $name = trim((string) ($bodyObject['name'] ?? ''));
        $phone = trim((string) ($bodyObject['phone'] ?? ''));
        if ($name === '' || $phone === '') {
            send_error(400, 'Name and phone are required');
        }
        db_exec(
            $pdo,
            'INSERT INTO enquiries (name, phone, email, service_interested, message, status, admin_notes, source_page)
             VALUES (?, ?, ?, ?, ?, \'new\', ?, ?)',
            [
                $name,
                $phone,
                $bodyObject['email'] ?? '',
                $bodyObject['service_interested'] ?? $bodyObject['serviceInterested'] ?? $bodyObject['equipment'] ?? '',
                $bodyObject['message'] ?? '',
                $bodyObject['admin_notes'] ?? '',
                $bodyObject['source_page'] ?? $bodyObject['sourcePage'] ?? '',
            ]
        );
        send_success(['id' => (int) $pdo->lastInsertId()], 'Enquiry submitted');
    }

    if ($method === 'GET' && $path === '/api/enquiries') {
        required_auth_context($jwtSecret);
        $page = max(1, (int) request_query('page', 1));
        $limit = min(100, max(1, (int) request_query('limit', 10)));
        $offset = ($page - 1) * $limit;
        $status = trim((string) request_query('status', ''));
        $search = strtolower(trim((string) request_query('search', '')));

        $rows = db_query($pdo, 'SELECT * FROM enquiries ORDER BY created_at DESC, id DESC');
        if ($status !== '') {
            $rows = array_values(array_filter($rows, static function ($row) use ($status) {
                return (string) ($row['status'] ?? '') === $status;
            }));
        }
        if ($search !== '') {
            $rows = array_values(array_filter($rows, static function ($row) use ($search) {
                foreach ([$row['name'] ?? '', $row['phone'] ?? '', $row['email'] ?? '', $row['service_interested'] ?? '', $row['message'] ?? ''] as $value) {
                    if (strpos(strtolower((string) $value), $search) !== false) {
                        return true;
                    }
                }
                return false;
            }));
        }

        $total = count($rows);
        $items = array_slice($rows, $offset, $limit);
        send_success([
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => max(1, (int) ceil($total / $limit)),
        ]);
    }

    if (preg_match('#^/api/enquiries/([^/]+)$#', $path, $matches) === 1) {
        $enquiryId = $matches[1];
        if ($method === 'PUT') {
            required_auth_context($jwtSecret);
            $existing = db_query($pdo, 'SELECT * FROM enquiries WHERE id = ? LIMIT 1', [$enquiryId])[0] ?? null;
            if (!$existing) {
                send_error(404, 'Enquiry not found');
            }
            db_exec(
                $pdo,
                'UPDATE enquiries SET name = ?, phone = ?, email = ?, service_interested = ?, message = ?, status = ?, admin_notes = ? WHERE id = ?',
                [
                    $bodyObject['name'] ?? $existing['name'],
                    $bodyObject['phone'] ?? $existing['phone'],
                    $bodyObject['email'] ?? $existing['email'],
                    $bodyObject['service_interested'] ?? $existing['service_interested'],
                    $bodyObject['message'] ?? $existing['message'],
                    $bodyObject['status'] ?? $existing['status'],
                    $bodyObject['admin_notes'] ?? $existing['admin_notes'],
                    $existing['id'],
                ]
            );
            send_success(null, 'Enquiry updated');
        }
        if ($method === 'DELETE') {
            required_auth_context($jwtSecret);
            db_exec($pdo, 'DELETE FROM enquiries WHERE id = ?', [$enquiryId]);
            send_success(null, 'Enquiry deleted');
        }
    }

    if ($method === 'POST' && $path === '/api/vendors') {
        $vendorName = trim((string) ($bodyObject['vendor_name'] ?? $bodyObject['vendorName'] ?? ''));
        if ($vendorName === '') {
            send_error(400, 'Vendor name is required');
        }
        db_exec(
            $pdo,
            'INSERT INTO vendors (vendor_name, business_name, phone, email, address, category, gst_number, status, admin_notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, \'pending\', ?)',
            [
                $vendorName,
                $bodyObject['business_name'] ?? $bodyObject['businessName'] ?? '',
                $bodyObject['phone'] ?? '',
                $bodyObject['email'] ?? '',
                $bodyObject['address'] ?? '',
                $bodyObject['category'] ?? '',
                $bodyObject['gst_number'] ?? $bodyObject['gstNumber'] ?? '',
                $bodyObject['admin_notes'] ?? '',
            ]
        );
        send_success(['id' => (int) $pdo->lastInsertId()], 'Vendor registration submitted');
    }

    if ($method === 'GET' && $path === '/api/vendors') {
        required_auth_context($jwtSecret);
        $status = trim((string) request_query('status', ''));
        $rows = db_query($pdo, 'SELECT * FROM vendors ORDER BY created_at DESC, id DESC');
        if ($status !== '') {
            $rows = array_values(array_filter($rows, static function ($row) use ($status) {
                return (string) ($row['status'] ?? '') === $status;
            }));
        }
        send_success($rows);
    }

    if (preg_match('#^/api/vendors/([^/]+)$#', $path, $matches) === 1) {
        $vendorId = $matches[1];
        if ($method === 'PUT') {
            required_auth_context($jwtSecret);
            $existing = db_query($pdo, 'SELECT * FROM vendors WHERE id = ? LIMIT 1', [$vendorId])[0] ?? null;
            if (!$existing) {
                send_error(404, 'Vendor not found');
            }
            db_exec(
                $pdo,
                'UPDATE vendors SET vendor_name = ?, business_name = ?, phone = ?, email = ?, address = ?, category = ?, gst_number = ?, status = ?, admin_notes = ? WHERE id = ?',
                [
                    $bodyObject['vendor_name'] ?? $existing['vendor_name'],
                    $bodyObject['business_name'] ?? $existing['business_name'],
                    $bodyObject['phone'] ?? $existing['phone'],
                    $bodyObject['email'] ?? $existing['email'],
                    $bodyObject['address'] ?? $existing['address'],
                    $bodyObject['category'] ?? $existing['category'],
                    $bodyObject['gst_number'] ?? $existing['gst_number'],
                    $bodyObject['status'] ?? $existing['status'],
                    $bodyObject['admin_notes'] ?? $existing['admin_notes'],
                    $existing['id'],
                ]
            );
            send_success(null, 'Vendor updated');
        }
        if ($method === 'DELETE') {
            required_auth_context($jwtSecret);
            db_exec($pdo, 'DELETE FROM vendors WHERE id = ?', [$vendorId]);
            send_success(null, 'Vendor deleted');
        }
    }

    if ($method === 'POST' && $path === '/api/uploads') {
        required_auth_context($jwtSecret);
        if (!isset($_FILES['file'])) {
            send_error(400, 'File is required');
        }
        try {
            $fileData = parse_upload_file($_FILES['file'], 'file');
            send_success($fileData);
        } catch (Throwable $error) {
            send_error(400, $error->getMessage() ?: 'File upload failed');
        }
    }

    if ($method === 'POST' && $path === '/api/uploads/multiple') {
        required_auth_context($jwtSecret);
        if (!isset($_FILES['files'])) {
            send_error(400, 'File is required');
        }
        $normalized = normalize_multiple_uploads($_FILES['files']);
        if (count($normalized) > 12) {
            send_error(400, 'Too many files');
        }
        $files = [];
        try {
            foreach ($normalized as $file) {
                $files[] = parse_upload_file($file, 'files');
            }
            send_success($files);
        } catch (Throwable $error) {
            send_error(400, $error->getMessage() ?: 'File upload failed');
        }
    }

    handle_not_found();
}

handle_request();
