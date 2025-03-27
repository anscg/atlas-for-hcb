import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { requireUserId, getUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUser(request);
  
  if (!user) {
    return redirect("/");
  }
  
  return json({ userId: user.id, hcbUserId: user.user_id });
};

export default function Dashboard() {
  const { userId, hcbUserId } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <div>
        <div>
          <p>Atlas User ID: {userId}</p>
          <p>HCB User ID: {hcbUserId}</p>
        </div>
        
        <Form action="/logout" method="post">
          <button type="submit">
            Logout
          </button>
        </Form>
      </div>
    </div>
  );
}
