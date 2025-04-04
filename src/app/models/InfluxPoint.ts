export interface InfluxPoint {
    sensorName: string;
    value:      number;
    timestamp:  string;  // ISO 8601 format timestamp
}

/* Example object:
{
  sensorName: "Senzemo_Senstick_Bodenfeuchtesensor_1",
  value: 34,
  timestamp: "2025-03-20T08:08:32Z"
}
*/
