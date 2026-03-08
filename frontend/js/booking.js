// Ensure DOM is fully loaded before attaching listeners
document.addEventListener("DOMContentLoaded", function () {
    console.log("Booking JS loaded and DOM ready");

    const flightForm = document.getElementById("flightForm");
    const hotelForm = document.getElementById("hotelForm");

    if (flightForm) {
        flightForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            console.log("Flight search submitted");

            const searchData = {
                origin: document.getElementById("origin").value.toUpperCase(),
                destination: document.getElementById("destination").value.toUpperCase(),
                departureDate: document.getElementById("departureDate").value,
                adults: parseInt(document.getElementById("adults").value)
            };

            const loader = document.getElementById("searchLoader");
            const results = document.getElementById("searchResults");

            if (loader) loader.style.display = "block";
            if (results) results.innerHTML = "";

            try {
                console.log("Fetching flights with data:", searchData);
                const response = await fetch("/api/v1/booking/flights/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(searchData)
                });

                console.log("Flight search response status:", response.status);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Search failed: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                console.log("Flight search results received:", data);
                renderFlightResults(data);
            } catch (error) {
                console.error("Flight search error:", error);
                if (results) {
                    results.innerHTML = `<div class="card card-g-12" style="text-align: center; color: var(--text-muted);">
                        <p>Search failed. Please try again.</p>
                        <p style="font-size: 0.7rem; margin-top: 0.5rem;">${error.message}</p>
                    </div>`;
                }
            } finally {
                if (loader) loader.style.display = "none";
            }
        });
    }

    if (hotelForm) {
        hotelForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            console.log("Hotel search submitted");

            const searchData = {
                cityCode: document.getElementById("cityCode").value.toUpperCase(),
                checkInDate: document.getElementById("checkInDate").value,
                checkOutDate: document.getElementById("checkOutDate").value,
                adults: parseInt(document.getElementById("hotelAdults").value)
            };

            const loader = document.getElementById("searchLoader");
            const results = document.getElementById("searchResults");

            if (loader) loader.style.display = "block";
            if (results) results.innerHTML = "";

            try {
                console.log("Fetching hotels with data:", searchData);
                const response = await fetch("/api/v1/booking/hotels/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(searchData)
                });

                console.log("Hotel search response status:", response.status);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Search failed: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                console.log("Hotel search results received:", data);
                renderHotelResults(data);
            } catch (error) {
                console.error("Hotel search error:", error);
                if (results) {
                    results.innerHTML = `<div class="card card-g-12" style="text-align: center; color: var(--text-muted);">
                        <p>Search failed. Please try again.</p>
                        <p style="font-size: 0.7rem; margin-top: 0.5rem;">${error.message}</p>
                    </div>`;
                }
            } finally {
                if (loader) loader.style.display = "none";
            }
        });
    }
});

function switchTab(tab) {
    const flightForm = document.getElementById('flightForm');
    const hotelForm = document.getElementById('hotelForm');
    const tabFlights = document.getElementById('tabFlights');
    const tabHotels = document.getElementById('tabHotels');

    if (tab === 'flights') {
        if (flightForm) flightForm.style.display = 'block';
        if (hotelForm) hotelForm.style.display = 'none';
        tabFlights.classList.add('active');
        tabHotels.classList.remove('active');
        tabFlights.style.color = 'var(--accent-primary)';
        tabHotels.style.color = 'var(--text-secondary)';
    } else {
        if (flightForm) flightForm.style.display = 'none';
        if (hotelForm) hotelForm.style.display = 'block';
        tabFlights.classList.remove('active');
        tabHotels.classList.add('active');
        tabFlights.style.color = 'var(--text-secondary)';
        tabHotels.style.color = 'var(--accent-primary)';
    }
    // Clear results when switching
    const results = document.getElementById('searchResults');
    if (results) results.innerHTML = '';
}

function renderFlightResults(data) {
    console.log("Rendering flight results...");
    const results = document.getElementById("searchResults");
    if (!results) return;

    if (!data || data.length === 0) {
        results.innerHTML = `<div class="card card-g-12" style="text-align: center; color: var(--text-muted);">No flights found for this search.</div>`;
        return;
    }

    data.forEach(offer => {
        try {
            const itinerary = offer.itineraries[0];
            const departure = itinerary.segments[0].departure.at;
            const arrival = itinerary.segments[itinerary.segments.length - 1].arrival.at;
            const duration = itinerary.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm').toLowerCase();
            const price = offer.price ? `${offer.price.total} ${offer.price.currency}` : "N/A";
            const airline = offer.airline || (itinerary.segments[0].carrierCode);

            const card = document.createElement("div");
            card.className = "card card-g-4";
            card.innerHTML = `
                <div class="card-header">
                    <h4 style="color: var(--accent-primary);"><i class="ph ph-airplane"></i> ${airline}</h4>
                    <span style="font-family: 'Roboto Mono'; font-weight: 600;">${price}</span>
                </div>
                <div style="margin-top: 1rem;">
                    <p style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-secondary);">
                        <strong>Dep:</strong> ${new Date(departure).toLocaleString()}
                    </p>
                    <p style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-secondary);">
                        <strong>Arr:</strong> ${new Date(arrival).toLocaleString()}
                    </p>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Duration: ${duration}</p>
                </div>
                <button class="btn-full" style="margin-top: 1.5rem; width: 100%;" onclick="window.open('https://www.skyscanner.net', '_blank')">
                    View Booking
                </button>
            `;
            results.appendChild(card);
        } catch (e) {
            console.error("Error rendering flight card:", e, offer);
        }
    });
}

function renderHotelResults(data) {
    console.log("Rendering hotel results...");
    const results = document.getElementById("searchResults");
    if (!results) return;

    if (!data || data.length === 0) {
        results.innerHTML = `<div class="card card-g-12" style="text-align: center; color: var(--text-muted);">No hotels found for this search.</div>`;
        return;
    }

    data.forEach(offer => {
        try {
            const hotel = offer.hotel;
            const price = offer.offers ? `${offer.offers[0].price.total} ${offer.offers[0].price.currency}` : "N/A";
            const rating = hotel.rating ? "★".repeat(hotel.rating) : "";

            const card = document.createElement("div");
            card.className = "card card-g-4";
            card.innerHTML = `
                <div class="card-header">
                    <h4 style="color: var(--accent-secondary);"><i class="ph ph-buildings"></i> ${hotel.name}</h4>
                    <span style="color: #fbbf24; font-size: 0.8rem;">${rating}</span>
                </div>
                <div style="margin-top: 1rem;">
                    <p style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-secondary);">
                        <strong>Location:</strong> ${hotel.cityCode}
                    </p>
                    <p style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-top: 1rem;">
                        ${price} <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 400;">/ night</span>
                    </p>
                </div>
                <button class="btn-full" style="margin-top: 1.5rem; width: 100%; background: var(--accent-secondary);" onclick="window.open('https://www.booking.com', '_blank')">
                    View Hotel
                </button>
            `;
            results.appendChild(card);
        } catch (e) {
            console.error("Error rendering hotel card:", e, offer);
        }
    });
}
