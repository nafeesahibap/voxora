const BASE_URL = "/api/v1/market";
let chartInstance = null;
let currentSymbol = "AAPL";
let currentRange = "1D";

document.addEventListener("DOMContentLoaded", () => {
    // Initial data load
    fetchStockData(currentSymbol);

    // Search listener
    document.getElementById("searchBtn").addEventListener("click", () => {
        const symbol = document.getElementById("symbolInput").value.trim().toUpperCase();
        if (symbol) {
            currentSymbol = symbol;
            fetchStockData(symbol);
        }
    });

    document.getElementById("symbolInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            document.getElementById("searchBtn").click();
        }
    });

    // Range selector listeners
    document.querySelectorAll(".range-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".range-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentRange = btn.getAttribute("data-range");
            fetchHistory(currentSymbol, currentRange);
        });
    });
});

async function fetchStockData(symbol) {
    hideError();
    // Fetch quote and history in parallel
    Promise.all([
        fetchQuote(symbol),
        fetchHistory(symbol, currentRange)
    ]);
}

async function fetchQuote(symbol) {
    try {
        const response = await fetch(`${BASE_URL}/quote/${symbol}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to fetch stock quote");
        }
        const data = await response.json();
        updateQuoteUI(data);
    } catch (err) {
        showError(err.message);
    }
}

async function fetchHistory(symbol, range) {
    try {
        const response = await fetch(`${BASE_URL}/history/${symbol}?range=${range}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to fetch market history");
        }
        const data = await response.json();
        updateChart(data);
        document.getElementById("chartTitle").innerText = `Market Performance (${symbol})`;
    } catch (err) {
        showError(err.message);
    }
}

function updateQuoteUI(data) {
    const priceEl = document.getElementById("stockPrice");
    const changeEl = document.getElementById("stockChange");
    const changePctEl = document.getElementById("stockChangePct");
    const volEl = document.getElementById("stockVolume");
    const currEl = document.getElementById("stockCurrency");

    priceEl.innerText = `${data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    currEl.innerText = data.currency;

    const sign = data.change >= 0 ? "+" : "";
    changeEl.innerText = `${sign}${data.change.toFixed(2)}`;
    changePctEl.innerText = `${sign}${data.change_percent.toFixed(2)}%`;

    if (data.change >= 0) {
        changeEl.className = "stock-stat-val price-up";
        changePctEl.className = "price-up";
    } else {
        changeEl.className = "stock-stat-val price-down";
        changePctEl.className = "price-down";
    }

    volEl.innerText = data.volume ? data.volume.toLocaleString() : "N/A";
}

function updateChart(data) {
    const ctx = document.getElementById("marketChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    const isUp = (data.prices[data.prices.length - 1] >= data.prices[0]);
    const color = isUp ? "6, 182, 212" : "248, 113, 113"; // Cyan vs Red

    gradient.addColorStop(0, `rgba(${color}, 0.2)`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: data.symbol,
                data: data.prices,
                borderColor: `rgb(${color})`,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: `rgb(${color})`,
                pointHoverBorderColor: "#fff",
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#94a3b8',
                    bodyColor: '#f1f5f9',
                    borderColor: `rgba(${color}, 0.3)`,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return `$${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#64748b',
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8
                    }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#64748b',
                        callback: function (value) {
                            return '$' + value;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function showError(msg) {
    const errDiv = document.getElementById("errorMessage");
    errDiv.innerText = msg;
    errDiv.style.display = "block";
}

function hideError() {
    const errDiv = document.getElementById("errorMessage");
    errDiv.style.display = "none";
}
