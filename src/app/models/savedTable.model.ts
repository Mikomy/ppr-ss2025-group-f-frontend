import { Measurement } from './measurement.model'

export interface SavedTable {
  id: string
  name: string
  label: string[]
  data: Measurement
}
