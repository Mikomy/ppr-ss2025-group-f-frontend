import { Measurement } from './measurement.model'

export interface SavedTable {
  id: string
  name: string
  from?: string
  to?: string
  data: Measurement
}
