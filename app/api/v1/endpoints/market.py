from fastapi import APIRouter, HTTPException, Query
import yfinance as yf
from typing import List, Dict, Any
import pandas as pd
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        # ticker.info can be slow and sometimes unreliable for all fields, 
        # but it's the most comprehensive source in yfinance.
        # We'll try to get essential data.
        info = ticker.info
        
        # Fallback if info is empty (common for invalid symbols or API issues)
        if not info or 'regularMarketPrice' not in info and 'currentPrice' not in info:
            # Try history to see if it's a valid symbol
            hist = ticker.history(period="1d")
            if hist.empty:
                raise HTTPException(status_code=404, detail=f"Symbol '{symbol}' not found.")
            
            # Extract from history if info failed
            current_price = hist['Close'].iloc[-1]
            prev_close = ticker.info.get('previousClose') or current_price # Fallback
            change = 0
            change_percent = 0
            volume = hist['Volume'].iloc[-1]
        else:
            current_price = info.get('currentPrice') or info.get('regularMarketPrice')
            prev_close = info.get('previousClose') or info.get('regularMarketPreviousClose')
            change = current_price - prev_close if current_price and prev_close else 0
            change_percent = (change / prev_close * 100) if prev_close else 0
            volume = info.get('volume') or info.get('regularMarketVolume')

        return {
            "symbol": symbol.upper(),
            "name": info.get('longName') or info.get('shortName') or symbol.upper(),
            "price": round(current_price, 2) if current_price else 0,
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "volume": volume,
            "currency": info.get('currency', 'USD'),
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Symbol '{symbol}' not found.")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{symbol}")
async def get_stock_history(symbol: str, range: str = Query("1D", regex="^(1D|1W|1M|1Y)$")):
    # Mapping our UI ranges to yfinance periods and intervals
    range_map = {
        "1D": {"period": "1d", "interval": "5m"},
        "1W": {"period": "5d", "interval": "30m"},
        "1M": {"period": "1mo", "interval": "1d"},
        "1Y": {"period": "1y", "interval": "1wk"}
    }
    
    config = range_map.get(range)
    
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=config["period"], interval=config["interval"])
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No history found for '{symbol}'.")
        
        # Reset index to get datetime as a column
        hist = hist.reset_index()
        
        # Format for Chart.js
        # We need labels (timestamps) and data (prices)
        labels = []
        for dt in hist['Datetime' if 'Datetime' in hist.columns else 'Date']:
            if range == "1D" or range == "1W":
                labels.append(dt.strftime("%H:%M"))
            else:
                labels.append(dt.strftime("%Y-%m-%d"))
                
        prices = [round(p, 2) for p in hist['Close'].tolist()]
        
        return {
            "symbol": symbol.upper(),
            "range": range,
            "labels": labels,
            "prices": prices
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
