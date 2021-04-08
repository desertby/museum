import { UIMain } from './uiMain'

export class HighPic {
  //private _highPic!: BABYLON.GUI.Image;
  // private picCloseBtn!: BABYLON.GUI.Button;
  // private leftArrow!: BABYLON.GUI.Button;
  // private rightArrow!: BABYLON.GUI.Button;
  private _picIndex = 0
  private _parentRect!: BABYLON.GUI.Rectangle

  private _pictures: PictureData[] = []
  private _uis: BABYLON.GUI.StackPanel[] = []
  private _currentIndex: number = 1
  private advancedTexture!: BABYLON.GUI.AdvancedDynamicTexture

  private _picsuccess: boolean = false
  private _picdata: any = null

  public constructor(
    canvas: HTMLCanvasElement,
    scene: BABYLON.Scene,
    engine: BABYLON.Engine
  ) {}

  private loadPicData(): void {
    let that = this
    // 获取表格数据
    axios
      .get('./data/highPicture.json')
      .then(function (response) {
        that._picdata = response.data
        that._picsuccess = true
      })
      .catch(function (error) {
        console.log('load error: ' + error)
      })
  }

  public initHighPic(intro: string): void {
    console.log('tupianne')
    let that = this

    //读取json相对应的数据
    if (this._picdata[intro]) {
      this._pictures = []
      for (let i: number = 0; i < this._picdata[intro].length; i++) {
        let para: PictureData = {
          index: this._picdata[intro][i].index,
          path: this._picdata[intro][i].path,
          width: this._picdata[intro][i].width,
          height: this._picdata[intro][i].height,
          introduct: this._picdata[intro][i].introduct,
        }
        this._pictures.push(para)
      }
      this.createPicUI(this._pictures)
      this._currentIndex = 1
    }
  }

  //创建所对应的UI
  public createPicUI(intro: PictureData[]): void {
    let that = this
    this.advancedTexture = UIMain.advancedTexture

    // 透明背景
    let picParent = new BABYLON.GUI.Rectangle('pic-parent')
    picParent.width = '800px'
    picParent.height = '600px'
    picParent.background = '#ffffff00'
    picParent.color = '#ffffff00'
    picParent.thickness = 0
    this.advancedTexture.addControl(picParent)
    this._parentRect = picParent

    for (let i: number = 0; i < intro.length; i++) {
      let picPanel = new BABYLON.GUI.StackPanel('picture-panel-' + i)
      picPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
      picParent.addControl(picPanel)

      let pictureDisplay = new BABYLON.GUI.Image(
        'picture' + intro[i].index,
        intro[i].path
      )
      pictureDisplay.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
      pictureDisplay.height = intro[i].height
      pictureDisplay.width = intro[i].width
      picParent.addControl(pictureDisplay)

      picParent.addControl(this.creatBodyUI(intro[i], intro.length))

      //关闭按钮
      let picCloseBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
        'high-pic-close',
        'images/exhibits/close.png'
      )
      picCloseBtn.top = -15 - intro[that._picIndex].height / 2 - 100 + 'px'
      picCloseBtn.left = -15 - intro[that._picIndex].width / 2 + 'px'
      picCloseBtn.width = '30px'
      picCloseBtn.height = '30px'
      picCloseBtn.thickness = 0
      picCloseBtn.onPointerClickObservable.add(() => {
        that.closepicture()
      })
      picParent.addControl(picCloseBtn)

      if (i !== 0) {
        picPanel.isVisible = false
      }
      this._uis.push(picPanel)
    }
  }

  private creatBodyUI(data: PictureData, count: number): BABYLON.GUI.Container {
    let that = this
    //container
    let pictureContainer = new BABYLON.GUI.Rectangle('picture-body-container')
    pictureContainer.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
    pictureContainer.width = '100%'
    pictureContainer.height = '700px'
    pictureContainer.background = '#ffffff00'
    pictureContainer.color = '#ffffff00'
    pictureContainer.thickness = 0

    let indexTitle = new BABYLON.GUI.TextBlock('pic-index-title')
    indexTitle.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    indexTitle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
    indexTitle.text = '(' + data.index + '/' + count + ')'
    indexTitle.color = '#696969'
    indexTitle.width = '55px'
    indexTitle.height = '40px'
    indexTitle.fontSize = 20
    pictureContainer.addControl(indexTitle)

    //左右按钮
    if (data.index !== 1) {
      let leftArrow = BABYLON.GUI.Button.CreateImageOnlyButton(
        'left-arrow',
        'images/pic/left.png'
      )
      leftArrow.width = '38px'
      leftArrow.height = '63px'
      leftArrow.top = '-100px'
      leftArrow.left = '-' + (data.width / 2 + 30) + 'px'
      leftArrow.thickness = 0
      leftArrow.onPointerClickObservable.add(() => {
        that.previous(data.index)
      })
      pictureContainer.addControl(leftArrow)
    }

    if (data.index !== count) {
      let rightArrow = BABYLON.GUI.Button.CreateImageOnlyButton(
        'right-arrow',
        'images/pic/right.png'
      )
      rightArrow.width = '38px'
      rightArrow.height = '63px'
      rightArrow.top = '-100px'
      rightArrow.left = data.width / 2 + 30 + 'px'
      rightArrow.thickness = 0
      rightArrow.onPointerClickObservable.add(() => {
        that.next(data.index)
      })
      pictureContainer.addControl(rightArrow)
    }

    return pictureContainer
  }

  public next(current_index: number): void {
    if (current_index < this._pictures.length) {
      this._currentIndex++
      this.show(this._currentIndex)
    }
  }

  public previous(current_index: number): void {
    if (current_index > 1) {
      this._currentIndex--
      this.show(this._currentIndex)
    }
  }

  public show(current_index: number): void {
    this._uis.forEach((value, index) => {
      if (index + 1 === current_index) {
        value.isVisible = true
      } else {
        value.isVisible = false
      }
    })
  }

  public closepicture(): void {
    //this._hide = true;
    this._parentRect.isVisible = false
  }
}

export interface PictureData {
  index: number
  path: string
  width: number
  height: number
  introduct?: string[] | undefined
}
