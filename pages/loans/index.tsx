import { LoansScreen } from "../../src/components/screens/loans";
import type { InferProps } from "void";
import type { loader } from "./index.server";

export default function LoansPage(props: InferProps<typeof loader>) {
  return <LoansScreen {...props} />;
}
