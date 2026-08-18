export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser doesn't support location access"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("Location access was denied — please allow location access to punch in/out"));
        } else {
          reject(new Error("Couldn't determine your location — please try again"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
