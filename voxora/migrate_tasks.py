import sqlite3
import os

db_path = 'voice_assistant.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Migrating task table...")

# 1. Rename existing table
try:
    cursor.execute("ALTER TABLE task RENAME TO task_old")
    print("Renamed task to task_old")
except Exception as e:
    print(f"Rename failed: {e}")
    # If it fails, maybe table doesn't exist or already renamed
    pass

# 2. Create new table with correct schema
cursor.execute("""
CREATE TABLE task (
    id VARCHAR PRIMARY KEY,
    title VARCHAR,
    description VARCHAR,
    priority VARCHAR,
    status VARCHAR DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    date DATETIME,
    category VARCHAR,
    candidate VARCHAR,
    voice_created VARCHAR DEFAULT 'false',
    owner_id INTEGER,
    created_at DATETIME,
    FOREIGN KEY(owner_id) REFERENCES user (id)
)
""")
print("Created new task table")

# 3. Create index for title
cursor.execute("DROP INDEX IF EXISTS ix_task_title")
cursor.execute("CREATE INDEX ix_task_title ON task (title)")
print("Created index ix_task_title")

# 4. Attempt to migrate some data if possible (only title and status are common)
try:
    cursor.execute("""
    INSERT INTO task (id, title, description, status, owner_id, created_at, priority, progress, category, voice_created)
    SELECT CAST(id AS VARCHAR), title, description, status, owner_id, created_at, 'medium', 0, 'general', 'false'
    FROM task_old
    """)
    print("Migrated data from task_old to task")
except Exception as e:
    print(f"Data migration warning: {e}")

# 5. Drop old table
try:
    cursor.execute("DROP TABLE task_old")
    print("Dropped task_old")
except Exception as e:
    print(f"Drop failed: {e}")

conn.commit()
conn.close()
print("Task table migration complete.")
