interface Coordinate {
  latitude: number
  longitude: number
}

export function getDistanceBetweenCoordinates(
  from: Coordinate,
  to: Coordinate
): number {
  const EARTH_RADIUS_IN_KM = 6371

  const latitudeFrom = (from.latitude * Math.PI) / 180
  const latitudeTo = (to.latitude * Math.PI) / 180
  const deltaLatitude = ((to.latitude - from.latitude) * Math.PI) / 180
  const deltaLongitude = ((to.longitude - from.longitude) * Math.PI) / 180

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(latitudeFrom) *
      Math.cos(latitudeTo) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distanceInKilometers = EARTH_RADIUS_IN_KM * c

  return distanceInKilometers
}
