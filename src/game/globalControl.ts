import { Model3D } from "./model3D";
import { CameraControl } from "./cameraControl";
import { Photo360 } from "./photo360";
import { AudioControl } from "./audioControl";
import { ScreenVideo } from "./screenVideo";
import { Exhibits } from "./exhibits";
import { UIMain } from "./uiMain";
import { Question } from "./question";
import { Game } from "./game";
import moduleName from "module";

export class GlobalControl {
  public static lobbyScreenVideoTex: BABYLON.VideoTexture;

  public static personMesh: BABYLON.AbstractMesh;

  public static stopAudio: () => void;

  public static stopVideo: () => void;

  public static model3D: Model3D;
  public static photo360: Photo360;
  public static camera360: BABYLON.ArcRotateCamera;

  public static cameraChange: CameraControl;

  public static audio: AudioControl;

  public static screenVideo: ScreenVideo;
  public static exhibits: Exhibits;
  public static question: Question;
  public static screenVideoOn: boolean = false;
  public static game:Game;

  // 分包加载
  public static subPackage: boolean = false;
  public static subPackageTex: BABYLON.GUI.AdvancedDynamicTexture;
  public static subPackagePlane: BABYLON.AbstractMesh;
  public static doorMsg: BABYLON.GUI.TextBlock;
  public static subPackageComplete: boolean = false;

  public constructor() {}

  public static LobbyVideoControl(cmd: boolean): void {
    if (GlobalControl.lobbyScreenVideoTex) {
      if (cmd) {
        GlobalControl.lobbyScreenVideoTex.video.play();
      } else {
        GlobalControl.lobbyScreenVideoTex.video.pause();
      }
    }
  }

  public static OpenModel3D(name: string): void {
    if (GlobalControl.model3D) {
      GlobalControl.model3D.openModel(name);
    }
  }
  public static OpenModelSeries(name: [string]): void {
    if (GlobalControl.model3D) {
      GlobalControl.model3D.modelSeries(name);
    }
  }
  public static OpenPhoto360(name: string): void {
    if (GlobalControl.photo360) {
      GlobalControl.photo360.camera360(name);
      UIMain.closePersonMenu(true);
    }
  }

  public static ChangeActiveCamera(type: string): void {
    if (GlobalControl.cameraChange) {
      GlobalControl.cameraChange.changeActiveCamera(type);
    }
  }

  public static mute(isMute: boolean): void {
    GlobalControl.audio.mute(isMute);
    GlobalControl.screenVideo.mute(isMute);
  }

  public static PauseAudio(pause: boolean): void {
    if (GlobalControl.audio) {
      GlobalControl.audio.pauseControl(pause);
    }
  }

  public static PauseVideo(): void {
    GlobalControl.PauseScreenVideo();
    GlobalControl.PauseExhibitsVideo();
  }

  public static PauseScreenVideo(): void {
    if (GlobalControl.screenVideo) {
      GlobalControl.screenVideo.stop();
    }
  }

  public static PauseExhibitsVideo(): void {
    if (GlobalControl.exhibits) {
      GlobalControl.exhibits.pauseVideo();
    }
  }
}
