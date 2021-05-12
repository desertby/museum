import { Transform } from "src/babylon";
import { Game } from "./game";
import { ImageCode } from "./imageCode";

export interface ILoadingScreen {
  //What happens when loading starts
  displayLoadingUI: () => void;
  //What happens when loading stops
  hideLoadingUI: () => void;
  //default loader support. Optional!
  loadingUIBackgroundColor: string;
  loadingUIText: string;
}

export class CustomLoadingScreen implements ILoadingScreen {


  //optional, but needed due to interface definitions
  public loadingUIBackgroundColor: string;

  public static loadingScreenDiv: Nullable<HTMLElement> = window.document.getElementById("loadingScreen");


  public waitAMoment: boolean = false;
  public waiting: boolean = false;
  constructor(public loadingUIText: string) {
    this.loadingUIBackgroundColor = "black";


  }


  public displayLoadingUI() {
    window.document.getElementById("id-progress2")!.innerHTML = "0%";
    // CustomLoadingScreen.loadingScreenDiv!.style.display = 'block';
    if (window.document.getElementById("id-image") !== null) {
      return;
    }

    let progress = window.document.getElementById("id-demo");

    let imgBack = new Image();
    imgBack.src = "./images/progress/bg.png";
    imgBack.id = "id-image";
    imgBack.style.position = "absolute";
    imgBack.style.zIndex = '0';
    imgBack.style.left = "0px";
    imgBack.style.top = "0px";
    imgBack.style.width = "100%";
    imgBack.style.height = "100%";
    imgBack.style.animation = "spin1 2s infinite ease-in-out";
    imgBack.style.webkitAnimation = "spin1 2s infinite ease-in-out";
    imgBack.style.transformOrigin = "50% 50%";
    imgBack.style.webkitTransformOrigin = "50% 50%";

    imgBack.onload = function () {
      setTimeout(()=>{
        $(".cover").hide();
      },1000)
      CustomLoadingScreen.loadingScreenDiv!.style.display = 'block';
      CustomLoadingScreen.loadingScreenDiv!.insertBefore(imgBack, progress);
    }
    // CustomLoadingScreen.loadingScreenDiv!.insertBefore(imgBack, progress);
  }

  public hideLoadingUI() {
    if (!Game._isAssemble) {
      if (!this.waitAMoment) {
        CustomLoadingScreen.loadingScreenDiv!.style.display = 'none';
      } else {
        this.waiting = true;
        // window.document.getElementById("id-progress1")!.style.width = "100%";
        window.document.getElementById("id-progress2")!.innerHTML = "loading...100%";
        setTimeout(this.close.bind(this), 1000);
      }
    }
  }

  public close(): void {
    this.waiting = false;
    CustomLoadingScreen.loadingScreenDiv!.style.display = 'none';
    window.document.getElementById ("menu").style!.display = 'block'
    window.document.getElementById ("bottom-btn").style!.display = 'block'
  }
}