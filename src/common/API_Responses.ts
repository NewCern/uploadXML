interface APIResponse {
    headers: { [key: string]: string };
    statusCode: number;
    body: string;
  }
  
  const Responses = {
    _DefineResponse(statusCode: number = 502, data: object = {}): APIResponse {
      return {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        },
        statusCode,
        body: JSON.stringify(data),
      };
    },
  
    _200(data: object = {}): APIResponse {
      return this._DefineResponse(200, data);
    },
  
    _204(data: object = {}): APIResponse {
      return this._DefineResponse(204, data);
    },
  
    _400(data: object = {}): APIResponse {
      return this._DefineResponse(400, data);
    },
  
    _404(data: object = {}): APIResponse {
      return this._DefineResponse(404, data);
    },
  };
  
  export default Responses;
  