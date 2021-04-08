import { Game } from "./game";
import { Guide } from "./guide";
import { UIMain } from "./uiMain";
import { Question } from "./question";
import { Exhibits } from "./exhibits";
import { GlobalControl } from "./globalControl";
import { ScreenVideo } from "./screenVideo";
import { AudioControl } from "./audioControl";
import { Model3D } from "./model3D";
import { Photo360 } from "./photo360";
import { VeryCharacter } from "./veryNetty/VeryCharacter";

export class Museum {

  private _canvas: HTMLCanvasElement;
  private _engine: BABYLON.Engine;
  private _scene: BABYLON.Scene;
  private _game: Game;

  private _ignore: { [key: string]: boolean } = {};

  public constructor(engine: BABYLON.Engine, scene: BABYLON.Scene, canvas: HTMLCanvasElement, game: Game) {
    this._engine = engine;
    this._scene = scene;
    this._canvas = canvas;
    this._game = game;

    this._ignore['可拼接354'] = true;
    this._ignore['可拼接313'] = true;
    this._ignore['person'] = true;

    this.init();
  }


  private init(): void {

    let scene: BABYLON.Scene = this._scene;
    let that = this;

    let lobbyScreen!: BABYLON.AbstractMesh;
    let videoTex!: BABYLON.VideoTexture;
    let videoLoaded: boolean = false;

    scene.onPointerObservable.add(pInfo => {
    });

    // 模型初始化
    scene.meshes.forEach(mesh => {
      if (!that._ignore[mesh.name]) {
        mesh.isPickable = true;
        mesh.checkCollisions = true;
      }
      if (mesh.name === '画_00') {
      } else if (mesh.name === "标题_255" || mesh.name === "标题_127") {
        (<BABYLON.StandardMaterial>mesh.material!).ambientColor = new BABYLON.Color3(0.173, 0.173, 0.173);
      }
    });

    scene.onKeyboardObservable.add(kbInfo => {
      if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.keyCode === 81 && kbInfo.event.ctrlKey && kbInfo.event.altKey) { //Ctrl + Q
          console.log('Ctrl + Alt + Q');
          this._game.toggleDebug();
        }
      }
    });


    UIMain.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("Museum");

    let guide: Guide = new Guide(scene, this._canvas);

    let exhibits: Exhibits = new Exhibits(scene, this._canvas);
    GlobalControl.exhibits = exhibits;

    let screenVideo: ScreenVideo = new ScreenVideo(scene);
    GlobalControl.screenVideo = screenVideo;
    let audio: AudioControl = new AudioControl(scene);
    GlobalControl.audio = audio;

    let question: Question = new Question(scene, this._canvas);
    GlobalControl.question = question;

    let model3D: Model3D = new Model3D(this._canvas, scene, this._engine);
    GlobalControl.model3D = model3D;

    let photo360: Photo360 = new Photo360(scene, this._canvas, this._engine);
    GlobalControl.photo360 = photo360;

    VeryCharacter._scence = scene;

  }



}