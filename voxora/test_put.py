import urllib.request
import json
import traceback
import sys

# 1. Create task
data = {
    "title": "Test Update Debug",
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
    res = urllib.request.urlopen(req)
    task = json.loads(res.read().decode('utf-8'))
    print("Created:", task['id'])
    
    # 2. Update status
    update_data = {
        "status": "completed",
    }
    req2 = urllib.request.Request(
        f"http://localhost:8000/api/v1/tasks/{task['id']}",
        data=json.dumps(update_data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method="PUT"
    )
    res2 = urllib.request.urlopen(req2)
    print("Updated:", json.loads(res2.read().decode('utf-8')))

    # 3. Voice complete
    voice_update = {
        "text": "test update debug done"
    }
    req3 = urllib.request.Request(
        'http://localhost:8000/api/v1/tasks/voice',
        data=json.dumps(voice_update).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method="POST"
    )
    res3 = urllib.request.urlopen(req3)
    print("Voice updated:", json.loads(res3.read().decode('utf-8')))

except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Exception: {str(e)}")
