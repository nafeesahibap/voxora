import sqlite3
import sys
conn = sqlite3.connect('voxora.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables:", c.fetchall())

try:
    c.execute("PRAGMA table_info(task);")
    print("Table task columns:", c.fetchall())
except Exception as e:
    pass

try:
    c.execute("PRAGMA table_info(tasks);")
    print("Table tasks columns:", c.fetchall())
except Exception as e:
    pass

conn.close()
