import os
from fastapi import FastAPI, Request, Header
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio
from typing import Optional
import time

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 사용자가 제공한 GoldAPI Key
GOLD_API_KEY = "goldapi-0ccbdb10951634be3a560df94a02e56d-io"

# 캐시 저장소 (메모리)
cache = {
    "metals": None,
    "rates": None,
    "last_updated": 0
}

CACHE_EXPIRE = 60  # 1분 캐시

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

async def fetch_gold_api(symbol: str):
    url = f"https://www.goldapi.io/api/{symbol}/USD"
    headers = {"x-access-token": GOLD_API_KEY, "Content-Type": "application/json"}
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                print(f"DEBUG: {symbol} response: {data}")
                return data.get("price")
            else:
                print(f"DEBUG: {symbol} error {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
    return None

@app.get("/api/init")
async def init_data(request: Request, accept_language: Optional[str] = Header(None)):
    # 1. 언어 및 국가 감지
    lang = "en"
    country = "US"
    
    if accept_language:
        first_lang = accept_language.split(",")[0].lower()
        if "ko" in first_lang: lang = "ko"; country = "KR"
        elif "ja" in first_lang: lang = "ja"; country = "JP"
        elif "zh" in first_lang: lang = "zh"; country = "CN"

    # 시간대 매핑
    tz_map = {
        "KR": "Asia/Seoul",
        "JP": "Asia/Tokyo",
        "CN": "Asia/Shanghai",
        "US": "America/New_York"
    }
    timezone = tz_map.get(country, "UTC")

    # 2. 시세 데이터 가져오기 (실제 API 연동)
    current_time = time.time()
    if not cache["metals"] or (current_time - cache["last_updated"] > CACHE_EXPIRE):
        symbols = ["XAU", "XAG", "XPT", "XPD"]
        prices = await asyncio.gather(*(fetch_gold_api(s) for s in symbols))
        
        cache["metals"] = {
            "gold": prices[0] or 2350.50,
            "silver": prices[1] or 28.20,
            "platinum": prices[2] or 950.00,
            "palladium": prices[3] or 1050.00
        }
        
        # 차트 데이터 생성 및 캐싱 (시세 갱신 시에만 새로 생성)
        def generate_chart_data(base_price):
            import random
            from datetime import datetime, timedelta
            periods = {
                "1D": {"points": 24, "delta": timedelta(hours=1), "format": "%H:%M"},
                "1W": {"points": 7, "delta": timedelta(days=1), "format": "%m/%d"},
                "1M": {"points": 30, "delta": timedelta(days=1), "format": "%m/%d"},
                "1Y": {"points": 12, "delta": timedelta(days=30), "format": "%Y/%m"}
            }
            all_data = {}
            for p_name, p_info in periods.items():
                data = []
                now = datetime.now()
                for i in range(p_info["points"]):
                    date_point = now - p_info["delta"] * (p_info["points"] - 1 - i)
                    data.append({
                        "label": date_point.strftime(p_info["format"]),
                        "price": base_price + random.uniform(-base_price*0.03, base_price*0.03)
                    })
                all_data[p_name] = data
            return all_data

        cache["charts"] = {
            metal: generate_chart_data(cache["metals"][metal])
            for metal in ["gold", "silver", "platinum", "palladium"]
        }
        
        try:
            async with httpx.AsyncClient() as client:
                rate_resp = await client.get("https://open.er-api.com/v6/latest/USD")
                if rate_resp.status_code == 200:
                    cache["rates"] = rate_resp.json().get("rates")
        except Exception:
            cache["rates"] = {"KRW": 1380.0, "JPY": 155.0, "CNY": 7.25, "USD": 1.0}
            
        cache["last_updated"] = current_time

    return {
        "lang": lang,
        "country": country,
        "timezone": timezone,
        "prices": cache["metals"],
        "rates": cache["rates"],
        "charts": cache["charts"],
        "unit": "oz",
        "fetched_at": cache["last_updated"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
