import sqlite3
import os

db_path = 'voice_assistant.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Starting migration...")

# Update candidate table
cols_to_add = [
    ("application_source", "VARCHAR(50) DEFAULT 'manual'"),
    ("applied_via_link", "BOOLEAN DEFAULT 0"),
    ("application_date", "TIMESTAMP")
]

for col_name, col_type in cols_to_add:
    try:
        cursor.execute(f"ALTER TABLE candidate ADD COLUMN {col_name} {col_type}")
        print(f"Added {col_name} to candidate")
    except Exception as e:
        print(f"Skipped {col_name} in candidate: {e}")

# Update resume table
cols_to_add_resume = [
    ("job_posting_id", "VARCHAR(255)"),
    ("upload_source", "VARCHAR(50) DEFAULT 'manual'"),
    ("ip_address", "VARCHAR(45)"),
    ("user_agent", "TEXT"),
    ("is_notified", "BOOLEAN DEFAULT 0")
]

for col_name, col_type in cols_to_add_resume:
    try:
        cursor.execute(f"ALTER TABLE resume ADD COLUMN {col_name} {col_type}")
        print(f"Added {col_name} to resume")
    except Exception as e:
        print(f"Skipped {col_name} in resume: {e}")

# Create notification table
try:
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notification (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        candidate_id VARCHAR(255),
        job_posting_id VARCHAR(255),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
    )
    """)
    print("Created notification table")
except Exception as e:
    print(f"Notification table error: {e}")

conn.commit()
conn.close()
print("Migration complete.")
