const express = require("express")
const cors = require("cors")
const app = express()
app.use(cors())
const router = express.Router()
const port = process.env.PORT || 3000

const { Pool } = require("pg")
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "testuser",
  password: process.env.DB_PASSWORD || "Sup1nf0",
  database: process.env.DB_NAME || "mydb"
})

async function connectWithRetry(maxRetries = 5, interval = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.connect();
      console.log("Connected to PostgreSQL");
      return true;
    } catch (err) {
      console.log(`Failed to connect to PostgreSQL. Attempt ${i + 1}/${maxRetries}`);
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  return false;
}

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS number_facts (
        number VARCHAR(255) PRIMARY KEY,
        fact TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

async function saveFact(number, fact) {
  try {
    await pool.query(
      "INSERT INTO number_facts (number, fact) VALUES ($1, $2) ON CONFLICT (number) DO UPDATE SET fact = $2",
      [number, fact]
    );
    console.log(`Fact saved for number ${number}`);
  } catch (error) {
    console.error("Error saving fact:", error);
    throw error;
  }
}

async function getFact(number) {
  try {
    const result = await pool.query(
      "SELECT fact FROM number_facts WHERE number = $1",
      [number]
    );
    return result.rows[0]?.fact;
  } catch (error) {
    console.error("Error getting fact:", error);
    throw error;
  }
}

router.get("/facts/:number", async (req, res) => {
  const number = req.params.number;

  try {
    const existingFact = await getFact(number);

    if (existingFact) {
      console.log(`Retrieved fact for ${number} from database`);
      res.json({
        number,
        fact: existingFact,
        source: "database"
      });
    } else {
      const response = await fetch(`http://numbersapi.com/${number}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fact = await response.text();

      await saveFact(number, fact);

      res.json({
        number,
        fact,
        source: "api"
      });
    }
  } catch (error) {
    console.error(`Error processing request for number ${number}:`, error);
    res.status(500).json({
      error: "An error occurred while processing your request",
      details: error.message
    });
  }
});

router.get("/facts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT number, fact, created_at FROM number_facts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching all facts:", error);
    res.status(500).json({
      error: "An error occurred while fetching facts",
      details: error.message
    });
  }
});

app.use("/api", router)

const startServer = async () => {
  try {
    await connectWithRetry();
    await initializeDatabase();

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();