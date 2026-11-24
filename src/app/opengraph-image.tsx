import { ImageResponse } from "next/og";

// Link-preview card (WhatsApp, iMessage, LinkedIn, X...). Generated once at build time.
export const alt = "Rasm — book your wedding hall and every wedding service in one booking";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

const PHOTO = "https://images.unsplash.com/photo-1605553426886-c0a99033fda0?auto=format&fit=crop&w=900&h=1260&q=70";

async function font(family: string, weight: number) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [playfair, mulish] = await Promise.all([font("Playfair+Display", 600), font("Mulish", 700)]);
  const fonts = [
    ...(playfair ? [{ name: "Playfair", data: playfair, weight: 600 as const, style: "normal" as const }] : []),
    ...(mulish ? [{ name: "Mulish", data: mulish, weight: 700 as const, style: "normal" as const }] : []),
  ];
  const gold = "#E9C77B";

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#3A0F1B", fontFamily: "Mulish" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 720, padding: "0 64px", background: "#5B1A2B" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="64" height="64" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18.5" fill="none" stroke="#B8862F" strokeWidth="1" />
              <path d="M20 7 C27 13 29 20 20 31 C11 20 13 13 20 7Z" fill={gold} />
              <path d="M20 13 C23.5 16.5 24 20 20 26 C16 20 16.5 16.5 20 13Z" fill="#5B1A2B" />
              <path d="M9 30 Q20 35 31 30" stroke="#B8862F" strokeWidth="1.2" fill="none" />
            </svg>
            <span style={{ fontFamily: "Playfair", fontSize: 54, color: "#FBF6EE" }}>Rasm</span>
          </div>
          <div style={{ marginTop: 36, fontSize: 18, letterSpacing: 6, color: gold }}>SHAADI, SORTED WITH GRACE</div>
          <div style={{ marginTop: 18, fontFamily: "Playfair", fontSize: 58, lineHeight: 1.15, color: "#FBF6EE" }}>
            Book your wedding hall and every rasm in one booking
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 30, gap: 14 }}>
            <div style={{ width: 120, height: 1, background: "#B8862F" }} />
            <div style={{ width: 12, height: 12, transform: "rotate(45deg)", background: "#B8862F" }} />
            <div style={{ width: 120, height: 1, background: "#B8862F" }} />
          </div>
          <div style={{ marginTop: 28, fontSize: 24, color: "rgba(251,246,238,0.85)" }}>
            Halls · Photographers · Decorators · Caterers · Fireworks · Mehndi
          </div>
          <div style={{ display: "flex", marginTop: 34 }}>
            <div style={{ padding: "12px 26px", background: "#B8862F", color: "#fff", fontSize: 22, borderRadius: 6 }}>Try the live demo →</div>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTO} width={480} height={630} style={{ objectFit: "cover", width: 480, height: 630 }} alt="" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(91,26,43,0.85), rgba(91,26,43,0.1) 45%)" }} />
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
