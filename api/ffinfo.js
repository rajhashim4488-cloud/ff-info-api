export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

    const uid = req.query.uid;
    if (!uid || !/^\d+$/.test(uid)) {
        return res.status(400).json({ error: "Valid numeric UID required" });
    }

    const payload = { app_id: 100067, login_id: String(uid) };
    const headers = { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" };

    const endpoints = [
        "https://topup.pk/api/auth/player_id_login",
        "https://topup.garena.com/api/auth/player_id_login",
        "https://prod-api.reward.ff.garena.com/redemption/api/auth/inspect_token/"
    ];

    for (const url of endpoints) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.open_id) {
                    return res.status(200).json({
                        status: "success",
                        uid: uid,
                        open_id: data.open_id,
                        region: data.region || "N/A",
                        message: "Player found"
                    });
                }
            }
        } catch (err) {
            continue;
        }
    }

    return res.status(404).json({ error: "Player not found or all endpoints failed" });
      }
