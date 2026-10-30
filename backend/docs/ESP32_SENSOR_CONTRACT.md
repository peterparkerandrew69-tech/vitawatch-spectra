# VitaWatch Spectra — IoT ESP32 Sensor Ingestion Contract

## 1. Overview & Architecture

The **VitaWatch Spectra** hardware layer utilizes an **ESP32-S3** microcontroller as the central biotelemetry aggregator. Sensors communicate over I2C and OneWire buses, sample at dedicated frequencies, apply moving-window median filtering on-chip, and packetize readings before transmitting to the Flask Backend via Wi-Fi or BLE Companion Gateway.

```
+--------------------------------------------------------------------------+
|                  ESP32-S3 Biometric Wearable Hardware                    |
|                                                                          |
|  +------------------+  +------------------+  +-------------------------+ |
|  | MAX30102 (PPG)   |  | MPU6050 (6-IMU)  |  | DS18B20 (Skin Temp)    | |
|  | 100 Hz / I2C     |  | 50 Hz / I2C      |  | 1 Hz / OneWire          | |
|  +------------------+  +------------------+  +-------------------------+ |
|                            +------------------+                          |
|                            | GSR / EDA Sensor |                          |
|                            | 4 Hz / ADC1_CH0  |                          |
|                            +------------------+                          |
+--------------------------------------------------------------------------+
                                     |
                                     v
                      [On-Device Preprocessing & SNR Check]
                                     |
                 +-------------------+-------------------+
                 | (Wi-Fi HTTPS POST)                    | (BLE GATT Notify)
                 v                                       v
      [VitaWatch Flask Ingestion]              [Companion Mobile Gateway]
      POST /api/devices/ingest                           |
                 |                                       | (Authenticated POST)
                 +-------------------+-------------------+
                                     |
                                     v
                        [Database: VitalReadings]
                                     |
                                     +-----> [ML Baseline Service]
                                     |
                                     +-----> [Emergency Detection Service]
                                     |
                                     v
                        [SSE Stream: /api/stream/vitals]
                                     |
                                     v
                        [Next.js Dashboard Terminal]
```

---

## 2. Sensor Specifications & Sampling Expectations

| Sensor | Parameter | Physical Unit | Sampling Rate | Bus | Signal Quality Check | Missing Data Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MAX30102** | Heart Rate | Beats Per Minute (BPM) | 100 Hz raw -> 1 Hz packet | I2C (0x57) | Optical AC/DC ratio > 0.02 | Null / omit field; quality flag reduced |
| **MAX30102** | SpO2 | Percent (%) | 100 Hz raw -> 1 Hz packet | I2C (0x57) | R-curve calibration within [70, 100] | Null / omit field |
| **MPU6050** | Accelerometer (X, Y, Z) | Gravitational Units ($g$) | 50 Hz | I2C (0x68) | Static magnitude $\approx 1.0g$ at rest | Impute 0.0 for missing axis |
| **MPU6050** | Gyroscope (X, Y, Z) | Degrees per Second (°/s) | 50 Hz | I2C (0x68) | Bias calibration on boot | Impute 0.0 |
| **DS18B20** | Epidermal Temperature | Degrees Celsius (°C) | 1 Hz | OneWire (GPIO 4) | Range check [28.0°C, 43.0°C] | Mark stale; fallback to last reading |
| **Analog GSR** | Galvanic Conductance | MicroSiemens ($\mu\text{S}$) | 4 Hz | ADC1 (GPIO 34) | Baseline impedance $> 10\,\text{k}\Omega$ | Omit field |

---

## 3. Ingestion Endpoint Specification

- **Endpoint**: `POST /api/devices/ingest`
- **Authentication**: Requires per-device token or bearer header:
  - Header: `X-Device-Token: <device_token>` **OR** `Authorization: Bearer <device_token>`
- **Content-Type**: `application/json`

### Request Schema

```json
{
  "device_id": "ESP32-SPECTRA-A1",
  "device_token": "esp32_spectra_test_secret_2026",
  "battery_level": 89,
  "readings": [
    {
      "timestamp": "2026-10-30T14:40:00.000Z",
      "heart_rate": 72.5,
      "spo2": 98.4,
      "temperature": 36.6,
      "gsr": 1.35,
      "accel": { "x": 0.02, "y": 0.01, "z": 0.98 },
      "gyro": { "x": 0.1, "y": -0.2, "z": 0.05 },
      "signal_quality": 0.94,
      "is_simulated": false
    }
  ]
}
```

### Response Schema

```json
{
  "status": "success",
  "message": "1 sensor packets ingested successfully",
  "data": {
    "ingested_count": 1,
    "device_status": "online",
    "provenance": "LIVE SENSOR DATA"
  }
}
```

---

## 4. Signal Quality & Provenance Rules

1. **Physical Sensor Data**: Must set `is_simulated: false`. When submitted by an authenticated device registered to a user, the dashboard immediately displays **LIVE SENSOR DATA**.
2. **Freshness Window**: Readings older than 15 seconds transition status to **CONNECTED — NO RECENT DATA**.
3. **Emergency Escalation**: Deceleration spikes $> 3.5g$ coupled with abrupt cessation of movement trigger an autonomous **fall_detection** emergency event requiring user confirmation or dispatch.
