export class HttpResponse{
    public success:string;
    public message:string;
    public data:any

    constructor(success:string, message:string,data:any){
        this.success = success;
        this.message = message;
        this.data = data;
    }
}

export class ErrorResponse extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorResponse";
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
    };
  }
}
