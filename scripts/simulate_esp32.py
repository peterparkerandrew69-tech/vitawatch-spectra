"""
ESP32 Hardware Simulation Script for VitaWatch Spectra.
Transmits realistic biometric sensor packets to the VitaWatch Spectra ingestion endpoint.
"""

import sys
import time
import json
import urllib.request
import urllib.error
import random
from datetime import datetime, timezone

SERVER_URL = "http://127.0.0.1:5000/api/devices/ingest"
DEVICE_KEY = "esp32-spectra-gateway-key-2026"
DEVICE_ID = "ESP32-SPECTRA-A1"

def generate_packet():
    # Simulate realistic resting parameters
    hr = int(72 + 8 * random.uniform(-1, 1))
    spo2 = round(98.2 + random.uniform(-0.8, 1.2), 1)
    temp = round(36.6 + random.uniform(-0.2, 0.3), 1)
    gsr = round(1.25 + random.uniform(-0.15, 0.25), 2)
    
    # Gravitational 1g static resting
    ax = round(random.gauss(0.01, 0.02), 3)
    ay = round(random.gauss(0.01, 0.02), 3)
    az = round(random.gauss(0.98, 0.03), 3)

    return {
        "device_id": DEVICE_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "measurements": {
            "heart_rate": hr,
            "spo2": min(100.0, spo2),
            "blood_pressure_sys": 118,
            "blood_pressure_dia": 76,
            "temperature": temp,
            "gsr": gsr,
            "accel": {"x": ax, "y": ay, "z": az},
            "gyro": {"x": 0.0, "y": 0.0, "z": 0.0}
        },
        "signal_quality": round(random.uniform(0.92, 0.99), 2),
        "is_simulated": False  # Hardware ingestion flag
    }

def send_packet(packet):
    data = json.dumps(packet).encode('utf-8')
    req = urllib.request.Request(
        SERVER_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-Device-Key": DEVICE_KEY
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = response.read().decode('utf-8')
            return json.loads(res_body)
    except urllib.error.HTTPError as e:
        print(f"[!] HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"[!] Connection failed: {e}")
        return None

def main():
    print(f">> VitaWatch Spectra ESP32 Ingestion Simulator")
    print(f">> Target endpoint: {SERVER_URL}")
    print(f">> Device ID: {DEVICE_ID}")
    
    count = 10
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        count = int(sys.argv[1])

    print(f">> Transmitting {count} telemetry frames (1 Hz)...")
    for i in range(count):
        pkt = generate_packet()
        m = pkt["measurements"]
        print(f"[{i+1}/{count}] Sending PPG HR: {m['heart_rate']} BPM | SpO2: {m['spo2']}% | Temp: {m['temperature']} C | GSR: {m['gsr']} uS | IMU Z: {m['accel']['z']}g ...", end="")
        res = send_packet(pkt)
        if res and res.get("status") == "success":
            print(" [OK: Ingested & Persisted]")
        else:
            print(" [FAILED]")
        if i < count - 1:
            time.sleep(1.0)

    print(">> Transmission complete.")

if __name__ == "__main__":
    main()
