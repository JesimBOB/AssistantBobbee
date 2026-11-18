import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protection du site par mot de passe commun (Basic Auth).
// Le mot de passe est lu dans la variable d'environnement SITE_PASSWORD.
// Sans cette variable, le site reste fermé.
export function proxy(request: NextRequest) {
  const expectedPassword = process.env.SITE_PASSWORD;

  if (!expectedPassword) {
    return new NextResponse("Site non configuré.", { status: 503 });
  }

  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Basic ")) {
    const decoded = atob(authorization.slice("Basic ".length));
    const password = decoded.slice(decoded.indexOf(":") + 1);

    if (password === expectedPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Accès réservé.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="AssistantBobbee", charset="UTF-8"',
    },
  });
}
