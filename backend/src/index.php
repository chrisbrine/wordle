<?

require __DIR__ . '/../vendor/autoload.php';

try {
    // Simulate the Lambda $event
    $event = [
        'httpMethod' => $_SERVER['REQUEST_METHOD'],
        'headers' => getallheaders(),
        'queryStringParameters' => $_GET,
        'body' => file_get_contents('php://input'),
        'path' => $_SERVER['REQUEST_URI'],
    ];

    // Call the handler function
    $result = handler(isset($event['body']) ? json_decode($event['body'], true) : []);

    // Output the API response
    APIResponse($result[0], isset($result[1]) ? $result[1] : 200);

}
catch (Exception $e) {

    APIResponse([
        'success' => false,
        'error' => $e->getMessage()
    ], 500);
}

function initDB(): mysqli
{
    $host = (getenv('DB_HOST')) ?: '127.0.0.1';
    $username = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASS') ?: 'password';
    $database = getenv('DB_NAME') ?: 'lambda';

    $db = new mysqli($host, $username, $password, $database);

    // Check for connection errors
    if ($db->connect_error) {
        die("Database connection failed: " . $db->connect_error);
    }

    // echo "Connected to Amazon RDS successfully!" . PHP_EOL;

    // Ensure tables are set up
    ensureTablesExist($db);

    return $db;
}

function ensureTablesExist(mysqli $db): void
{
    createTableIfNotExists(
        $db,
        'words',
        "CREATE TABLE words (
            id INT AUTO_INCREMENT PRIMARY KEY,
            word VARCHAR(255) NOT NULL
        )"
    );

    createTableIfNotExists(
        $db,
        'stats',
        "CREATE TABLE stats (
            browser_id VARCHAR(255) PRIMARY KEY,
            played INT DEFAULT 0,
            won INT DEFAULT 0
        )"
    );

    createTableIfNotExists(
        $db,
        'guesses',
        "CREATE TABLE guesses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            browser_id VARCHAR(255) NOT NULL,
            word_id INT NOT NULL,
            guess VARCHAR(255) NOT NULL,
            FOREIGN KEY (word_id) REFERENCES words(id),
            FOREIGN KEY (browser_id) REFERENCES stats(browser_id)
        )"
    );

    createTableIfNotExists(
        $db,
        'current_word',
        "CREATE TABLE current_word (
            id INT AUTO_INCREMENT PRIMARY KEY,
            word VARCHAR(255) NOT NULL,
            expiry BIGINT NOT NULL
        )"
    );

    loadDefaultWords($db);
}

