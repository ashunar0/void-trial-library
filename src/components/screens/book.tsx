import { Form, Link, useForm } from "@void/react";

/** The screen declares what it shows. The page's loader has to fit this */
type Props = {
  book: { id: string; isbn: string; title: string; author: string; stock: number };
};

export function BookScreen({ book }: Props) {
  const params = { id: book.id };
  const form = useForm(
    "/books/:id?update",
    { title: book.title, author: book.author, stock: book.stock },
    { params },
  );
  const removal = useForm("/books/:id?delete", {}, { params });

  return (
    <main>
      <Link href="/books">← 本の一覧</Link>
      <h1>{book.title}</h1>
      <p>ISBN {book.isbn}</p>

      <h2>変更</h2>
      <Form form={form} method="patch">
        <label>
          タイトル
          <input value={form.data.title} onChange={(e) => form.setData("title", e.target.value)} />
        </label>
        {form.errors.title && <span>{form.errors.title}</span>}
        <label>
          著者
          <input value={form.data.author} onChange={(e) => form.setData("author", e.target.value)} />
        </label>
        {form.errors.author && <span>{form.errors.author}</span>}
        <label>
          冊数
          <input
            type="number"
            value={form.data.stock}
            onChange={(e) => form.setData("stock", e.target.valueAsNumber)}
          />
        </label>
        {form.errors.stock && <span>{form.errors.stock}</span>}
        <button disabled={form.pending}>保存する</button>
        {form.recentlySuccessful && <span>保存しました</span>}
      </Form>

      <h2>削除</h2>
      <Form form={removal} method="delete">
        <button disabled={removal.pending}>この本を削除する</button>
      </Form>
    </main>
  );
}
