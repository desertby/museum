import { GlobalControl } from './globalControl'
import { UIMain } from './uiMain'
import { FloatUitlity } from './mathUtility'

export class Photo360 {
  private _canvas: HTMLCanvasElement
  private _scene: BABYLON.Scene
  private _engine: BABYLON.Engine

  private _lastName: string = ''
  private _lastChangeName: string = ''
  private _lastChangeIndex: number = 0

  private _closeBtn!: BABYLON.GUI.Button
  private _photoDome!: BABYLON.PhotoDome

  private _display: boolean = false

  private _uiLinks!: BABYLON.GUI.Container
  private _uiLinksContainer!: BABYLON.GUI.Container
  private _uiLinksBtns: BABYLON.GUI.Button[] = []
  private _sv!: BABYLON.GUI.ScrollViewer
  private _introPic!: BABYLON.GUI.Image
  private _picCloseBtn!: BABYLON.GUI.Button

  private _lastHasIntro: boolean = false
  private _lastHasLinks: boolean = false

  private _lastHasTriggers: boolean = false
  private _triggersDic: { [key: string]: any } = {}
  private _triggerColor: BABYLON.Color4 = new BABYLON.Color4(1, 1, 1, 1)
  private _timer: number = 0
  private _timeLimit: number = 1
  private _timeDivide: number = 2
  private _size: number = 20

  private _zoomLevel = 60
  private _waitTimeTotal: number = 5000
  private _allowRotate: boolean = false
  private _timeout: any

  private _sixBox: BABYLON.Mesh
  private _sixMaterial: BABYLON.StandardMaterial

  private _success: boolean = false
  private _data: any = null

  private spriteManager!: BABYLON.SpriteManager

  private _test: boolean = false