function loadDefaultWords(mysqli $db): void
{
    $wordFile = __DIR__ . '/../wordlist.txt';
    if (!file_exists($wordFile)) {
        throw new Exception("Word list file not found: $wordFile");
    }

    $words = file($wordFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    // Prepare the SQL statement
    $insert = $db->prepare("INSERT INTO words (word) VALUES (?)");

    foreach ($words as $word) {
        if (strlen($word) !== 5) {
            continue;
        }

        // Bind the word parameter and execute the statement
        $word = strtolower(trim($word)); // Normalize the word
        $insert->bind_param("s", $word);
        $insert->execute();
    }

    // Free resources
    $insert->close();
}

function createTableIfNotExists(mysqli $db, string $tableName, string $createTableQuery): void
{
    // Use a direct query to check for the table's existence
    $result = $db->query("SHOW TABLES LIKE '$tableName'");
    if (!$result) {
        throw new Exception("Failed to execute query: " . $db->error);
    }

    // If no rows are returned, the table does not exist
    if ($result->num_rows === 0) {
        // Execute the query to create the table
        if (!$db->query($createTableQuery)) {
            throw new Exception("Failed to create table $tableName: " . $db->error);
        }
    }

    // Free resources
    $result->free();
}

function handler($data)
{
    $httpMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($httpMethod === 'OPTIONS') {
        // Handle preflight request for CORS
        return [[ "success" => true], 204];
    }

    // print_r(json_encode($data) . PHP_EOL);

    $function = isset($data['queryStringParameters']['function']) ? $data['queryStringParameters']['function'] : "";
    $data = isset($data['queryStringParameters']['data']) ? $data['queryStringParameters']['data'] : [];
    $browser_id = isset($data['queryStringParameters']['browser_id']) ? $data['queryStringParameters']['browser_id'] : "";
    $db = initDB();

    $defaultExpiryMinutes = 5;
    $data['defaults'] = [
        'expiry' => $defaultExpiryMinutes,
    ];

    switch ($function) {
        case "health":
            return health($db, $browser_id, $data);
        case "get-word":
            return get_word($db, $browser_id, $data);
        case "get-stats":
            return get_stats($db, $browser_id, $data);
        case "update-stats":
            return update_stats($db, $browser_id, $data);
        case "add-guess":
            return add_guess($db, $browser_id, $data);
        case "get-guesses":
            return get_guesses($db, $browser_id, $data);
        default:
            return [ [ "success" => "false", "error" => "Invalid function" ], 404];
    }
}

function health(mysqli $db, string $browser_id, array $data)
{
    $response = array(
        'success' => true,
        "browser_id" => $browser_id,
        "data" => $data,
        "health" => true,
    );
    return [$response, 200];
}

function APIResponse($body, $statusCode = 200)
{
    $headers = array(
        "Content-Type" => "application/json",
        "Access-Control-Allow-Origin" => "*", // Replace '*' with a specific origin if needed
        "Access-Control-Allow-Headers" => "Content-Type, Authorization",
        "Access-Control-Allow-Methods" => "OPTIONS, POST, GET, PUT, DELETE", // Include all necessary methods
        "Access-Control-Allow-Credentials" => "true", // Allow credentials if required
        "Access-Control-Max-Age" => "3600" // Cache preflight response for 1 hour
    );

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        // Preflight request for CORS
        http_response_code(204);
        foreach ($headers as $key => $value) {
            header("$key: $value");
        }
        exit;
    }

    foreach ($headers as $key => $value) {
        header("$key: $value");
    }

    http_response_code($statusCode);

    $response = json_encode(array(
        "statusCode" => $statusCode,
        "headers" => $headers,
        "body" => $body
    ));

    echo json_encode($body) . PHP_EOL;

    return $response;
}

