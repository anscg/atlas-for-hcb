import { getHcbConfig } from "./env.server";
import { TokenData } from "./session.server";

export async function refreshToken(refreshToken: string): Promise<TokenData> {
  const config = getHcbConfig();
  
  const response = await fetch(`${config.apiBase}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: config.clientId,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

export async function getHcbUser(accessToken: string) {
  const config = getHcbConfig();
  
  const response = await fetch(`${config.apiBase}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchWithToken(
  url: string, 
  tokenData: TokenData, 
  options: RequestInit = {}
) {
  // Check if token needs refreshing (5 minute buffer)
  let currentTokenData = tokenData;
  if (tokenData.expires_at - 5 * 60 * 1000 < Date.now()) {
    currentTokenData = await refreshToken(tokenData.refresh_token);
  }
  
  const config = getHcbConfig();
  const fullUrl = url.startsWith('http') ? url : `${config.apiBase}${url}`;
  
  // Set up headers with authorization
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${currentTokenData.access_token}`);
  
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return {
    data: await response.json(),
    tokenData: currentTokenData,
  };
}
