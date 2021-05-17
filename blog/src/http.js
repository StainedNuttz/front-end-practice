import { ui } from "./ui";

class HTTP {
  constructor() {
    this.baseURL = '';
    this.headers = {
      'Content-type': 'application/json'
    }
  }

  async get(endpoint) {
    const res = await fetch(this.baseURL + endpoint, {
      method: 'GET'
    });
    const json = await res.json();
    return json;
  }
  
  async post(endpoint, data) {
    const res = await fetch(this.baseURL + endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
  }

  async put(endpoint, data) {
    console.log(data);
    const res = await fetch(this.baseURL + endpoint, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data)
    })
    const json = await res.json();
    return json;
  }

  async delete(endpoint) {
    console.log(endpoint);
    const res = await fetch(this.baseURL + endpoint, {
      method: 'DELETE'
    });
    const json = await res.json();
    return json;
  }
}

export const http = new HTTP();