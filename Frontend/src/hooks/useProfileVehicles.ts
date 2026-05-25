import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import type { Vehicle } from '../UserComponent/Vehiclesform'
import { fetchMyVehicles } from '../lib/api'
import { apiVehicleToForm } from '../lib/vehicles'

/** Loads the signed-in user's vehicles from `/api/vehicles/me`. */
export function useProfileVehicles(token: string | null, shouldLoad: boolean) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)

  const reloadVehicles = useCallback(async () => {
    if (!token) {
      setVehicles([])
      setVehiclesLoading(false)
      return
    }
    setVehiclesLoading(true)
    try {
      const list = await fetchMyVehicles(token)
      setVehicles(list.map(apiVehicleToForm))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load vehicles.')
      setVehicles([])
    } finally {
      setVehiclesLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (shouldLoad && token) {
      void reloadVehicles()
    } else if (!shouldLoad) {
      setVehicles([])
      setVehiclesLoading(false)
    }
  }, [shouldLoad, token, reloadVehicles])

  return { vehicles, setVehicles, vehiclesLoading, reloadVehicles }
}
