
import useStorage from "./useLocalStorage";


const baseurl = 'https://distributeurcle.edwrdledgar.me/api';
const useFetch = () => {
  const { getItem } = useStorage<string>("auth_token");

  const buildHeaders = async (extra?: any) => {
    const token = await getItem();
    const headers: any = extra ? { ...extra } : {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };

  const GET = async <T>(url: string): Promise<T | undefined> => {
    try {
      const headers = await buildHeaders();
      const response = await fetch(`${baseurl}${url}`, { headers });

      return handleResponse<T>(response);
    } catch (error) {
      console.error("Error fetching:", error);
      throw error;
    }
  };

  const POST = async <T, T1 = T>(url: string, body: T): Promise<T1 | undefined> => {
    try {
      const headers = await buildHeaders({ "Content-Type": "application/json" });

      const response = await fetch(`${baseurl}${url}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      return handleResponse<T1>(response);
    } catch (error) {
      console.error("Error posting:", error);
      throw error;
    }
  };

  const DELETE = async (url: string): Promise<void> => {
    try {
      const headers = await buildHeaders();

      const response = await fetch(`${baseurl}${url}`, {
        method: "DELETE",
        headers,
      });

      await handleResponse(response);
    } catch (error) {
      console.error("Error deleting:", error);
      throw error;
    }
  };

  const PUT = async <T, T1 = T>(url: string, body: T): Promise<T1 | undefined> => {
    try {
      const headers = await buildHeaders({ "Content-Type": "application/json" });

      const response = await fetch(`${baseurl}${url}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      return handleResponse<T1>(response);
    } catch (error) {
      console.error("Error putting:", error);
      throw error;
    }
  };

  const PATCH = async <T>(url: string, body: T): Promise<void | undefined> => {
    try {
      const headers = await buildHeaders({ "Content-Type": "application/json" });

      const response = await fetch(`${baseurl}${url}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error patching:", error);
      throw error;
    }
  };

  async function handleResponse<T>(response: Response): Promise<T | undefined> {
    if (!response.ok) {
      if (response.status === 500) {
        throw new Error("Internal server error");
      } else if (response.status === 404) {
        return undefined as T;
      } else if (response.status === 400) {
        throw new Error("Payload invalide");
      } else {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  return { GET, POST, DELETE, PUT, PATCH };
};

export default useFetch;