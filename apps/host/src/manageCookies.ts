const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

const ManageCookies = {
  SameSiteOptions: { None: "None", Lax: "Lax", Strict: "Strict" } as const,

  GetCookie(name: string): string | undefined {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
  },

  // domain is optional (fix for the hardcoded `domain=.ips.gov.il` bug): omit it for a host-only cookie.
  // Defaults to COOKIE_DOMAIN from config — empty in local dev, since browsers reject `.ips.gov.il` cookies on localhost.
  SetCookie(
    name: string,
    value: string,
    maxAgeDays: number | null = null,
    sameSite: string = "Lax",
    domain: string | undefined = COOKIE_DOMAIN
  ): void {
    let cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=${sameSite}`;
    if (sameSite === "None") cookie += "; Secure";
    if (maxAgeDays !== null) cookie += `; max-age=${maxAgeDays * 86400}`;
    if (domain) cookie += `; domain=${domain}`;
    document.cookie = cookie;
  },
};

export default ManageCookies;
