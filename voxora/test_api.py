import urllib.request
import json
import traceback
import sys

# Test manual task creation
data = {
    "title": "Test Local DB Sync",
    "priority": "medium",
    "category": "general",
    "status": "pending"
}

req = urllib.request.Request(
    'http://localhost:8000/api/v1/tasks/',
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    response = urllib.request.urlopen(req)
    print("SUCCESS")
    print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Exception: {str(e)}")
