export const clientId = import.meta.env.VITE_CLIENT_ID;
export const redirectUri = window.location.origin + '/redirect'
export const scope = 'user-modify-playback-state user-read-playback-state'

export const localStorage_access_token = 'accessToken'
export const localStorage_refresh_token = 'refreshToken'
const localStorage_expired_after = 'tokenInvalidAt'
const localStorage_refresh_after = 'tokenRefreshAfter'

const auth_base_url = 'https://accounts.spotify.com'
const tokenUrl = new URL(auth_base_url + '/api/token')
export const authUrl = new URL(auth_base_url + '/authorize')

/**
 * Stores the Authtoken in local storage
 * @param {JSON} response 
 */
const storeToken = (response) => {
  console.log(response)

  if (response.error) {
    // token is invalid reauth
    window.location = '/auth'
    return
  }

  const issuanceTime = Date.now()
  const expirationTime = issuanceTime + response.expires_in * 1000 // Convert expiresIn to milliseconds

  const refreshBeforeExpiration = 300 // 5 minutes in seconds
  const refreshTime = expirationTime - refreshBeforeExpiration * 1000 // Convert refreshBeforeExpiration to milliseconds

  console.log('Token will expire at:',new Date(expirationTime))
  console.log('Token will be refreshed at:',new Date(refreshTime))

  // store the tokens
  localStorage.setItem(localStorage_access_token, response.access_token)
  localStorage.setItem(localStorage_refresh_token, response.refresh_token)
  localStorage.setItem(localStorage_expired_after,new Date(expirationTime))
  localStorage.setItem(localStorage_refresh_after,new Date(refreshTime))
}

/**
 * gets the access token from the code that was passed to the spotify API
 * @param {String} code 
 */
export const getToken = async (code) => {
  console.log('called')

  // stored in Authview
  let codeVerifier = localStorage.getItem('code_verifier')

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    })
  }

  const body = await fetch(tokenUrl, payload)
  const response = await body.json()
  storeToken(response)
}

/**
 * Checks if the token needt to be refreshed and if so refrehes it then returns the token
 * @returns accesseToken 
 */
export const refreshToken = async () => {
  // refresh token that has been previously stored

  // store times
  const now = Date.now()
  const refresh = new Date(localStorage.getItem(localStorage_refresh_after))
  const expired = new Date(localStorage.getItem(localStorage_expired_after))

  if (now > expired.getTime()) {
    console.log('Token expired -> Reauth required')
    window.location = '/auth'
    return
  }

  if (now < refresh.getTime()) {
    console.log('no need to refresh token')
    return localStorage.getItem(localStorage_access_token)
  }

  console.log('refreshing token!')
  const refreshToken = localStorage.getItem(localStorage_refresh_token)

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId
    })
  }
  const body = await fetch(tokenUrl, payload)
  const response = await body.json()
  await storeToken(response)

  return localStorage.getItem(localStorage_access_token)
}
