import { MembersScreen } from "../../src/components/screens/members";
import type { InferProps } from "void";
import type { loader } from "./index.server";

export default function MembersPage(props: InferProps<typeof loader>) {
  return <MembersScreen {...props} />;
}
