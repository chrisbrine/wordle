<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../src/index.php';

class IndexTest extends TestCase
{
    private $db;

    protected function setUp(): void
    {
        // Set up an SQLite in-memory database
        $this->db = new mysqli('localhost', '', '', ':memory:');
        if ($this->db->connect_error) {
            $this->fail('Database connection failed: ' . $this->db->connect_error);
        }

        // Create mock tables for testing
        $this->db->query("
            CREATE TABLE words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL
            );
        ");
        $this->db->query("
            CREATE TABLE stats (
                browser_id TEXT PRIMARY KEY,
                played INTEGER DEFAULT 0,
                won INTEGER DEFAULT 0
            );
        ");
        $this->db->query("
            CREATE TABLE current_word (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                expiry INTEGER NOT NULL
            );
        ");
    }

    public function testGetWordReturnsValidWord()
    {
        // Insert a mock word into the database
        $this->db->query("INSERT INTO words (word) VALUES ('testword')");

        // Mock input data
        $browser_id = 'test-browser';
        $data = ['defaults' => ['expiry' => 10]];

        // Call the function
        $result = get_word($this->db, $browser_id, $data);

        // Assertions
        $this->assertTrue($result['success']);
        $this->assertEquals('testword', $result['word']);
        $this->assertArrayHasKey('expiry', $result['expiry']);
    }

    public function testGetStatsReturnsCorrectStats()
    {
        // Insert a mock stat into the database
        $this->db->query("INSERT INTO stats (browser_id, played, won) VALUES ('test-browser', 5, 3)");

        // Call the function
        $result = get_stats($this->db, 'test-browser', []);

        // Assertions
        $this->assertTrue($result['success']);
        $this->assertEquals(5, $result['played']);
        $this->assertEquals(3, $result['won']);
    }

    public function testUpdateStatsIncrementsStatsCorrectly()
    {
        // Insert a mock stat into the database
        $this->db->query("INSERT INTO stats (browser_id, played, won) VALUES ('test-browser', 2, 1)");

        // Mock input data
        $data = ['played' => 1, 'won' => 1];

        // Call the function
        $result = update_stats($this->db, 'test-browser', $data);

        // Assertions
        $this->assertTrue($result['success']);
        $this->assertEquals(3, $result['played']);
        $this->assertEquals(2, $result['won']);

        // Verify database values
        $stats = $this->db->query("SELECT played, won FROM stats WHERE browser_id = 'test-browser'")->fetch_assoc();
        $this->assertEquals(3, $stats['played']);
        $this->assertEquals(2, $stats['won']);
    }

    protected function tearDown(): void
    {
        // Close the database connection
        if ($this->db) {
            $this->db->close();
        }
    }
}