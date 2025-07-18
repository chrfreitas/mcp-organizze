
export const ORGANIZZE_API_BASE = "https://api.organizze.com.br/rest/v2";

export async function makeRequest<Account>(url: string) {
  const credentials = `${process.env.ORGANIZZE_USERNAME}:${process.env.ORGANIZZE_PASSWORD}`;
  const encodedCredentials = btoa(credentials);

  const headers = {
    "User-Agent": process.env.ORGANIZZE_USER_AGENT || "",
    "Authorization": `Basic ${encodedCredentials}`
  };

  try {
    const response = await fetch(url, { method: 'GET', headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return (await response.json());
  }
  catch (error) {
    console.log(error);
    return null;
  }
}