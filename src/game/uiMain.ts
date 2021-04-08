import { CameraControl } from "./cameraControl";

export class UIMain {

  // UI
  public static advancedTexture: BABYLON.GUI.AdvancedDynamicTexture;

  public static personInfoBtn: BABYLON.GUI.Button;
  public static personInfoPanel: BABYLON.GUI.Rectangle;

  // Camera
  // public static cameraControl: CameraControl;

  public static lobbyScreen: BABYLON.AbstractMesh;
  
  public constructor() {

  }



  public static closePersonMenu(close: boolean): void {
    if (close) {
      if (UIMain.personInfoBtn) {
        UIMain.personInfoBtn.isVisible = false;
      }
      if (UIMain.personInfoPanel) {
        UIMain.personInfoPanel.isVisible = false;
      }
    } else {
      if (UIMain.personInfoBtn) {
        UIMain.personInfoBtn.isVisible = true;
      }
    }
  }


}