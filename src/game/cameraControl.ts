import { GlobalControl } from "./globalControl";
import { Game } from "./game";
import { VeryNettyPara } from "./veryNetty/VeryNettyPara";

export class CameraControl {
  private _canvas: HTMLCanvasElement;
  private _scene: BABYLON.Scene;

  private _camera1!: BABYLON.UniversalCamera;
  private _camera2!: BABYLON.ArcRotateCamera;

  public constructor(scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
    this._scene = scene;
    this._canvas = canvas;
    this.firstPerson();
    // this.camera360();
  }

  public firstPerson(): void {
    
    this._camera1 = new BABYLON.UniversalCamera( "UniversalCamera",new BABYLON.Vector3(0, 160.8, 0),this._scene);
    this._camera1.rotation = new BABYLON.Vector3(0, 0, 0);
    this._camera1.attachControl(this._canvas, true);
    this._camera1.ellipsoid = new BABYLON.Vector3(8, 80, 8);
    this._camera1.touchAngularSensibility = 70000;
    this._camera1.speed = 0;
    this._camera1.inputs.attached.mouse.detachControl(this._canvas);

    this._camera1.applyGravity = true;
    this._camera1.checkCollisions = true;
    this._camera1.keysUp.push(87);
    this._camera1.keysDown.push(83);
    this._camera1.keysLeft.push(65);
    this._camera1.keysRight.push(68);

    GlobalControl.personMesh = BABYLON.MeshBuilder.CreateSphere(
      "person",
      { diameter: 50, updatable: true },
      this._scene
    );
    GlobalControl.personMesh.isVisible = false;
    GlobalControl.personMesh.isPickable = false;
    GlobalControl.personMesh.setParent(this._camera1);
    GlobalControl.personMesh.position = BABYLON.Vector3.Zero();

    this._camera2 = new BABYLON.ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 2,
      5,
      BABYLON.Vector3.Zero(),
      this._scene
    );

    this._camera2.maxZ = 20000;
    this._camera2.target = new BABYLON.Vector3(0, 6500, 0);
    this._camera2.radius = 60;
    this._camera2.alpha = 0;
    this._camera2.beta = Math.PI / 2;

    this._camera2.setEnabled(false);
    GlobalControl.camera360 = this._camera2;
  }

  public changeActiveCamera(type: string): void {
    if (type === "360") {
      this._camera1.setEnabled(false);
      this._camera2.setEnabled(true);
      this._camera2.target = new BABYLON.Vector3(0, 6500, 0);
      this._camera2.radius = 60;
      this._camera2.alpha = 0;
      this._camera2.beta = Math.PI / 2;
      this._camera1.detachControl(this._canvas);
      this._camera2.attachControl(this._canvas, true);
      this._camera2.inputs.attached.mousewheel.detachControl(this._canvas);
      this._scene.activeCamera = this._camera2;
    } else if (type === "first") {
      this._camera1.setEnabled(true);
      this._camera2.detachControl(this._canvas);
      this._camera1.attachControl(this._canvas, true);
      this._scene.activeCamera = this._camera1;
      this._camera2.setEnabled(false);
    }
  }

  public focusCamera(): void {
    this._camera1 = new BABYLON.UniversalCamera(
      "UniversalCamera",
      new BABYLON.Vector3(0, 167.5, 0),
      this._scene
    );
    this._camera1.attachControl(this._canvas, true);
    this._camera1.keysUp.push(87);
    this._camera1.keysDown.push(83);
    this._camera1.keysLeft.push(65);
    this._camera1.keysRight.push(68);
    this._camera1.speed = 6;
    this._camera1.touchAngularSensibility = 70000;
  }

  // TODO
  public changeCamera(): void {
    this._camera2 = new BABYLON.ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 2,
      5,
      BABYLON.Vector3.Zero(),
      this._scene
    );
    this._camera2.attachControl(this._canvas, true);
    this._camera2.inputs.attached.mousewheel.detachControl(this._canvas);

    this._camera2.target = new BABYLON.Vector3(0, 6500, 0);
    this._camera2.radius = 60;
    this._camera2.alpha = 0;
    this._camera2.beta = Math.PI / 2;

    var dome = new BABYLON.PhotoDome(
      "testdome",
      "images/360/test1.jpg",
      {
        resolution: 32,
        size: 1000,
      },
      this._scene
    );
    dome.position = new BABYLON.Vector3(0, 6500, 0);

    this._scene.activeCamera = this._camera2;
  }

  public camera360(): void {
    let camera = new BABYLON.ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 2,
      5,
      BABYLON.Vector3.Zero(),
      this._scene
    );
    camera.attachControl(this._canvas, true);

    let dome = new BABYLON.PhotoDome(
      "testdome",
      "./images/360/nanjing/南京条约史料陈列馆/5展厅内景（第二部分）.jpg",
      {
        resolution: 64,
        size: 500,
      },
      this._scene
    );
  }
}