  public constructor(
    scene: BABYLON.Scene,
    canvas: HTMLCanvasElement,
    engine: BABYLON.Engine
  ) {
    this._scene = scene
    this._canvas = canvas
    this._engine = engine

    this.loadData()

    this._sixBox = BABYLON.MeshBuilder.CreateBox(
      '360-skyBox',
      { size: 1000.0 },
      this._scene
    )
    this._sixBox.position = new BABYLON.Vector3(0, 6500, 0)
    this._sixBox.rotation = BABYLON.Vector3.Zero()

    this._sixMaterial = new BABYLON.StandardMaterial('360-skyBox', this._scene)
    this._sixMaterial.backFaceCulling = false
    this._sixMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
    this._sixMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
    this._sixBox.material = this._sixMaterial
    this._sixBox.setEnabled(false)

    this.spriteManager = new BABYLON.SpriteManager(
      'sm',
      './images/hanghai/point.png',
      1000,
      83,
      scene
    )
    this.spriteManager.isPickable = true

    let that = this

    // 自动旋转控制
    scene.onPointerObservable.add((pInfo) => {
      if (that._display) {
        if (pInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
          // 触发点
          if (that._lastHasTriggers) {
            let pickResult = scene.pickSprite(pInfo.event.x, pInfo.event.y)
            if (pickResult && pickResult.hit) {
              // console.log(pickResult.pickedSprite!.name);
              that.triggerActive(pickResult.pickedSprite!.name)
            }
          }

          // 自动旋转控制
          that.rotateControl()

          // 触发设置
          if (that._test) {
            if (pInfo.pickInfo) {
              // console.warn(pInfo.pickInfo);
              // console.warn(pInfo.pickInfo.pickedMesh!.name);
              console.warn(pInfo.pickInfo.pickedPoint)
              // let s = BABYLON.MeshBuilder.CreateSphere("360-s", { diameter: 20 }, scene);
              // s.position = BABYLON.Vector3.Zero().copyFrom(pInfo.pickInfo.pickedPoint!);
              let p: BABYLON.Vector3 = pInfo.pickInfo
                .pickedPoint!.subtract(pInfo.pickInfo.ray!.origin)
                .multiplyByFloats(0.8, 0.8, 0.8)
                .add(pInfo.pickInfo.ray!.origin)
              console.log(p)
              p = that.calculatePoint(
                pInfo.pickInfo.ray!.origin,
                pInfo.pickInfo.pickedPoint!,
                450
              )
              console.error(p)
              let sprite = new BABYLON.Sprite('360-sprite', that.spriteManager)
              sprite.width = that._size
              sprite.height = that._size
              sprite.position = p
              sprite.isPickable = true
              // sprite.color = new BABYLON.Color4(1, 1, 1, 0.5);
            }
          }
        }
      }
    })

    scene.onBeforeCameraRenderObservable.add(() => {
      if (that._display) {
        // 触发透明渐变
        if (that._lastHasTriggers) {
          that._timer += that._engine.getDeltaTime() * 0.001
          let val: number = that._timer % that._timeDivide
          if (val > that._timeLimit) {
            that._triggerColor.a = FloatUitlity.SLerp(
              1,
              0,
              (val - that._timeLimit) / that._timeLimit
            )
          } else {
            that._triggerColor.a = FloatUitlity.SLerp(
              0,
              1,
              val / that._timeLimit
            )
          }
          that.spriteManager.sprites.forEach((value) => {
            value.color = that._triggerColor
          })
        }

        // 摄像机旋转
        if (this._allowRotate) {
          let deltaTime: number = that._engine.getDeltaTime() * 0.00003
          GlobalControl.camera360.alpha += deltaTime
          GlobalControl.camera360.beta = that.calculateBeta(
            GlobalControl.camera360.beta,
            Math.PI / 2,
            deltaTime
          )
        }
      }
    })

    // scrollview 浏览器窗口resize细节处理
    window.addEventListener('resize', this.linksResize.bind(this))

    // 放大缩小
    that._zoomLevel = GlobalControl.camera360.fov
    this._scene.registerAfterRender(() => {
      if (that._display) {
        GlobalControl.camera360.fov = that._zoomLevel
      }
    })

    let max: number = (Math.PI * 65) / 180
    let min: number = (Math.PI * 32) / 180

    scene.onPointerObservable.add((e) => {
      if (that._display) {
        that._zoomLevel += (e.event as WheelEvent).deltaY * 0.0001
        if (that._zoomLevel < min) {
          that._zoomLevel = min
        }
        if (that._zoomLevel > max) {
          that._zoomLevel = max
        }
      }
    }, BABYLON.PointerEventTypes.POINTERWHEEL)
  }

  private loadData(): void {
    let that = this
    // 获取表格数据
    // axios
    //   .get('./data/360.json')
    //   .then(function (response) {
    //     that._data = response.data
    //     that._success = true
    //     // console.log(that._data);
    //     // that.lobbyVideoInit();
    //   })
    //   .catch(function (error) {
    //     console.log('load error: ' + error)
    //   })
  }

  public camera360(name: string): void {
    let that = this
    this._display = true
    //自动旋转控制
    that.rotateControl()

    // ui初始化
    this.uiInit()

    if (name !== this._lastName) {
      this._lastName = name
      this._lastChangeName = name

      if (this._data[name]) {
        // 是否为单张360图
        let one: boolean = this._data[name].one
        let path = this._data[name].path
        if (this._photoDome) {
          this._photoDome.dispose()
        }
        if (this._sixBox) {
          this._sixBox.setEnabled(false)
        }
        if (one) {
          // 创建360图片
          this._photoDome = new BABYLON.PhotoDome(
            '360-' + name,
            './360/' + path,
            {
              resolution: 32,
              size: 1000,
            },
            this._scene
          )
          this._photoDome.position = new BABYLON.Vector3(0, 6500, 0)
          this._photoDome.rotation = BABYLON.Vector3.Zero()
        } else {
          this._sixMaterial.reflectionTexture = new BABYLON.CubeTexture(
            './360/' + path,
            this._scene
          )
          this._sixMaterial.reflectionTexture.coordinatesMode =
            BABYLON.Texture.SKYBOX_MODE
          this._sixBox.setEnabled(true)
        }

        // 创建introdution图片
        if (
          this._data[name].intro &&
          this._data[name].intro.path &&
          this._data[name].intro.path !== ''
        ) {
          this.initIntroPic(this._data[name].intro)
          this._lastHasIntro = true
        } else {
          this._lastHasIntro = false
        }

        // 创建关联list
        if (this._data[name].links && this._data[name].links.length !== 0) {
          this.initLinks(this._data[name].links)
          this._lastHasLinks = true
        } else {
          this._lastHasLinks = false
        }

        // 创建triggers
        if (
          this._data[name].triggers &&
          this._data[name].triggers.length !== 0
        ) {
          this.initTriggers(this._data[name].triggers)
          this._lastHasTriggers = true
        } else {
          this.triggersControl(false)
          this._lastHasTriggers = false
        }
      }
    } else {
      // intro 显示，TODO：需要判断是否被trigger过
      if (this._lastHasIntro) {
        this.introControl(true)
      }

      // links 显示
      if (this._lastHasLinks) {
        this.linksControl(true)
      }
    }

    // 相机切换
    GlobalControl.ChangeActiveCamera('360')
    GlobalControl.camera360.alpha = -Math.PI / 2
    GlobalControl.camera360.beta = Math.PI / 2
    this._zoomLevel = (Math.PI * 45.84) / 180

    this._lastName = name
  }

