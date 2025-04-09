import { SensorData } from './sensorData.model';
import { Sensors } from './sensor.model';

export interface Measurement {
  measurementName: string;
  sensor: Sensors;
  dataPoints: SensorData[];
}
