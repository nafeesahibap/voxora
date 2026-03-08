from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from amadeus import Client, ResponseError
from app.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize Amadeus client
amadeus = None
if settings.AMADEUS_CLIENT_ID and settings.AMADEUS_CLIENT_SECRET:
    amadeus = Client(
        client_id=settings.AMADEUS_CLIENT_ID,
        client_secret=settings.AMADEUS_CLIENT_SECRET
    )

class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departureDate: str
    adults: int = 1

class HotelSearchRequest(BaseModel):
    cityCode: str
    checkInDate: str
    checkOutDate: str
    adults: int = 1

@router.post("/flights/search")
async def search_flights(request: FlightSearchRequest):
    logger.info(f"Received flight search request: {request}")
    if not amadeus:
        logger.warning("Amadeus API keys missing - using dummy flight data")
        return get_dummy_flights(request)
    
    try:
        response = amadeus.shopping.flight_offers_search.get(
            originLocationCode=request.origin,
            destinationLocationCode=request.destination,
            departureDate=request.departureDate,
            adults=request.adults
        )
        logger.info(f"Successfully fetched {len(response.data)} flight offers from Amadeus")
        return response.data
    except ResponseError as error:
        logger.error(f"Amadeus API error: {error}")
        raise HTTPException(status_code=500, detail="Failed to fetch flight offers from Amadeus.")

@router.post("/hotels/search")
async def search_hotels(request: HotelSearchRequest):
    logger.info(f"Received hotel search request: {request}")
    if not amadeus:
        logger.warning("Amadeus API keys missing - using dummy hotel data")
        return get_dummy_hotels(request)
    
    try:
        # First find hotels in the city
        hotels_response = amadeus.reference_data.locations.hotels.by_city.get(cityCode=request.cityCode)
        hotel_ids = [hotel['hotelId'] for hotel in hotels_response.data[:10]]
        logger.info(f"Found {len(hotel_ids)} hotels in city {request.cityCode}")
        
        if not hotel_ids:
            return []

        # Then get offers for those hotels
        offers_response = amadeus.shopping.hotel_offers_search.get(
            hotelIds=','.join(hotel_ids),
            adults=request.adults,
            checkInDate=request.checkInDate,
            checkOutDate=request.checkOutDate
        )
        logger.info(f"Successfully fetched {len(offers_response.data)} hotel offers from Amadeus")
        return offers_response.data
    except ResponseError as error:
        logger.error(f"Amadeus API error: {error}")
        raise HTTPException(status_code=500, detail="Failed to fetch hotel offers from Amadeus.")

def get_dummy_flights(request):
    return [
        {
            "id": "1",
            "itineraries": [{"duration": "PT2H30M", "segments": [{"carrierCode": "6E", "departure": {"at": f"{request.departureDate}T06:30:00"}, "arrival": {"at": f"{request.departureDate}T09:00:00"}}]}],
            "price": {"total": "4500", "currency": "INR"},
            "airline": "Indigo" # Mocked for frontend easy access
        },
        {
            "id": "2",
            "itineraries": [{"duration": "PT2H15M", "segments": [{"carrierCode": "AI", "departure": {"at": f"{request.departureDate}T09:45:00"}, "arrival": {"at": f"{request.departureDate}T12:00:00"}}]}],
            "price": {"total": "5200", "currency": "INR"},
            "airline": "Air India"
        }
    ]

def get_dummy_hotels(request):
    return [
        {
            "hotel": {"name": "Grand Palace Hotel", "rating": 5, "cityCode": request.cityCode, "address": {"lines": ["Main Street 123"]}},
            "offers": [{"price": {"total": "7500", "currency": "INR"}}],
            "hotelId": "GPH123"
        },
        {
            "hotel": {"name": "City Breez Inn", "rating": 3, "cityCode": request.cityCode, "address": {"lines": ["Side Street 456"]}},
            "offers": [{"price": {"total": "2500", "currency": "INR"}}],
            "hotelId": "CBI456"
        }
    ]
