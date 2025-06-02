const baseUrl =
process.env.NODE_ENV === "production"
? `http://${process.env.VERCEL_PROJECT_URL}`
: `${process.env.NEXT_PUBLIC_BASE_URL}`;

export default baseUrl;