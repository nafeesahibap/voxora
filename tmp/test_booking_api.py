import requests
import json

base_url = "http://localhost:8000/api/v1/booking"

def test_flight_search():
    payload = {
        "origin": "JFK",
        "destination": "LHR",
        "departureDate": "2026-06-01",
        "adults": 1
    }
    try:
        response = requests.post(f"{base_url}/flights/search", json=payload)
        print(f"Flight Search Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Flight Search Error: {e}")

def test_hotel_search():
    payload = {
        "cityCode": "PAR",
        "checkInDate": "2026-06-01",
        "checkOutDate": "2026-06-05",
        "adults": 1
    }
    try:
        response = requests.post(f"{base_url}/hotels/search", json=payload)
        print(f"Hotel Search Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Hotel Search Error: {e}")

if __name__ == "__main__":
    test_flight_search()
    test_hotel_search()
