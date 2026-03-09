document.addEventListener("DOMContentLoaded", function () {
    const generateBtn = document.getElementById("generateBtn");
    const itineraryForm = document.getElementById("itineraryForm");
    const outputSection = document.getElementById("outputSection");

    if (generateBtn) {
        generateBtn.addEventListener("click", function () {
            // Check form validity
            if (!itineraryForm.checkValidity()) {
                itineraryForm.reportValidity();
                return;
            }

            // Capture form data
            const data = {
                destination: document.getElementById("destination").value,
                startDate: document.getElementById("startDate").value,
                endDate: document.getElementById("endDate").value,
                tripType: document.getElementById("tripType").value,
                travelers: document.getElementById("travelers").value,
                budget: document.getElementById("budgetSlider").value
            };

            // Show output section
            outputSection.style.display = "flex";

            // Render Results
            renderOverview(data);
            renderFlights(data);
            renderHotels(data);
            renderDailyPlan(data);

            // Scroll to results
            outputSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

function renderOverview(data) {
    const container = document.getElementById("overviewResults");
    container.innerHTML = `
        <div class="overview-stat"><label>Destination</label><span>${data.destination}</span></div>
        <div class="overview-stat"><label>Dates</label><span>${data.startDate} to ${data.endDate}</span></div>
        <div class="overview-stat"><label>Trip Type</label><span>${data.tripType}</span></div>
        <div class="overview-stat"><label>Travelers</label><span>${data.travelers}</span></div>
        <div class="overview-stat"><label>Budget</label><span style="color: var(--accent-primary)">$${parseInt(data.budget).toLocaleString()}</span></div>
    `;
}

function renderFlights(data) {
    const container = document.getElementById("flightResults");
    const estimatedCost = (data.budget * 0.3 / data.travelers).toFixed(0);
    container.innerHTML = `
        <div class="plan-item">
            <div class="plan-day-circle"><i class="ph ph-airplane"></i></div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="color: var(--accent-primary);">SkyLink Airways</h4>
                    <span style="font-family: 'Roboto Mono';">$${parseInt(estimatedCost).toLocaleString()} / person</span>
                </div>
                <p style="margin-top: 0.5rem; color: var(--text-secondary);">Departure: ${data.startDate} 08:30 AM</p>
                <p style="color: var(--text-secondary);">Arrival: ${data.startDate} 11:45 AM</p>
            </div>
        </div>
    `;
}

function renderHotels(data) {
    const container = document.getElementById("hotelResults");
    const pricePerNight = (data.budget * 0.4 / 4).toFixed(0); // Mocking 4 nights
    container.innerHTML = `
        <div class="plan-item" style="border-left-color: var(--accent-secondary);">
            <div class="plan-day-circle" style="background: var(--accent-secondary);"><i class="ph ph-buildings"></i></div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="color: var(--accent-secondary);">Grand Voxora Plaza</h4>
                    <span style="color: #fbbf24;">★★★★★</span>
                </div>
                <p style="margin-top: 0.5rem; color: var(--text-secondary);">Location: ${data.destination} Center</p>
                <p style="color: var(--text-primary); font-weight: 600; margin-top: 0.5rem;">$${parseInt(pricePerNight).toLocaleString()} / night</p>
            </div>
        </div>
    `;
}

function renderDailyPlan(data) {
    const container = document.getElementById("dailyPlanResults");
    container.innerHTML = `
        <div class="plan-item">
            <div class="plan-day-circle">1</div>
            <div>
                <h4 style="margin-bottom: 0.5rem;">Arrival and check-in</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted);">Arrive at ${data.destination}, transfer to hotel, and explore the immediate neighborhood.</p>
            </div>
        </div>
        <div class="plan-item">
            <div class="plan-day-circle">2</div>
            <div>
                <h4 style="margin-bottom: 0.5rem;">Activities and sightseeing</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted);">Guided tour of local landmarks followed by a cultural dinner experience.</p>
            </div>
        </div>
        <div class="plan-item">
            <div class="plan-day-circle">3</div>
            <div>
                <h4 style="margin-bottom: 0.5rem;">${data.tripType === 'Business' ? 'Meetings and Networking' : 'Tourist visits and Relaxation'}</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted);">Full day dedicated to ${data.tripType === 'Business' ? 'professional engagements' : 'leisure and local exploration'}.</p>
            </div>
        </div>
        <div class="plan-item">
            <div class="plan-day-circle">F</div>
            <div>
                <h4 style="margin-bottom: 0.5rem;">Return travel</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted);">Final souvenir shopping and transfer to airport for return flight.</p>
            </div>
        </div>
    `;
}
