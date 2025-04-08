import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { requireUserId, getUser } from "~/session.server";
import { getUserOrganizations, OrganizationSummary } from "~/hcb.server";
import AnimatedBaseButton from "~/components/ui/animatedbasebutton";
import { ReceiptsPage } from "~/components/ui/receiptspage";
import OrgCard from "~/components/ui/Dashboard/orgcard";

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
    <div className="flex flex-col items-center justify-center h-screen bg-white relative pointer-effect-none">
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
                className="truncate text-[1.4rem] font-semibold leading-tight select-none text-gray-900"
                title="Atlas Title"
              >
                Atlas
              </h1>
            </div>

            <div className="justify-self-end">
              <ReceiptsPage></ReceiptsPage>
            </div>
          </div>
        </header>

        <div className="px-[21px] py-2">
          <div className="">

            <div className="mb-[0.85rem]">
              <div className="flex justify-between items-center w-full mb-3">
              <h2 className="text-lg font-semibold opacity-80 select-none tracking-[-0.005em]">Your organizations</h2>
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

            <div className="grid grid-cols-2 gap-3 gap-y-4">
              <OrgCard
                imageSrc="juice.png"
                orgName="Juice"
                amount={6212.40}
                backgroundColor="#FF4747"
              />
              <OrgCard
                imageSrc="APO.png"
                orgName="Apocalypse"
                amount={10622.40}
                backgroundColor="#6266FA"
              />
              <OrgCard
                imageSrc="juice.png"
                orgName="Juice"
                amount={6212.40}
                backgroundColor="#FF4747"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
