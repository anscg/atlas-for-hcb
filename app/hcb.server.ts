// hcb.server.ts
import { getHcbConfig } from "./env.server";
import { updateUserTokens } from "./db.server";
import { requireUserId, getTokenData } from "./session.server";
import type { TokenData } from "./session.server";

/**
 * Refreshes the HCB access token using a refresh token.
 */
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
    console.error(
      "Error refreshing token:",
      response.status,
      response.statusText,
      await response.text(),
    );
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token, // HCB might return a new refresh token
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Fetches user details from HCB using an access token.
 * Note: This is less used now as getUser fetches directly via fetchWithToken.
 */
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

/**
 * Core function to make authenticated requests to the HCB API.
 * Handles token retrieval from DB, automatic refresh, and saving updated tokens.
 */
export async function fetchWithToken(
  url: string,
  request: Request, // Pass the full Request object
  options: RequestInit = {},
): Promise<{ data: any; tokenData: TokenData }> {
  const userId = await requireUserId(request); // Ensures user is logged in
  let currentTokenData = await getTokenData(request); // Reads from DB via userId

  if (!currentTokenData) {
    // Should be caught by requireUserId, but safeguard
    throw new Error("User not authenticated or token data missing.");
  }

  // Check if token needs refreshing (5 minute buffer)
  if (currentTokenData.expires_at - 5 * 60 * 1000 < Date.now()) {
    try {
      const refreshedTokenData = await refreshToken(
        currentTokenData.refresh_token,
      );
      await updateUserTokens(userId, refreshedTokenData); // Save new tokens to DB
      currentTokenData = refreshedTokenData; // Use new tokens for this request
      console.log("Token refreshed and saved to DB for user:", userId);
    } catch (error) {
      console.error("Failed to refresh token or save to DB:", error);
      // Depending on app logic, might redirect to login here
      throw new Error("Token refresh failed.", { cause: error });
    }
  }

  const config = getHcbConfig();
  const fullUrl = url.startsWith("http") ? url : `${config.apiBase}${url}`;

  const headers = new Headers(options.headers);
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${currentTokenData.access_token}`);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `API request failed: ${response.status} ${response.statusText}`,
      errorBody,
    );
    // Consider parsing errorBody if API provides structured errors
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  let responseData = null;
  if (response.status !== 204) {
    // Avoid parsing JSON for 204 No Content
    try {
      responseData = await response.json();
    } catch (e) {
      console.error("Failed to parse API response JSON:", e);
      throw new Error("Invalid JSON response from API");
    }
  }

  return {
    data: responseData,
    tokenData: currentTokenData, // Return the token data used (potentially refreshed)
  };
}

// --- Helper Function ---

/**
 * Builds a query string from an object, ignoring null/undefined values.
 */
function buildQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
  return query ? `?${query}` : "";
}

// --- TypeScript Interfaces (Based on Jbuilder Views/API Structure) ---
// Keep all interfaces as they define the expected shapes of API responses/payloads

export interface HcbUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  role: "reader" | "member" | "manager";
}

export interface Organization extends OrganizationSummary {
  balance_cents: number;
  pending_balance_cents: number;
  website: string | null;
  address: string | null;
  description: string | null;
  created_at: string;
}

export interface Card {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  status: "active" | "inactive" | "canceled";
  type: "virtual" | "physical";
  organization: OrganizationSummary;
  cardholder: HcbUser;
  created_at: string;
}

export interface CardGrant {
  id: string;
  amount_cents: number;
  balance_cents: number;
  status: "active" | "canceled" | "expired";
  purpose: string | null;
  merchant_lock: string[] | null;
  category_lock: string[] | null;
  keyword_lock: string | null;
  created_at: string;
  expires_on: string | null;
  organization: OrganizationSummary;
  recipient: HcbUser;
  card: {
    id: string;
    last4: string;
    brand: string;
  } | null;
}

export interface Invitation {
  id: string;
  email: string;
  role: "reader" | "member" | "manager";
  is_signee: boolean;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  organization: OrganizationSummary;
  sender: HcbUser;
}

export interface TransactionSummary {
  id: string;
  type: string;
  amount_cents: number;
  memo: string;
  date: string;
  status: string;
  receipt_status: "required" | "attached" | "not_required" | "missing";
  card: {
    id: string;
    last4: string;
    brand: string;
  } | null;
}

export interface TransactionDetail extends TransactionSummary {
  comments_count: number;
  receipts: Receipt[];
  cardholder: HcbUser | null;
  merchant: {
    name: string;
    category: string;
    category_code: string;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
  } | null;
  linked_object: {
    type: string;
    id: string;
    name: string;
  } | null;
}

export interface Receipt {
  id: string;
  url: string;
  thumbnail_url: string | null;
  uploaded_at: string;
  uploader: HcbUser;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: HcbUser;
}

export interface Disbursement {
  id: string;
  amount_cents: number;
  name: string;
  status:
    | "pending"
    | "processing"
    | "fulfilled"
    | "rejected"
    | "canceled"
    | "scheduled"
    | "errored";
  created_at: string;
  source_organization: OrganizationSummary;
  destination_organization: OrganizationSummary;
  requested_by: HcbUser;
}

export interface Donation {
  id: string;
  amount_cents: number;
  status: "pending" | "in_transit" | "deposited" | "failed" | "refunded";
  created_at: string;
  donor_name: string | null;
  donor_email: string | null;
  collected_by: HcbUser | null;
}

export interface AvailableIcons {
  [key: string]: boolean;
}

export interface EphemeralKeyResponse {
  ephemeralKeySecret: string;
  stripe_id: string;
}

export interface MemoSuggestion {
  memo: string;
}

// --- Request Payload Interfaces ---

export interface CreateCardGrantPayload {
  amount_cents: number;
  email: string;
  merchant_lock?: string | null;
  category_lock?: string | null;
  keyword_lock?: string | null;
  purpose?: string | null;
}

export interface CreateTransferPayload {
  to_organization_id: string;
  amount_cents: number;
  name: string;
}

export interface CreateDonationPayload {
  amount_cents: number;
  name?: string | null;
  email?: string | null;
}

export interface UpdateTransactionPayload {
  memo?: string | null;
}

export interface UpdateCardStatusPayload {
  status: "active" | "frozen";
}

export interface UpdateCardGrantPayload {
  merchant_lock?: string | null;
  category_lock?: string | null;
  keyword_lock?: string | null;
  purpose?: string | null;
}

export interface TopupCardGrantPayload {
  amount_cents: number;
}

// --- API Functions ---

// --- User API ---

/**
 * Fetches the authenticated user's details.
 */
export async function getUser(
  request: Request,
): Promise<{ data: HcbUser; tokenData: TokenData }> {
  return fetchWithToken("/user", request);
}

/**
 * Fetches the organizations associated with the authenticated user.
 */
export async function getUserOrganizations(
  request: Request,
): Promise<{ data: OrganizationSummary[]; tokenData: TokenData }> {
  return fetchWithToken("/user/organizations", request);
}

/**
 * Fetches the Stripe cards associated with the authenticated user.
 */
export async function getUserCards(
  request: Request,
): Promise<{ data: Card[]; tokenData: TokenData }> {
  return fetchWithToken("/user/cards", request);
}

/**
 * Fetches the card grants associated with the authenticated user.
 */
export async function getUserCardGrants(
  request: Request,
): Promise<{ data: CardGrant[]; tokenData: TokenData }> {
  return fetchWithToken("/user/card_grants", request);
}

/**
 * Fetches the pending invitations for the authenticated user.
 */
export async function getUserInvitations(
  request: Request,
): Promise<{ data: Invitation[]; tokenData: TokenData }> {
  return fetchWithToken("/user/invitations", request);
}

/**
 * Fetches details for a specific invitation for the authenticated user.
 */
export async function getUserInvitation(
  request: Request,
  invitationId: string,
): Promise<{ data: Invitation; tokenData: TokenData }> {
  return fetchWithToken(`/user/invitations/${invitationId}`, request);
}

/**
 * Accepts a pending invitation for the authenticated user.
 */
export async function acceptUserInvitation(
  request: Request,
  invitationId: string,
): Promise<{ data: Invitation; tokenData: TokenData }> {
  return fetchWithToken(`/user/invitations/${invitationId}/accept`, request, {
    method: "POST",
  });
}

/**
 * Rejects a pending invitation for the authenticated user.
 */
export async function rejectUserInvitation(
  request: Request,
  invitationId: string,
): Promise<{ data: Invitation; tokenData: TokenData }> {
  return fetchWithToken(`/user/invitations/${invitationId}/reject`, request, {
    method: "POST",
  });
}

/**
 * Fetches transactions missing receipts for the authenticated user.
 */
export async function getUserMissingReceiptTransactions(
  request: Request,
): Promise<{ data: TransactionSummary[]; tokenData: TokenData }> {
  const result = await fetchWithToken(
    "/user/transactions/missing_receipt",
    request,
  );
  // Assuming the API returns { transactions: [...] }
  return { data: result.data.transactions, tokenData: result.tokenData };
}

/**
 * Fetches available profile icons for the authenticated user.
 */
export async function getUserAvailableIcons(
  request: Request,
): Promise<{ data: AvailableIcons; tokenData: TokenData }> {
  return fetchWithToken("/user/available_icons", request);
}

// --- Organization API ---

/**
 * Fetches details for a specific organization.
 */
export async function getOrganization(
  request: Request,
  organizationId: string,
): Promise<{ data: Organization; tokenData: TokenData }> {
  return fetchWithToken(`/organizations/${organizationId}`, request);
}

/**
 * Fetches Stripe cards for a specific organization.
 */
export async function getOrganizationCards(
  request: Request,
  organizationId: string,
): Promise<{ data: Card[]; tokenData: TokenData }> {
  return fetchWithToken(`/organizations/${organizationId}/cards`, request);
}

/**
 * Fetches card grants for a specific organization.
 */
export async function getOrganizationCardGrants(
  request: Request,
  organizationId: string,
): Promise<{ data: CardGrant[]; tokenData: TokenData }> {
  return fetchWithToken(`/organizations/${organizationId}/card_grants`, request);
}

/**
 * Creates a new card grant for an organization.
 */
export async function createCardGrant(
  request: Request,
  organizationId: string,
  payload: CreateCardGrantPayload,
): Promise<{ data: CardGrant; tokenData: TokenData }> {
  return fetchWithToken(
    `/organizations/${organizationId}/card_grants`,
    request,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Fetches transactions for a specific organization.
 */
export async function getOrganizationTransactions(
  request: Request,
  organizationId: string,
  params: { limit?: number; after?: string; type?: string } = {},
): Promise<{
  data: { transactions: TransactionSummary[]; has_more: boolean; total_count: number };
  tokenData: TokenData;
}> {
  const queryString = buildQueryString(params);
  return fetchWithToken(
    `/organizations/${organizationId}/transactions${queryString}`,
    request,
  );
}

/**
 * Creates a transfer (disbursement) between organizations.
 */
export async function createTransfer(
  request: Request,
  sourceOrganizationId: string,
  payload: CreateTransferPayload,
): Promise<{ data: Disbursement; tokenData: TokenData }> {
  return fetchWithToken(
    `/organizations/${sourceOrganizationId}/transfers`,
    request,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Records an in-person donation for an organization.
 */
export async function createInPersonDonation(
  request: Request,
  organizationId: string,
  payload: CreateDonationPayload,
): Promise<{ data: Donation; tokenData: TokenData }> {
  return fetchWithToken(`/organizations/${organizationId}/donations`, request, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- Transaction API ---

/**
 * Fetches details for a specific transaction.
 */
export async function getTransaction(
  request: Request,
  transactionId: string,
  eventId?: string,
): Promise<{ data: TransactionDetail; tokenData: TokenData }> {
  const queryString = buildQueryString({ event_id: eventId });
  return fetchWithToken(`/transactions/${transactionId}${queryString}`, request);
}

/**
 * Updates the memo for a specific transaction within an organization context.
 */
export async function updateTransaction(
  request: Request,
  organizationId: string,
  transactionId: string,
  payload: UpdateTransactionPayload,
): Promise<{ data: TransactionDetail; tokenData: TokenData }> {
  return fetchWithToken(
    `/organizations/${organizationId}/transactions/${transactionId}`,
    request,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Fetches receipts for a specific transaction.
 */
export async function getTransactionReceipts(
  request: Request,
  transactionId: string,
): Promise<{ data: Receipt[]; tokenData: TokenData }> {
  return fetchWithToken(`/transactions/${transactionId}/receipts`, request);
}

/**
 * Attaches a receipt file to a transaction.
 */
export async function attachReceipt(
  request: Request,
  transactionId: string,
  file: File,
): Promise<{ data: Receipt; tokenData: TokenData }> {
  const formData = new FormData();
  formData.append("file", file);

  return fetchWithToken(`/transactions/${transactionId}/receipts`, request, {
    method: "POST",
    body: formData,
    // Content-Type for FormData is set by fetch
  });
}

/**
 * Fetches comments for a specific transaction.
 */
export async function getTransactionComments(
  request: Request,
  transactionId: string,
): Promise<{ data: Comment[]; tokenData: TokenData }> {
  return fetchWithToken(`/transactions/${transactionId}/comments`, request);
}

/**
 * Fetches memo suggestions for a specific transaction within an organization context.
 */
export async function getMemoSuggestions(
  request: Request,
  organizationId: string,
  transactionId: string,
): Promise<{ data: MemoSuggestion[]; tokenData: TokenData }> {
  return fetchWithToken(
    `/organizations/${organizationId}/transactions/${transactionId}/memo_suggestions`,
    request,
  );
}

// --- Card API ---

/**
 * Fetches details for a specific Stripe card.
 */
export async function getCard(
  request: Request,
  cardId: string,
): Promise<{ data: Card; tokenData: TokenData }> {
  return fetchWithToken(`/cards/${cardId}`, request);
}

/**
 * Updates the status (freeze/unfreeze) of a specific Stripe card.
 */
export async function updateCardStatus(
  request: Request,
  cardId: string,
  payload: UpdateCardStatusPayload,
): Promise<{ data: Card; tokenData: TokenData }> {
  return fetchWithToken(`/cards/${cardId}`, request, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Fetches transactions for a specific Stripe card.
 */
export async function getCardTransactions(
  request: Request,
  cardId: string,
  params: { missing_receipts?: "true" } = {},
): Promise<{
  data: { transactions: TransactionSummary[]; has_more: boolean; total_count: number };
  tokenData: TokenData;
}> {
  const queryString = buildQueryString(params);
  return fetchWithToken(`/cards/${cardId}/transactions${queryString}`, request);
}

/**
 * Fetches an ephemeral key to display virtual card details.
 */
export async function getCardEphemeralKeys(
  request: Request,
  cardId: string,
  nonce: string,
): Promise<{ data: EphemeralKeyResponse; tokenData: TokenData }> {
  const queryString = buildQueryString({ nonce });
  return fetchWithToken(`/cards/${cardId}/ephemeral_keys${queryString}`, request);
}

// --- Card Grant API ---

/**
 * Fetches details for a specific card grant.
 */
export async function getCardGrant(
  request: Request,
  grantId: string,
): Promise<{ data: CardGrant; tokenData: TokenData }> {
  return fetchWithToken(`/card_grants/${grantId}`, request);
}

/**
 * Updates details (locks, purpose) of a specific card grant.
 */
export async function updateCardGrant(
  request: Request,
  grantId: string,
  payload: UpdateCardGrantPayload,
): Promise<{ data: CardGrant; tokenData: TokenData }> {
  return fetchWithToken(`/card_grants/${grantId}`, request, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Tops up an existing card grant.
 */
export async function topupCardGrant(
  request: Request,
  grantId: string,
  payload: TopupCardGrantPayload,
): Promise<{ data: CardGrant; tokenData: TokenData }> {
  return fetchWithToken(`/card_grants/${grantId}/topup`, request, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Cancels an active card grant.
 */
export async function cancelCardGrant(
  request: Request,
  grantId: string,
): Promise<{ data: CardGrant; tokenData: TokenData }> {
  return fetchWithToken(`/card_grants/${grantId}/cancel`, request, {
    method: "POST",
  });
}

// --- Stripe Terminal API ---

/**
 * Fetches a connection token for Stripe Terminal.
 */
export async function getStripeTerminalConnectionToken(
  request: Request,
): Promise<{ data: { terminal_connection_token: string }; tokenData: TokenData }> {
  return fetchWithToken("/stripe_terminal_connection_token", request);
}
