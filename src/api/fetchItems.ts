import DataList from "../Models/Data";
import { BaseAPI } from "./BaseAPI";
const { get } = BaseAPI;
class FetchItems {
  async fetchItems(offset: number, limit: number): Promise<DataList> {
    const url = `https://dummyjson.com/products?limit=${limit}&skip=${offset}&select=title,price`;

    const response = await get(url);
    const data: DataList = response.products;

    return data;
  }
}

export default FetchItems;
