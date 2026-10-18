import { BookScreen } from "../../src/components/screens/book";
import type { InferProps } from "void";
import type { loader } from "./[id].server";

export default function BookPage(props: InferProps<typeof loader>) {
  return <BookScreen {...props} />;
}
