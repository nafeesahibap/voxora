import requests
try:
    r = requests.head("http://localhost:8000/css/styles.css")
    print(f"Status: {r.status_code}")
    print(f"Content-Type: {r.headers.get('Content-Type')}")
except Exception as e:
    print(e)
