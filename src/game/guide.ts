import { UIControl } from "./ui-control";
import { UIMain } from "./uiMain";
import { SocketManager } from "./veryNetty/SocketManager";
import { VeryNettyPara } from "./veryNetty/VeryNettyPara";

export class Guide {

  private _guideElement: UIControl = new UIControl();

  private _canvas: HTMLCanvasElement;

  private _scene: BABYLON.Scene;

  private _key: number = 0; // 1：w键，2：s键，3：a键，4：d键，5：left左键移动
  // private _keyDic: { [key: string]: boolean } = { 'w': false, 's': false, 'a': false, 'd': false, 'left': false };
  private _waiting: boolean = false;
  private _hasDown: boolean = false;

  private _kbObserver: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>> = null;
  private _pObserver: BABYLON.Nullable<BABYLON.Observer<BABYLON.PointerInfo>> = null;

  public constructor(scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
    this._scene = scene;
    this._canvas = canvas;
    //this.initUI();

    //this.loadPersonData();
  }

  // 模拟异步加载用户数据
  private loadPersonData(): void {
    //BusinessRoom2.act=this.initUI.bind(this);
  };


  public initGuideUI(): void {

    let that = this;

    this._key = 0;

    // GUI
    // 按钮展示流程，UI按逻辑，分成组
    let advancedTexture = UIMain.advancedTexture;

    // guide7 Container 
    let guide7Container = new BABYLON.GUI.Container("guide7-container");
    guide7Container.width = "100%";
    guide7Container.height = "100%";
    guide7Container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide7Container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(guide7Container);
    // image
    let guide7 = new BABYLON.GUI.Image("guide7", "images/guide/7.jpg");
    guide7.width = "100%";
    guide7.height = "100%";
    guide7.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide7.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guide7.isPointerBlocker = true;
    guide7Container.addControl(guide7);
    // btn
    let guide7Btn = BABYLON.GUI.Button.CreateSimpleButton("guide7-btn", "下一步");
    guide7Btn.cornerRadius = 10;
    guide7Btn.color = "white";
    guide7Btn.background = "#ffffff00";
    guide7Btn.top = "-50px";
    // guide7Btn.left = "-50px";
    guide7Btn.width = "200px";
    guide7Btn.height = "70px";
    guide7Btn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide7Btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    guide7Btn.children[0].color = "white";
    guide7Btn.children[0].fontSize = 38;
    guide7Btn.onPointerClickObservable.add( () => {
      that.timer("guide8", 10);
    });
    guide7Container.addControl(guide7Btn);

    // guide8 Container 
    let guide8Container = new BABYLON.GUI.Container("guide8-container");
    guide8Container.width = "100%";
    guide8Container.height = "100%";
    guide8Container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide8Container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(guide8Container);
    // image
    let guide8 = new BABYLON.GUI.Image("guide8", "images/guide/8.jpg");
    guide8.width = "100%";
    guide8.height = "100%";
    guide8.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide8.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guide8.isPointerBlocker = true;
    guide8Container.addControl(guide8);
    // btn
    let guide8Btn = BABYLON.GUI.Button.CreateSimpleButton("guide8-btn", "下一步");
    guide8Btn.cornerRadius = 10;
    guide8Btn.color = "white";
    guide8Btn.background = "#ffffff00";
    guide8Btn.top = "-50px";
    // guide8Btn.left = "-50px";
    guide8Btn.width = "200px";
    guide8Btn.height = "70px";
    guide8Btn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide8Btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    guide8Btn.children[0].color = "white";
    guide8Btn.children[0].fontSize = 38;
    guide8Btn.onPointerClickObservable.add( () => {
      that.timer("done", 10);
    });
    guide8Container.addControl(guide8Btn);

    // guide10 Container 
    let guide10Container = new BABYLON.GUI.Container("guide10-container");
    guide10Container.width = "100%";
    guide10Container.height = "100%";
    guide10Container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide10Container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(guide10Container);
    // image
    let guide10 = new BABYLON.GUI.Image("guide10", "images/guide/10.png");
    guide10.width = "100%";
    guide10.height = "100%";
    guide10.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide10.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guide10.isPointerBlocker = true;
    guide10Container.addControl(guide10);
    // btn
    let guide10Btn = BABYLON.GUI.Button.CreateSimpleButton("guide10-btn", "下一步");
    guide10Btn.cornerRadius = 10;
    guide10Btn.color = "white";
    guide10Btn.background = "#ffffff00";
    guide10Btn.top = "-50px";
    guide10Btn.width = "200px";
    guide10Btn.height = "70px";
    guide10Btn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    guide10Btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    guide10Btn.children[0].color = "white";
    guide10Btn.children[0].fontSize = 38;
    guide10Btn.onPointerClickObservable.add( () => {
      that.timer("guide7", 10);
    });
    guide10Container.addControl(guide10Btn);

    this._guideElement.add('guide7', guide7Container);
    this._guideElement.add('guide8', guide8Container);
    this._guideElement.add('guide10', guide10Container);
    this._guideElement.init('guide10');


  }

  private timer(key: string, time: number = 1000): void {
    this._waiting = true;
    // 等待2秒钟
    setTimeout(this.wait.bind(this), time, key);
  }

  private wait(key: string): void {
    this._key++;
    this._guideElement.display(key);
    this._waiting = false;
  }

  private done(): void {
    this._guideElement.display('');
  }


}