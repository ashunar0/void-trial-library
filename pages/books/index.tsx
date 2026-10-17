import { BooksScreen } from "../../src/components/screens/books";
import type { InferProps } from "void";
import type { loader } from "./index.server";

export default function BooksPage(props: InferProps<typeof loader>) {
  return <BooksScreen {...props} />;
}