function get_word(mysqli $db, string $browser_id, array $data)
{
    // Check if a cached word exists and is still valid
    $query = $db->query("SELECT word, expiry FROM current_word LIMIT 1");
    $result = $query->fetch_assoc(); // Use fetch_assoc() for MySQLi
    $defaultExpiryMinutes = $data['defaults']['expiry'];

    if ($result && ((int) $result['expiry']) > time()) {
        return [[
            'success' => true,
            'word' => $result['word'],
            'expiry' => (int) $result['expiry']
        ], 200];
    }

    // Fetch a new random word from the words table
    $stmt = $db->prepare("
        SELECT word FROM words
        WHERE word != ?
        ORDER BY RAND() LIMIT 1
    ");
    $currentWord = $result['word'] ?? '';
    $stmt->bind_param("s", $currentWord);
    $stmt->execute();
    $newWordResult = $stmt->get_result();
    $newWord = $newWordResult->fetch_assoc();

    if (!$newWord) {
        return [[
            'success' => false,
            'message' => 'No words found'
        ], 404];
    }

    // Update the cache with the new word and expiry
    $expiry = time() + ($defaultExpiryMinutes * 60);
    if ($expiry > PHP_INT_MAX) {
        $expiry = PHP_INT_MAX;
    } elseif ($expiry < PHP_INT_MIN) {
        $expiry = PHP_INT_MIN;
    }

    $updateStmt = $db->prepare("
        INSERT INTO current_word (word, expiry)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE word = VALUES(word), expiry = VALUES(expiry)
    ");
    $updateStmt->bind_param("si", $newWord['word'], $expiry); // "si" means string and integer
    $updateStmt->execute();

    return [[
        'success' => true,
        'word' => $newWord['word'],
        'expiry' => $expiry
    ], 200];
}

function get_stats(mysqli $db, string $browser_id, array $data)
{
    // Prepare the query to fetch stats for the given browser_id
    $stmt = $db->prepare("SELECT played, won FROM stats WHERE browser_id = ?");
    $stmt->bind_param("s", $browser_id); // Bind the browser_id parameter as a string
    $stmt->execute();

    // Fetch the result
    $result = $stmt->get_result()->fetch_assoc();

    // Default to 0 if the values are not found
    $played = $result['played'] ?? 0;
    $won = $result['won'] ?? 0;

    // Return the API response
    return [[
        'success' => true,
        'played' => $played,
        'won' => $won
    ], 200];
}

function update_stats(mysqli $db, string $browser_id, array $data)
{
    $played = $data['played'] ?? 0;
    $won = $data['won'] ?? 0;

    // Prepare the SQL statement for insertion or update
    $stmt = $db->prepare(
        "INSERT INTO stats (browser_id, played, won)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE played = played + VALUES(played), won = won + VALUES(won)"
    );

    // Bind the parameters: browser_id (string), played (int), won (int)
    $stmt->bind_param("sii", $browser_id, $played, $won);
    $stmt->execute();

    // Return the API response
    return [[
        'success' => true,
        'played' => $played,
        'won' => $won
    ], 200];
}

function add_guess(mysqli $db, string $browserId, array $body)
{
    if (!$browserId) {
        return [[
            'success' => false,
            'error' => 'Browser ID missing'
        ], 400];
    }

    $currentWord = $body['current_word'] ?? '';
    $guess = $body['guess'] ?? '';

    if (!$currentWord || !$guess) {
        return [[
            'success' => false,
            'error' => 'Invalid input'
        ], 400];
    }

    // Query to find the word ID
    $stmt = $db->prepare("SELECT id FROM words WHERE word = ? LIMIT 1");
    $stmt->bind_param("s", $currentWord); // Bind current word as a string
    $stmt->execute();
    $result = $stmt->get_result();
    $wordId = $result->fetch_assoc()['id'] ?? null; // Fetch the word ID

    if (!$wordId) {
        return [[
            'success' => false,
            'error' => 'Invalid word'
        ], 400];
    }

    // Insert the guess into the database
    $insert = $db->prepare("INSERT INTO guesses (browser_id, word_id, guess) VALUES (?, ?, ?)");
    $insert->bind_param("sis", $browserId, $wordId, $guess); // Bind browserId (string), wordId (int), and guess (string)
    $insert->execute();

    return [[
        'success' => true,
        'guess' => $guess
    ], 200];
}

function get_guesses(mysqli $db, string $browserId, array $body)
{
    if (!$browserId) {
        return [[
            'success' => false,
            'error' => 'Browser ID missing'
        ], 400];
    }

    // Fetch the current word and its expiry
    $query = $db->query("SELECT word, expiry FROM current_word LIMIT 1");
    $currentWord = $query->fetch_assoc(); // Use fetch_assoc() for MySQLi

    if (!$currentWord || $currentWord['expiry'] <= time()) {
        // If the active word has expired, delete all guesses for this browser ID
        $delete = $db->prepare("DELETE FROM guesses WHERE browser_id = ?");
        $delete->bind_param("s", $browserId);
        $delete->execute();

        // Return response indicating no active word or guesses
        return [[
            'word' => '',
            'guesses' => []
        ], 200];
    }

    // Check if the user's guesses are associated with the current word
    $stmt = $db->prepare("
        SELECT DISTINCT w.word
        FROM guesses g
        JOIN words w ON g.word_id = w.id
        WHERE g.browser_id = ?
    ");
    $stmt->bind_param("s", $browserId);
    $stmt->execute();
    $result = $stmt->get_result();
    $userWord = $result->fetch_assoc()['word'] ?? null;

    if ($userWord !== $currentWord['word']) {
        // If the user's word does not match the active word, delete their guesses
        $delete = $db->prepare("DELETE FROM guesses WHERE browser_id = ?");
        $delete->bind_param("s", $browserId);
        $delete->execute();

        return [[
            'word' => '',
            'guesses' => []
        ], 200];
    }

    // Fetch the user's guesses for the current word
    $stmt = $db->prepare("
        SELECT guess
        FROM guesses g
        JOIN words w ON g.word_id = w.id
        WHERE g.browser_id = ? AND w.word = ?
    ");
    $stmt->bind_param("ss", $browserId, $currentWord['word']);
    $stmt->execute();
    $result = $stmt->get_result();
    $guesses = [];
    while ($row = $result->fetch_assoc()) {
        $guesses[] = $row['guess'];
    }

    return [[
        'word' => $currentWord['word'],
        'expiry' => (int) $currentWord['expiry'],
        'guesses' => $guesses
    ], 200];
}
