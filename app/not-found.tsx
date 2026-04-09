import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "32px" }}>
      <div className="card" style={{ maxWidth: "520px", width: "100%" }}>
        <div className="badge b-doc">404</div>
        <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>페이지를 찾을 수 없습니다</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          요청한 경로가 현재 Next.js 라우트에 없습니다. 홈으로 돌아가서 다시 이동하세요.
        </p>
        <div className="post-actions" style={{ marginTop: "18px" }}>
          <Link className="action-btn primary" href="/">
            홈으로 이동
          </Link>
        </div>
      </div>
    </main>
  );
}
