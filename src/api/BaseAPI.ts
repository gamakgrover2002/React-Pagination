import axios from "axios";

export class BaseAPI {
  public static totalData: number = 0;

  public static async get(baseURL: string): Promise<any> {
    const response = await axios.get(baseURL);
    const data = response.data;
    BaseAPI.totalData = data.total;
    return data;
  }
}
