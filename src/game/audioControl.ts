import { GlobalControl } from "./globalControl";
export class AudioControl {
  private _scene: BABYLON.Scene;
  private _backInitialized: boolean = false;
  private _backgroundActive: Nullable<BABYLON.Sound> = null;
  private _backgroundIndex: number = -1;
  private _backgroundPaused: boolean = false;
  private _roomIndex: number = 0;

  private _activeAudio!: BABYLON.Sound;
  public static _bgMusicList: { [keyof: number]: BABYLON.Sound } = {};
  public static _descantList: { [keyof: number]: BABYLON.Sound } = {};
  public static _bgMusicDoors: { [keyof: number]: BABYLON.AbstractMesh } = {};
  private _record: { [key: number]: boolean } = {};

  public constructor(scene: BABYLON.Scene) {
    this._scene = scene;
  }

  public initTrigger(): void {
    let that = this;

    for (const key in AudioControl._bgMusicDoors) {
      let bgm = AudioControl._bgMusicDoors[key];
      let count = 0;
      bgm.actionManager = new BABYLON.ActionManager(that._scene);
      bgm.actionManager!.registerAction(
        new BABYLON.ExecuteCodeAction(
          {
            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
            parameter: {
              mesh: GlobalControl.personMesh,
              usePreciseIntersection: true,
            },
          },
          (evt) => {
            count++;
          }
        )
      );

      bgm.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          {
            trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
            parameter: {
              mesh: GlobalControl.personMesh,
              usePreciseIntersection: true,
            },
          },
          (evt) => {
            if (count % 2 == 1) {
              GlobalControl.PauseVideo();
              GlobalControl.audio.backgroundMusic(false);
              GlobalControl.audio.backgroundMusicChange(Number(key));
              if (AudioControl._descantList[Number(key)]) {
                GlobalControl.audio.playExhibit(Number(key));
              }
            } else {
              GlobalControl.PauseVideo();
              GlobalControl.audio.backgroundMusic(false);
              GlobalControl.audio.backgroundMusicChange(Number(key) - 1);
            }
          }
        )
      );
    }

    GlobalControl.stopAudio = that.stop.bind(that);
  }

  public backgroundMusicChange(index: number): void {
    if (index === this._backgroundIndex) return;
    this._backgroundIndex = index;

    this._backgroundActive = AudioControl._bgMusicList[index];
    for (const key in AudioControl._bgMusicList) {
      AudioControl._bgMusicList[key].pause();
    }
    this.stop();

    // 播放背景音乐
    if (this._backgroundPaused) {
      this._backgroundActive.pause();
    } else {
      // console.log(AudioControl._descantList);
      // console.log(AudioControl._bgMusicList);
      this._backgroundActive.play();
    }
  }

  public backgroundMusic(pause: boolean): void {
    let that = this;
    this._backgroundPaused = pause;
    if (!pause) {
      if (!this._backInitialized) {
        this._backgroundIndex = -1;
        this._backInitialized = true;
        this.backgroundMusicChange(0);
      } else {
        if (this._backgroundActive!.isPaused) {
          this._backgroundActive!.play();
        }
      }
    } else {
      if (this._backgroundActive) {
        this._backgroundActive.pause();
      }
    }
  }

  //播放指定展厅的讲解词，暂停视频的播放
  public playExhibit(index: number): void {
    let that = this;
    // 只播放一遍
    if (this._record[index]) return;
    if (this._record[index]) {
      this._activeAudio.pause();
      GlobalControl.PauseVideo();
      this._record[index] = false;
    } else {
      //暂停原有的解说词
      that.stop();
      this._activeAudio = AudioControl._descantList[index];
      this._activeAudio.play();

      GlobalControl.PauseVideo();
      that.backgroundMusic(false);
      this._record[index] = true;
    }
  }

  public pauseControl(pause: boolean): void {
    //解说暂停
    if (this._activeAudio) {
      if (pause) {
        this._activeAudio.pause();
      } else {
        if (this._activeAudio.isPaused) {
          this._activeAudio.play();
        }
      }
    }
    //背景音乐暂停
    this.backgroundMusic(pause);
  }
  public mute(isMute: boolean): void {
    if (this._backgroundActive) {
      if (isMute) {
        BABYLON.Engine.audioEngine.setGlobalVolume(0)
      } else {
        BABYLON.Engine.audioEngine.setGlobalVolume(0.5)
      }
    }
  }
  //暂停该展厅的音乐
  public stop(): void {
    for (const key in AudioControl._descantList) {
      AudioControl._descantList[key].stop();
    }
  }
}
