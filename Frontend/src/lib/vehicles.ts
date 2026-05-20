import type { ApiVehicleDto, VehicleUpsertPayload } from './api'
import type { Vehicle } from '../UserComponent/Vehiclesform'

export function apiVehicleToForm(d: ApiVehicleDto): Vehicle {
  return {
    id: d.id,
    company: d.company,
    model: d.model,
    plate: d.plate,
    color: d.color ?? '',
    plateFormat: d.plateFormat,
    isMainBike: d.isMainBike,
    embossed: d.embossed ?? undefined,
    traditional: d.traditional ?? undefined,
  }
}

export function formVehicleToPayload(v: Vehicle): VehicleUpsertPayload {
  const plateFormat = v.plateFormat ?? 'embossed'
  const body: VehicleUpsertPayload = {
    company: v.company.trim(),
    model: v.model.trim(),
    plate: v.plate.trim(),
    color: (v.color ?? '').trim(),
    plateFormat,
  }
  if (plateFormat === 'embossed' && v.embossed) {
    body.embossed = v.embossed
  }
  if (plateFormat === 'traditional' && v.traditional) {
    body.traditional = v.traditional
  }
  return body
}
