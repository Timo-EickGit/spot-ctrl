import { refreshToken } from "./token"

const api_base_url = 'https://api.spotify.com/v1/'

/**
 * gets the current playback state from Spotify
 * @returns {JSON} currentlyPlaying song
 */
export const getPlayback = async () => {
  const url = api_base_url + 'me/player'
  return makeRequest(url, 'GET')
}

/**
 * Pauses the Playback
 */
export const pausePlayback = async () => {
  const url = api_base_url + 'me/player/pause'
  return makeRequest(url, 'PUT')
}

/**
 * starts the Playback
 */
export const startPlayback = async () => {
  const url = api_base_url + 'me/player/play'
  return makeRequest(url, 'PUT')
}

/**
 * skips to the next song
 */
export const nextPlayback = async () => {
  const url = api_base_url + 'me/player/next'
  return makeRequest(url, 'POST')
}

/**
 * return to the previous playback
 */
export const previousPlayback = async () => {
  const url = api_base_url + 'me/player/previous'
  return makeRequest(url, 'POST')
}

/**
 * Jumps to the specified duration on the current song
 * @param {int} position_ms 
 */
export const seekToPosition = async (position_ms) => {
  const url =  api_base_url + 'me/player/seek?position_ms='+ position_ms
  return makeRequest(url, 'PUT')
}

export const setVolume = async (volume) => {
  const url =  api_base_url + 'me/player/volume?volume_percent=' + volume
  return makeRequest(url, 'PUT')
}

/**
 * This is a helperfunction to wrap the API call with a token
 * @param {String} url 
 * @param {String} method 
 * @returns {JSON} apiResponse - ONLY ON 'GET' requests
 */
const makeRequest = async (url, method) => {
  const token = await refreshToken();
  return fetch(url, {
    method: method,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((response) => {
      if (!response.ok) {
        console.log(response);

        // handle errors
        switch (response.status) {
          case 401:
            window.location = '/auth';
            break;
        }

        throw new Error("invalid response", response)
      }
      // if response was successful then return the data

      if (method === 'GET') {
        return response.json()
      }
      return
    })
}