  private uiInit(): void {
    let that = this
    // 创建UI，一次
    // 创建关闭按钮
    if (!this._closeBtn) {
      this._closeBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
        '360-close',
        'images/system/quit.png'
      )
      this._closeBtn.top = '20px'
      this._closeBtn.left = '-20px'
      this._closeBtn.width = '50px'
      this._closeBtn.height = '50px'
      this._closeBtn.thickness = 0
      this._closeBtn.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
      this._closeBtn.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
      this._closeBtn.onPointerClickObservable.add(() => {
        that.close()
      })
      UIMain.advancedTexture.addControl(this._closeBtn)
    }
    this._closeBtn.isVisible = true
  }

  private initIntroPic(intro: any): void {
    let that = this
    // 图片
    if (!this._introPic) {
      this._introPic = new BABYLON.GUI.Image('360-intro', './360/' + intro.path)
      this._introPic.width = intro.width + 'px'
      this._introPic.height = intro.height + 'px'
      this._introPic.top = '-100px'
      UIMain.advancedTexture.addControl(this._introPic)
    } else {
      this._introPic.source = './360/' + intro.path
      this._introPic.width = intro.width + 'px'
      this._introPic.height = intro.height + 'px'
      this._introPic.isVisible = true
    }

    // 按钮
    if (!this._picCloseBtn) {
      this._picCloseBtn = BABYLON.GUI.Button.CreateImageOnlyButton(
        '360-intro-close',
        'images/exhibits/close.png'
      )
      this._picCloseBtn.top = -15 - intro.height / 2 - 100 + 'px'
      this._picCloseBtn.left = -15 - intro.width / 2 + 'px'
      this._picCloseBtn.width = '30px'
      this._picCloseBtn.height = '30px'
      this._picCloseBtn.thickness = 0
      this._picCloseBtn.onPointerClickObservable.add(() => {
        that.introControl(false)
      })
      UIMain.advancedTexture.addControl(this._picCloseBtn)
    } else {
      this._picCloseBtn.top = -15 - intro.height / 2 - 100 + 'px'
      this._picCloseBtn.left = -15 - intro.width / 2 + 'px'
      this._picCloseBtn.isVisible = true
    }
  }

  private introControl(flag: boolean): void {
    if (this._introPic) {
      this._introPic.isVisible = flag
    }
    if (this._picCloseBtn) {
      this._picCloseBtn.isVisible = flag
    }
  }

  private linksCount: number = 0
  private linksResize() {
    let svWidth: string = '100%'
    let clientWidth: number = this._canvas.clientWidth
    if (110 * this.linksCount - 10 < clientWidth) {
      svWidth = 110 * this.linksCount - 10 + 'px'
    }
    if (this._sv) {
      this._sv.width = svWidth
    }
  }

  private initLinks(links: any): void {
    let that = this

    // links
    if (!this._uiLinks) {
      this._uiLinks = new BABYLON.GUI.Container('360-links')
      this._uiLinks.width = '100%'
      this._uiLinks.height = '110px'
      this._uiLinks.background = '#00000033'
      this._uiLinks.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
      this._uiLinks.top = '-50px'
      UIMain.advancedTexture.addControl(this._uiLinks)
    } else {
      this._uiLinks.isVisible = true
    }
    this.linksCount = links.length
    // TODO: 这样还不够，需要识别浏览器resize，动态设置
    let clientWidth: number = this._canvas.clientWidth
    let svWidth: string = '100%'
    if (110 * this.linksCount - 10 < clientWidth) {
      svWidth = 110 * this.linksCount - 10 + 'px'
    }

    // scrollview
    if (!this._sv) {
      this._sv = new BABYLON.GUI.ScrollViewer('360-links-scrollview')
      this._sv.barColor = '#ffffff00'
      this._sv.thickness = 0
      this._sv.barSize = 8
      this._sv.barColor = '#FFA500'
      this._sv.background = '#CCCCCC00'
      this._sv.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
      this._sv.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
      // this._sv.top = "140px";
      this._sv.width = svWidth
      this._sv.height = '100%'
      // this._sv.paddingLeft = "30px";
      // this._sv.paddingRight = "30px";
      this._uiLinks.addControl(this._sv)
    } else {
      this._sv.width = svWidth
      this._sv.isVisible = true
    }

    // linksContainer
    if (this._uiLinksContainer) {
      this._uiLinksContainer.dispose()
    }
    this._uiLinksContainer = new BABYLON.GUI.Container('360-links-container')
    this._uiLinksContainer.height = '100%'
    this._uiLinksContainer.width = 110 * this.linksCount - 10 + 'px'
    this._sv.addControl(this._uiLinksContainer)

    this._uiLinksBtns = []

    // 创建links button
    for (let i: number = 0; i < this.linksCount; i++) {
      let name: string = links[i]
      if (this._data[name]) {
        let btn = BABYLON.GUI.Button.CreateImageOnlyButton(
          '360-link-' + (i + 1),
          './360/' + this._data[name].thumbnail
        )
        btn.thickness = 3
        btn.width = '100px'
        btn.height = '100px'
        btn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        btn.left = i * 110 + 'px'
        if (name === this._lastChangeName) {
          btn.color = '#FFA500'
          this._lastChangeIndex = i
        } else {
          btn.color = 'white'
        }
        btn.onPointerClickObservable.add(() => {
          that.change360(name, i)
        })
        this._uiLinksContainer.addControl(btn)
        this._uiLinksBtns.push(btn)

        let text: string = name
        if (text.length > 6) {
          text = text.substr(0, 5) + '...'
        }

        let btn2 = BABYLON.GUI.Button.CreateSimpleButton(
          '360-link-text-' + (i + 1),
          text
        )
        btn2.thickness = 0
        btn2.width = '100%'
        btn2.height = '20px'
        btn2.color = 'white'
        btn2.background = '#000000B2'
        btn2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        btn2.children[0].fontSize = 14
        btn.addControl(btn2)
      } else {
        console.error('360关联列表信息错误，link name：' + name)
      }
    }
  }

  private linksControl(flag: boolean): void {
    if (this._uiLinks) {
      this._uiLinks.isVisible = flag
    }
  }

  private calculatePoint(
    start: BABYLON.Vector3,
    end: BABYLON.Vector3,
    length: number
  ): BABYLON.Vector3 {
    let maxLength = BABYLON.Vector3.Distance(start, end)
    return BABYLON.Vector3.Lerp(start, end, (length * 1.0) / maxLength)
  }

  private change360(name: string, index: number): void {
    // console.log("change, name:" + name + ", index: " + index);
    if (name !== this._lastChangeName) {
      this._lastChangeName = name

      GlobalControl.camera360.alpha = -Math.PI / 2
      GlobalControl.camera360.beta = Math.PI / 2
      this._zoomLevel = (Math.PI * 45.84) / 180

      // 自动旋转控制
      this.rotateControl()

      // 切换360，切换intro，切换trigger
      if (this._photoDome) {
        this._photoDome.dispose()
      }
      if (this._sixBox) {
        this._sixBox.setEnabled(false)
      }
      // 是否为单张360图
      let one: boolean = this._data[name].one
      let path = this._data[name].path
      if (one) {
        // 创建360图片
        this._photoDome = new BABYLON.PhotoDome(
          '360-' + name,
          './360/' + path,
          {
            resolution: 32,
            size: 1000,
          },
          this._scene
        )
        this._photoDome.position = new BABYLON.Vector3(0, 6500, 0)
        this._photoDome.rotation = BABYLON.Vector3.Zero()
      } else {
        this._sixMaterial.reflectionTexture = new BABYLON.CubeTexture(
          './360/' + path,
          this._scene
        )
        this._sixMaterial.reflectionTexture.coordinatesMode =
          BABYLON.Texture.SKYBOX_MODE
        this._sixBox.setEnabled(true)
      }

      // 切换intro
      if (
        this._data[name].intro &&
        this._data[name].intro.path &&
        this._data[name].intro.path !== ''
      ) {
        this.initIntroPic(this._data[name].intro)
        this._lastHasIntro = true
      } else {
        this.introControl(false)
        this._lastHasIntro = false
      }

      // 切换trigger
      if (this._data[name].triggers && this._data[name].triggers.length !== 0) {
        this.initTriggers(this._data[name].triggers)
        this._lastHasTriggers = true
      } else {
        this.triggersControl(false)
        this._lastHasTriggers = false
      }
      // 高亮切换
      this._uiLinksBtns[this._lastChangeIndex].color = 'white'
      this._lastChangeIndex = index
      this._uiLinksBtns[this._lastChangeIndex].color = '#FFA500'
    }
  }

  private initTriggers(triggers: any): void {
    this.spriteManager.sprites.forEach((value) => {
      value.dispose()
    })
    this.spriteManager.sprites = []
    this._triggersDic = {}

    for (let i: number = 0; i < triggers.length; i++) {
      if (triggers[i].position) {
        let sprite = new BABYLON.Sprite('360-sprite-' + i, this.spriteManager)
        sprite.width = this._size
        sprite.height = this._size
        sprite.position = new BABYLON.Vector3(
          triggers[i].position.x,
          triggers[i].position.y,
          triggers[i].position.z
        )
        sprite.isPickable = true
        this._triggersDic[sprite.name] = triggers[i].intro
      }
    }
  }

  private triggersControl(flag: boolean): void {
    if (!flag) {
      this.spriteManager.sprites.forEach((value) => {
        value.dispose()
      })
      this.spriteManager.sprites = []
      this._triggersDic = {}
    }
  }

  private triggerActive(name: string): void {
    if (this._triggersDic[name]) {
      this.initIntroPic(this._triggersDic[name])
      this._lastHasIntro = true
    }
  }

  private rotateControl(): void {
    // 自动旋转
    this._allowRotate = false
    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    this._timeout = setTimeout(this.startRotate.bind(this), this._waitTimeTotal)
  }

  private startRotate(): void {
    this._allowRotate = true
  }

  private calculateBeta(
    origin: number,
    limiter: number,
    delta_time: number
  ): number {
    if (origin === limiter) {
    } else if (origin > limiter) {
      origin -= delta_time
      if (origin < limiter) origin = limiter
    } else {
      origin += delta_time
      if (origin > limiter) origin = limiter
    }
    return origin
  }

  public close(): void {
    // UI控制
    this.uiClose()

    this._display = false
    this._allowRotate = false

    // 显示person按钮
    UIMain.closePersonMenu(false)

    // 相机切换
    GlobalControl.ChangeActiveCamera('first')
  }

  private uiClose(): void {
    // 隐藏close
    if (this._closeBtn) {
      this._closeBtn.isVisible = false
    }

    // 隐藏link
    this.linksControl(false)

    // 隐藏introPic
    this.introControl(false)
  }
}
