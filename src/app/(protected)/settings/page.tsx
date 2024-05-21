import { signOut } from "@/auth";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

const Settings = async () => {
  const session = await auth();

  return (
    <div>
      {JSON.stringify(session)}
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button type="submit">Sign out</Button>
      </form>
    </div>
  );
};

export default Settings;
