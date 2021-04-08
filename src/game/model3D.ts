import { GlobalControl } from "./globalControl";
import { CustomLoadingScreen } from "./loading";
import { Game } from "./game";

export class Model3D {
  private _canvasMain: HTMLCanvasElement;
  private _sceneMain: BABYLON.Scene;
  private _engineMain: BABYLON.Engine;
  private _game: Game;

  private _canvas3D: HTMLCanvasElement;
  private _scene3D!: BABYLON.Scene;
  private _engine3D!: BABYLON.Engine;

  private _lastName: string = "";

  public modelListNumber: number = 0;
  private leftVideoArrow: BABYLON.GUI.Button;
  private rightVideoArrow: BABYLON.GUI.Button;
  private closeTex: BABYLON.GUI.AdvancedDynamicTexture;
  public modelList: [string];

  public constructor(
    canvas: HTMLCanvasElement,
    scene: BABYLON.Scene,
    engine: BABYLON.Engine
  ) {
    this._canvasMain = canvas;
    this._sceneMain = scene;
    this._engineMain = engine;

    this._canvas3D = <HTMLCanvasElement>document.getElementById("model3d");
  }

  public modelSeries(modelList: [string]): void {
    let that = this;
    GlobalControl.model3D.modelList = modelList;
    console.log(
      GlobalControl.model3D.modelList,
      GlobalControl.model3D.modelList.length
    );
    GlobalControl.model3D.modelListNumber = 0;
    GlobalControl.OpenModel3D(modelList[GlobalControl.model3D.modelListNumber]);
  }

  public openModel(name: string): void {
    this._canvas3D.style.display = "block";
    this._canvasMain.style.display = "none";
    if (name !== this._lastName) {
      this.initialize(name);
    }
    this._lastName = name;
  }

  public close(): void {
    this._canvasMain.style.display = "block";
    this._canvas3D.style.display = "none";

    // this.leftVideoArrow.dispose();
    // this.rightVideoArrow.dispose();
    // this.closeTex.dispose();
  }

  private initialize(path: string): void {
    if (this._engine3D) {
      this._engine3D.dispose();
    }
    this._engine3D = new BABYLON.Engine(this._canvas3D, true);
    // Resize
    let engine = this._engine3D;
    window.addEventListener("resize", function () {
      engine.resize();
    });

    // TODO: 加载过度动画开
    var loadingScreen = new CustomLoadingScreen("");
    engine.loadingScreen = loadingScreen;
    engine.displayLoadingUI();

    this._scene3D = new BABYLON.Scene(this._engine3D);
    var camera = new BABYLON.ArcRotateCamera(
      "Model3DCamera",
      -Math.PI / 2,
      Math.PI / 2,
      5,
      new BABYLON.Vector3(0, 0, 0),
      this._scene3D
    );
    camera.attachControl(this._canvas3D, true);

    // 灯光
    var light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      this._scene3D
    );

    let that = this;
    // camera
    that.closeTex = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "Model-3D",
      undefined,
      this._scene3D
    );
    let closeBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
      "close",
      "images/system/quit.png"
    );
    closeBtn.top = "20px";
    closeBtn.left = "20px";
    closeBtn.width = "50px";
    closeBtn.height = "50px";
    closeBtn.thickness = 0;
    closeBtn.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    closeBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    closeBtn.onPointerClickObservable.add(() => {
      that.close();
    });
    that.closeTex.addControl(closeBtn);

    that.leftVideoArrow = BABYLON.GUI.Button.CreateImageOnlyButton(
      "leftVideoArrow",
      "images/exhibits/left2.png"
    );
    that.leftVideoArrow.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    that.leftVideoArrow.width = "60px";
    that.leftVideoArrow.height = "60px";
    that.leftVideoArrow.top = "0px";
    that.leftVideoArrow.left = "160px";
    that.leftVideoArrow.thickness = 0;
    that.leftVideoArrow.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    that.leftVideoArrow.onPointerClickObservable.add(() => {
      GlobalControl.model3D.modelListNumber--;
      console.log(GlobalControl.model3D.modelListNumber);
      GlobalControl.OpenModel3D(
        GlobalControl.model3D.modelList[GlobalControl.model3D.modelListNumber]
      );
    });
    that.closeTex.addControl(that.leftVideoArrow);

    that.rightVideoArrow = BABYLON.GUI.Button.CreateImageOnlyButton(
      "rightVideoArrow",
      "images/exhibits/right2.png"
    );
    that.rightVideoArrow.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    that.rightVideoArrow.width = "60px";
    that.rightVideoArrow.height = "60px";
    that.rightVideoArrow.top = "0px";
    that.rightVideoArrow.left = "-160px";
    that.rightVideoArrow.thickness = 0;
    that.rightVideoArrow.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    that.rightVideoArrow.onPointerClickObservable.add(() => {
      GlobalControl.model3D.modelListNumber++;
      console.log(GlobalControl.model3D.modelListNumber);
      GlobalControl.OpenModel3D(
        GlobalControl.model3D.modelList[GlobalControl.model3D.modelListNumber]
      );
    });
    that.closeTex.addControl(that.rightVideoArrow);

    if (GlobalControl.model3D.modelListNumber === 0) {
      that.leftVideoArrow.isVisible = false;
    } else that.leftVideoArrow.isVisible = true;

    if (
      GlobalControl.model3D.modelListNumber ===
      GlobalControl.model3D.modelList.length - 1
    ) {
      that.rightVideoArrow.isVisible = false;
    } else that.rightVideoArrow.isVisible = true;

    if (GlobalControl.model3D.modelList.length === 1) {
      that.leftVideoArrow.isVisible = false;
      that.rightVideoArrow.isVisible = false;
    }

    let progressFunc = function (evt: BABYLON.SceneLoaderProgressEvent): void {
      var loadedPercent: number = 0;
      var loadedPercentStr: string = "0%";
      if (evt.lengthComputable) {
        loadedPercent = (evt.loaded * 100) / evt.total;
        if (loadedPercent === 100) {
          loadedPercentStr = "99%";
        } else {
          loadedPercentStr = loadedPercent.toFixed() + "%";
        }
      } else {
        var dlCount = evt.loaded / (1024 * 1024);
        loadedPercent = Math.floor(dlCount * 100.0) / 100.0;
        if (loadedPercent === 100) {
          loadedPercentStr = "99%";
        } else {
          loadedPercentStr = loadedPercent.toFixed() + "%";
        }
      }
      // assuming "loadingScreenPercent" is an existing html element
      // console.warn(loadedPercent);
      window.document.getElementById(
        "id-progress1"
      )!.style.width = loadedPercentStr;
      window.document.getElementById(
        "id-progress2"
      )!.innerHTML = loadedPercentStr;
    };

    let pathArray: string[] = path.split(/\//g);
    let name = pathArray.pop();
    let path1 = "./picModel/" + pathArray.join("/");

    BABYLON.SceneLoader.Append(
      path1 + "/",
      name,
      this._scene3D,
      function (scene) {
        // do something with the scene

        // 加载过度动画关
        // engine.hideLoadingUI();
        scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.Gray());
        scene.ambientColor = BABYLON.Color3.Gray();
        let pos = BABYLON.Vector3.Zero().copyFrom(scene.meshes[0].position);

        camera.setTarget(scene.meshes[0]);
        camera.setPosition(new BABYLON.Vector3(pos.x, pos.y, pos.z + 150));
        camera.radius = 500;
      },
      progressFunc
    );

    this._engine3D.runRenderLoop(() => {
      if (this._scene3D) {
        this._scene3D.render();
      }
    });
  }
}
