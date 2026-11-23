from fastapi import FastAPI, HTTPException
import requests
import uvicorn
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ffinfo")
async def get_ff_info(uid: str):
    if not uid or not uid.isdigit():
        raise HTTPException(status_code=400, detail="Invalid UID format. Must be numbers.")
    
    payload = {"app_id": 100067, "login_id": str(uid)}
    headers = {"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}

    try:
        response = requests.post("https://topup.pk/api/auth/player_id_login", json=payload, headers=headers, timeout=10, verify=False)
        data = response.json()
        
        if "open_id" in data:
            return {
                "status": "success",
                "uid": uid,
                "open_id": data.get("open_id"),
                "region": data.get("region", "N/A"),
                "message": "Player found"
            }
        else:
            raise HTTPException(status_code=404, detail="Player not found or invalid UID")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
