import { Form, useForm } from "@void/react";

type Loan = {
  id: string;
  loanedOn: string;
  dueOn: string;
  returnedOn: string | null;
  bookTitle: string;
  memberName: string;
  overdue: boolean;
};

/** The screen declares what it shows. The page's loader has to fit this */
type Props = {
  loans: Loan[];
  members: { id: string; name: string }[];
  books: { id: string; title: string }[];
};

export function LoansScreen({ loans, members, books }: Props) {
  const form = useForm("/loans?create", { memberId: "", bookId: "" });

  return (
    <main>
      <h1>貸出</h1>

      <h2>貸す</h2>
      <Form form={form}>
        <label>
          会員
          <select
            value={form.data.memberId}
            onChange={(e) => form.setData("memberId", e.target.value)}
          >
            <option value="">選ぶ</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        {form.errors.memberId && <span>{form.errors.memberId}</span>}
        <label>
          本
          <select value={form.data.bookId} onChange={(e) => form.setData("bookId", e.target.value)}>
            <option value="">選ぶ</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </label>
        {form.errors.bookId && <span>{form.errors.bookId}</span>}
        <button disabled={form.pending}>貸す</button>
      </Form>

      <h2>一覧</h2>
      {loans.length === 0 ? (
        <p>まだ貸出がありません。</p>
      ) : (
        <ul>
          {loans.map((loan) => (
            <LoanRow key={loan.id} loan={loan} />
          ))}
        </ul>
      )}
    </main>
  );
}

function LoanRow({ loan }: { loan: Loan }) {
  const form = useForm("/loans?return", { loanId: loan.id });

  return (
    <li>
      {loan.bookTitle} / {loan.memberName}（{loan.loanedOn} 〜 期限 {loan.dueOn}）
      {loan.returnedOn ? (
        <span> 返却済み（{loan.returnedOn}）</span>
      ) : (
        <>
          {loan.overdue && <strong> 延滞</strong>}
          <Form form={form}>
            <button disabled={form.pending}>返却する</button>
          </Form>
          {form.errors.loanId && <span>{form.errors.loanId}</span>}
        </>
      )}
    </li>
  );
}
