import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { getOrganization } from "~/hcb.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  
  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId");
  
  if (!orgId) {
    return json({ error: "Organization ID is required" }, { status: 400 });
  }
   
  try {
    const { data: organization } = await getOrganization(request, orgId);
    
    return json({
      id: organization.id,
      name: organization.name,
      balance_cents: organization.balance_cents,
      pending_balance_cents: organization.pending_balance_cents
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return json(
      { error: "Failed to fetch organization balance" },
      { status: 500 }
    );
  }
}