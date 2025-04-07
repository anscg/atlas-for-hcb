import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { requireUserId, getUser } from "~/session.server";
import { getUserOrganizations, OrganizationSummary } from "~/hcb.server";
import AnimatedBaseButton from "~/components/ui/animatedbasebutton";
import { ReceiptsPage } from "~/components/ui/receiptspage";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUser(request);

  if (!user) {
    return redirect("/");
  }

  // Fetch user organizations - pass request directly
  const { data: organizations } = await getUserOrganizations(request);

  console.log(organizations)

  return json({ 
    userId: user.id, 
    hcbUserId: user.user_id,
    organizations 
  });
};

export default function Dashboard() {
  const { userId, hcbUserId, organizations } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white relative">
      <div className="absolute inset-0 top-[-60px] z-10 pointer-events-none">
        <img 
          src="/dashmock.png"
          alt="Dashboard mockup" 
          className="w-full h-auto opacity-0"
        />
      </div>
      
      <div className="sm:max-w-md w-screen h-screen relative z-0">
        <header
          className="sticky top-0 left-0 z-50 w-full bg-white"
          aria-label="Main Navigation"
        >
          <div className="grid h-[68px] grid-cols-[auto_1fr_auto] items-center px-6">
            <div className="justify-self-start">
              <AnimatedBaseButton
                type="button"
                className="rounded-full p-1 text-[#93979F] transition-colors duration-200 leading-0 flex items-center justify-center"
                aria-label="Open settings"
              >
                <box-icon name="cog" color="#93979F" className="w-7 h-7" />
              </AnimatedBaseButton>
            </div>

            <div className="overflow-hidden text-center">
              <h1
                className="truncate text-xl font-semibold leading-tight text-gray-900"
                title="App Title / Page Name"
              >
                Atlas
              </h1>
            </div>

            <div className="justify-self-end">
              <ReceiptsPage></ReceiptsPage>
            </div>
          </div>
        </header>

        <div className="px-[27px] py-2">
          <div>

            <div className="mb-6">
              <div className="flex justify-between items-center w-full mb-3">
              <h2 className="text-lg font-semibold opacity-80 tracking-tight">Your Organizations</h2>
              <AnimatedBaseButton 
                type="button" 
                className="rounded-full p-1 text-[#93979F] transition-colors duration-200 flex items-center justify-center"
                aria-label="Add organization"
                onClick={() => window.open('https://nonprofit.new/', '_blank')}
              >
                <box-icon name="plus" color="#93979F" />
              </AnimatedBaseButton>
              </div>
            </div>

            <Form action="/logout" method="post">
              <button 
                type="submit"
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                Logout
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
