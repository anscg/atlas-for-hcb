import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { getUser } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  
  const user = await getUser(request);
  
  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }
  
  return json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}