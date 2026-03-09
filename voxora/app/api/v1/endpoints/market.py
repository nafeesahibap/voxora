"""
Market API
Provides stock market quote and historical data. Uses yfinance if available,
with a graceful mock fallback if not installed or if the symbol is invalid.
"""
from fastapi import APIRouter, HTTPException
import random
import math
from datetime import datetime, timedelta

router = APIRouter()


def _get_yf():
    try:
        import yfinance as yf
        return yf
    except ImportError:
        return None


def _mock_quote(symbol: str) -> dict:
    """Return plausible-looking mock data for demonstration."""
    seed = sum(ord(c) for c in symbol)
    rng = random.Random(seed)
    price = round(rng.uniform(50, 800), 2)
    change = round(rng.uniform(-15, 15), 2)
    change_pct = round((change / price) * 100, 2)
    return {
        "symbol": symbol,
        "price": price,
        "change": change,
        "change_percent": change_pct,
        "volume": rng.randint(500_000, 50_000_000),
        "currency": "USD",
        "source": "mock"
    }


def _mock_history(symbol: str, range_str: str) -> dict:
    """Return mock historical price data for Chart.js."""
    range_map = {"1D": 1, "5D": 5, "1M": 30, "3M": 90, "1Y": 365}
    days = range_map.get(range_str, 30)

    seed = sum(ord(c) for c in symbol)
    rng = random.Random(seed)
    price = rng.uniform(50, 800)

    labels = []
    prices = []
    now = datetime.utcnow()

    points = min(days * 6, 200) if days <= 5 else days
    for i in range(points):
        ts = now - timedelta(minutes=(points - i) * (1440 // points))
        labels.append(ts.strftime("%b %d %H:%M") if days <= 5 else ts.strftime("%b %d"))
        price += rng.uniform(-3, 3)
        prices.append(round(max(price, 1), 2))

    return {"symbol": symbol, "labels": labels, "prices": prices}


@router.get("/quote/{symbol}")
def get_quote(symbol: str):
    """Fetch real-time stock quote. Falls back to mock data if yfinance is unavailable."""
    symbol = symbol.upper()
    yf = _get_yf()

    if yf:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            price = info.get("currentPrice") or info.get("regularMarketPrice")
            if price is None:
                raise ValueError("No price data")

            change = info.get("regularMarketChange", 0)
            change_pct = info.get("regularMarketChangePercent", 0)
            volume = info.get("regularMarketVolume", 0)
            currency = info.get("currency", "USD")

            return {
                "symbol": symbol,
                "price": round(float(price), 2),
                "change": round(float(change), 2),
                "change_percent": round(float(change_pct), 2),
                "volume": volume,
                "currency": currency,
                "source": "live"
            }
        except Exception:
            pass  # Fall through to mock

    return _mock_quote(symbol)


@router.get("/history/{symbol}")
def get_history(symbol: str, range: str = "1M"):
    """Fetch historical price data for charting. Falls back to mock if unavailable."""
    symbol = symbol.upper()
    range_map = {"1D": "1d", "5D": "5d", "1M": "1mo", "3M": "3mo", "1Y": "1y"}
    interval_map = {"1D": "5m", "5D": "15m", "1M": "1d", "3M": "1d", "1Y": "1wk"}

    yf = _get_yf()
    if yf:
        try:
            ticker = yf.Ticker(symbol)
            period = range_map.get(range, "1mo")
            interval = interval_map.get(range, "1d")
            hist = ticker.history(period=period, interval=interval)

            if hist.empty:
                raise ValueError("No history data")

            labels = [str(idx.strftime("%b %d %H:%M") if range in ["1D", "5D"] else idx.strftime("%b %d"))
                      for idx in hist.index]
            prices = [round(float(p), 2) for p in hist["Close"].tolist()]

            return {"symbol": symbol, "labels": labels, "prices": prices}
        except Exception:
            pass

    return _mock_history(symbol, range)
