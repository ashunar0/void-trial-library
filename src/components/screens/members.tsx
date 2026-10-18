import { Form, useForm } from "@void/react";

/** The screen declares what it shows. The page's loader has to fit this */
type Props = {
  members: { id: string; name: string; email: string }[];
};

export function MembersScreen({ members }: Props) {
  const form = useForm("/members", { name: "", email: "" });

  return (
    <main>
      <h1>会員</h1>
      {members.length === 0 ? (
        <p>まだ会員がいません。</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {member.name}（{member.email}）
            </li>
          ))}
        </ul>
      )}

      <h2>登録</h2>
      <Form form={form}>
        <label>
          名前
          <input value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} />
        </label>
        {form.errors.name && <span>{form.errors.name}</span>}
        <label>
          メールアドレス
          <input value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} />
        </label>
        {form.errors.email && <span>{form.errors.email}</span>}
        <button disabled={form.pending}>登録する</button>
      </Form>
    </main>
  );
}
