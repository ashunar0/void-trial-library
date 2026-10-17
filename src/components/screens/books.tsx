import { Form, useForm } from "@void/react";

/** The screen declares what it shows. The page's loader has to fit this */
type Props = {
  books: { id: string; isbn: string; title: string; author: string; stock: number }[];
};

export function BooksScreen({ books }: Props) {
  const form = useForm("/books", { isbn: "", title: "", author: "", stock: 1 });

  return (
    <main>
      <h1>本</h1>
      {books.length === 0 ? (
        <p>まだ本がありません。</p>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> / {book.author}（{book.stock} 冊、ISBN {book.isbn}）
            </li>
          ))}
        </ul>
      )}

      <h2>登録</h2>
      <Form form={form}>
        <label>
          ISBN
          <input value={form.data.isbn} onChange={(e) => form.setData("isbn", e.target.value)} />
        </label>
        {form.errors.isbn && <span>{form.errors.isbn}</span>}
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
        <button disabled={form.pending}>登録する</button>
      </Form>
    </main>
  );
}
