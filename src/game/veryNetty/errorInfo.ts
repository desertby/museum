export class ErrorInfo {

  public isRight: boolean = true;
  public message: string = '';

  constructor() {
    
  }

  public clear(): void {
    this.isRight = true;
    this.message = '';
  }

}