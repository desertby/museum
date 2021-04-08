// import { Question } from './../../.vscode/src/game/question';
import { UIMain } from "./uiMain";
import { UIControl } from "./ui-control";
import { SocketManager } from "./veryNetty/SocketManager";
import { VeryNettyPara } from "./veryNetty/VeryNettyPara";
import { ByteBuffer } from "./veryNetty/ByteBuffer";
import { xuebei } from "./xuebei";
import { GlobalControl } from "./globalControl";
import { Exhibits } from "./exhibits";
import { Language } from "./language";

export class Question {
  private _guideElement: UIControl = new UIControl();
  private _canvas: HTMLCanvasElement;
  private _scene: BABYLON.Scene;

  private _checking: boolean = false;
  private _hide: boolean = false;

  private advancedTexture!: BABYLON.GUI.AdvancedDynamicTexture;
  private _parentRect!: BABYLON.GUI.Rectangle;
  private _successUI!: BABYLON.GUI.Image;

  private _uis: BABYLON.GUI.StackPanel[] = [];
  private _btnsDic: { [key: number]: BABYLON.GUI.Button[] } = {};
  private _correntDic: { [keyof: number]: BABYLON.GUI.Image } = {};

  private _pressedDic: { [key: number]: number[] } = {};
  private _answers: boolean[] = [];
  private _currentIndex: number = 1;

  private _success: boolean = false;
  public static _data: any = null;
  private _personData: number = -1;

  private _questions: QuestionData[] = [];
  public static _doors: BABYLON.AbstractMesh[] = [];
  public static _locks: BABYLON.AbstractMesh[] = [];
  public static _doorNumbers: number = 0;
  private _specialDoor!: BABYLON.AbstractMesh;
  private pickedMesh!: BABYLON.AbstractMesh;

  private _exhibitsData: any = null;
  private _exhibits: exData[] = [];
  public static singleScore: number = 0;

  public constructor(scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
    this._scene = scene;
    this._canvas = canvas;

    let that = this;

    this.loadQuestionData();
    this.test();
  }

  private loadQuestionData(): void {
    let that = this;
    // 获取表格数据
    axios
      .get("./data/question.json")
      .then(function (response) {
        Question._data = response.data;
        that._success = true;
        // console.log(that._data);
      })
      .catch(function (error) {
        console.log("load error: " + error);
      });
  }

  private loadExhibitsData(): void {
    let that = this;
    // 获取表格数据
    axios
      .get("./data/assemble.json")
      .then(function (response) {
        that._exhibitsData = response.data;
        that.loadExhibits("exhibits");
      })
      .catch(function (error) {
        console.log("load error: " + error);
      });
  }

  private loadPersonData(): void {
    //BusinessRoom.act=this.gogo.bind(this);
  }

  private gogo(buf: ByteBuffer) {
    VeryNettyPara.roomIndex = buf.ReadInt();
    this._personData = VeryNettyPara.roomIndex - 1;
    console.log(this._personData);
  }

  // 鼠标点击小锁，出现考试界面
  public startExam(house_name: string): void {
    console.log(Question._data);
    if (!this._hide && this._checking) {
      if (Question._data[house_name]) {
        this.close();
      }
      return;
    }

    if (this._hide && this._parentRect) {
      if (Question._data[house_name]) {
        this._parentRect.isVisible = true;
        this._hide = false;
      }
      return;
    }

    if (!this._checking && this._success) {
      this._checking = true;
      this._hide = false;

      if (Question._data[house_name]) {
        this._questions = [];
        for (let i: number = 0; i < Question._data[house_name].length; i++) {
          let para: QuestionData = {
            type: Question._data[house_name][i].type,
            index: Question._data[house_name][i].index,
            question: Question._data[house_name][i].question,
            options: Question._data[house_name][i].options,
            answer: Question._data[house_name][i].answer,
            answers: Question._data[house_name][i].answers,
          };
          this._questions.push(para);
          this._answers.push(false);
        }

        this.createUI(this._questions);

        this._currentIndex = 1;
      }
    }
  }

  public createUI(questions: QuestionData[]): void {
    let that = this;
    // GUI
    this.advancedTexture = UIMain.advancedTexture;

    // 透明背景
    let questionParent = new BABYLON.GUI.Rectangle("question-parent");
    questionParent.width = "800px";
    questionParent.height = "600px";
    questionParent.background = "#ffffff00";
    questionParent.color = "#ffffff00";
    questionParent.thickness = 0;
    this.advancedTexture.addControl(questionParent);
    this._parentRect = questionParent;

    this._successUI = new BABYLON.GUI.Image(
      "question-success",
      "images/question/pass" + Exhibits.lang_flg + ".png"
    );
    this._successUI.width = "226px";
    this._successUI.height = "54px";
    this._successUI.isVisible = false;
    this.advancedTexture.addControl(this._successUI);

    // 同一时间创建好所有问答题UI
    for (let i: number = 0; i < questions.length; i++) {
      let composePanel = new BABYLON.GUI.StackPanel("question-panel-" + i);
      composePanel.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      questionParent.addControl(composePanel);

      let topArea = new BABYLON.GUI.Container("top-area");
      topArea.height = "50px";
      topArea.background = "#ffffff00";
      topArea.color = "#ffffff00";
      composePanel.addControl(topArea);

      let correctJudge = new BABYLON.GUI.Image(
        "correct-error",
        "images/question/correct" + Exhibits.lang_flg + ".png"
      );
      correctJudge.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      correctJudge.top = "0px";
      correctJudge.width = "202px";
      correctJudge.height = "50px";
      topArea.addControl(correctJudge);
      correctJudge.isVisible = false;
      this._correntDic[questions[i].index] = correctJudge;

      // 空隙
      composePanel.addControl(this.createEmpty());

      // body
      composePanel.addControl(this.createBody(questions[i], questions.length));

      // 空隙
      composePanel.addControl(this.createEmpty());

      // 创建选项options
      composePanel.addControl(this.createOptions(questions[i]));

      // 空隙
      composePanel.addControl(this.createEmpty("40px"));

      let close = BABYLON.GUI.Button.CreateImageOnlyButton(
        "close",
        "images/question/close.png"
      );
      close.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      close.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      // close.top = "200px";
      close.width = "59px";
      close.thickness = 0;
      close.height = "59px";

      close.onPointerClickObservable.add(() => {
        that.close();
      });

      composePanel.addControl(close);

      if (i !== 0) {
        composePanel.isVisible = false;
      }
      this._uis.push(composePanel);
    }
  }

  private createEmpty(height?: string): BABYLON.GUI.Container {
    let emptyArea = new BABYLON.GUI.Container("empty-area");
    if (height) {
      emptyArea.height = height;
    } else {
      emptyArea.height = "20px";
    }
    emptyArea.background = "#ffffff00";
    emptyArea.color = "#ffffff00";
    return emptyArea;
  }

  private maxLength(options: string[]): number {
    // 11 , 24
    let maxLength: number = 0;
    options.forEach((value, index) => {
      if (index === 0) {
        maxLength = value.length;
      } else {
        maxLength = maxLength < value.length ? value.length : maxLength;
      }
    });

    return maxLength;
  }

  private createBody(data: QuestionData, count: number): BABYLON.GUI.Container {
    let that = this;

    // container
    let questionContainer = new BABYLON.GUI.Rectangle(
      "question-body-container"
    );
    questionContainer.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    questionContainer.top = "70px";
    questionContainer.width = "100%";
    questionContainer.height = "200px";
    questionContainer.background = "#ffffff00";
    questionContainer.color = "#ffffff00";
    questionContainer.thickness = 0;
    // questionContainer.isPointerBlocker = true;

    // 0: 题干区域
    let questionRect = new BABYLON.GUI.Rectangle("question-body");
    questionRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    questionRect.top = "0px";
    questionRect.width = "400px";
    questionRect.height = "200px";
    questionRect.background = "#ffffffB2";
    questionRect.color = "#ffffffB2";
    questionRect.thickness = 0;
    questionRect.cornerRadius = 5;
    questionRect.isPointerBlocker = true;
    // questionRect.adaptHeightToChildren = true;
    questionContainer.addControl(questionRect);

    let bigTitle = new BABYLON.GUI.TextBlock("title");
    bigTitle.fontSize = 20;
    bigTitle.fontStyle = "bold";
    bigTitle.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    bigTitle.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    bigTitle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    if (data.type === "单选题") {
      bigTitle.text =
        Language.language[9][Exhibits.lang_flg] +
        "(" +
        Language.language[10][Exhibits.lang_flg] +
        ")";
    }
    if (data.type === "多选题") {
      bigTitle.text =
        Language.language[9][Exhibits.lang_flg] +
        "(" +
        Language.language[11][Exhibits.lang_flg] +
        ")";
    }
    if (data.type === "判断题") {
      bigTitle.text =
        Language.language[9][Exhibits.lang_flg] +
        "(" +
        Language.language[12][Exhibits.lang_flg] +
        ")";
    }
    bigTitle.width = "230px";
    bigTitle.color = "#696969";
    bigTitle.height = "40px";
    bigTitle.left = "20px";
    bigTitle.top = "10px";
    questionRect.addControl(bigTitle);

    let indexTitle = new BABYLON.GUI.TextBlock("index-title");
    indexTitle.fontSize = 14;
    indexTitle.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    indexTitle.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    indexTitle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    indexTitle.text = "(" + data.index + "/" + count + ")";
    indexTitle.color = "#696969";
    indexTitle.left = "-77px";
    indexTitle.top = "12px";
    indexTitle.width = "55px";
    indexTitle.height = "40px";
    questionRect.addControl(indexTitle);

    let indexTitle2 = new BABYLON.GUI.TextBlock("index-title2");
    indexTitle2.fontSize = 20;
    indexTitle2.fontStyle = "bold";
    indexTitle2.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    indexTitle2.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    indexTitle2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    indexTitle2.text = "NO." + data.index;
    indexTitle2.color = "#D82E2D";
    indexTitle2.left = "-14px";
    indexTitle2.top = "10px";
    indexTitle2.width = "60px";
    indexTitle2.height = "40px";
    questionRect.addControl(indexTitle2);

    let titleLine = new BABYLON.GUI.TextBlock("title-line");
    titleLine.fontSize = 10;
    titleLine.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    titleLine.text = "____________________________________________________";
    titleLine.width = "500px";
    titleLine.left = "-3px";
    titleLine.top = "25px";
    titleLine.height = "40px";
    titleLine.color = "#BEBEBEB2";
    questionRect.addControl(titleLine);

    let body = new BABYLON.GUI.TextBlock("question-body");
    body.fontSize = 15;
    body.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    body.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    body.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    body.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    body.text = data.question;
    body.color = "#696969";
    body.top = "48px";
    body.width = "400px";
    body.height = "150px";
    body.paddingLeft = "20px";
    body.paddingRight = "25px";
    body.paddingTop = "15px";
    body.textWrapping = true;

    // body.onLinesReadyObservable.add(lines => {
    //   // console.log('lines: ' +lines);
    //   // console.log('lines: ' +lines.lines);
    //   // console.log('lines: ' +lines.lines.length);
    //   // 高度重新计算
    //   body.height = (lines.lines.length * 25 + 10) + 'px';
    //   questionRect.height = (lines.lines.length * 25 + 10 + 48) + 'px';
    // });

    questionRect.addControl(body);

    // UI预先估算
    let tryH: number = Math.ceil(data.question.length / 24);
    questionRect.height = tryH * 25 + 10 + 48 + 10 + "px";

    // UI第一次没有更新
    let observor = this._scene.onBeforeCameraRenderObservable.add(
      (camera, state) => {
        body.height = body.lines.length * 25 + 10 + "px";
        questionRect.height = body.lines.length * 25 + 10 + 48 + 10 + "px";
        questionContainer.height = questionRect.height;
        questionContainer._markAllAsDirty();
        this._scene.onBeforeCameraRenderObservable.remove(observor);
      }
    );

    // 上一题箭头
    if (data.index !== 1) {
      let leftArrow = BABYLON.GUI.Button.CreateImageOnlyButton(
        "left-arrow",
        "images/question/left.png"
      );
      // leftArrow.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      leftArrow.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      // leftArrow.top = "200px";
      leftArrow.left = "100px";
      leftArrow.width = "38px";
      leftArrow.height = "63px";
      leftArrow.thickness = 0;
      leftArrow.onPointerClickObservable.add(() => {
        that.previous(data.index);
      });
      questionContainer.addControl(leftArrow);
    }

    // 下一题箭头
    if (data.index !== count) {
      let rightArrow = BABYLON.GUI.Button.CreateImageOnlyButton(
        "right-arrow",
        "images/question/right.png"
      );
      // rightArrow.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      rightArrow.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      // rightArrow.top = "200px";
      rightArrow.left = "-100px";
      rightArrow.width = "38px";
      rightArrow.thickness = 0;
      rightArrow.height = "63px";
      rightArrow.onPointerClickObservable.add(() => {
        that.next(data.index);
      });
      questionContainer.addControl(rightArrow);
    }

    return questionContainer;
  }

  private createOptions(data: QuestionData): BABYLON.GUI.Container {
    let that = this;

    let optionsContainer = new BABYLON.GUI.Container("options-area");
    let options: string[] = data.options;
    let maxLength = this.maxLength(options);
    // console.warn(options);
    // console.warn(maxLength);
    optionsContainer.background = "#ffffff00";
    optionsContainer.color = "#ffffff00";
    if (maxLength <= 11) {
      // 上下左右四格类型排列
      let height: number = 0;

      options.forEach((value, index) => {
        let leftValue: number = index % 2 === 0 ? -105 : 105;
        let topValue: number = parseInt((index / 2).toString()) * 50;
        height = topValue + 40;
        let choiceBtn = BABYLON.GUI.Button.CreateSimpleButton(
          "choice-" + (index + 1),
          value
        );
        choiceBtn.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        choiceBtn.left = leftValue + "px";
        choiceBtn.top = topValue + "px";
        choiceBtn.width = "190px";
        choiceBtn.cornerRadius = 5;
        choiceBtn.height = "40px";
        choiceBtn.color = "#FFFFFFB2";
        choiceBtn.background = "#FFFFFFB2";
        choiceBtn.children[0].color = "#696969";
        choiceBtn.children[0].fontSize = 16;
        choiceBtn.thickness = 0;
        choiceBtn.onPointerClickObservable.add((info) => {
          choiceBtn.color = "#D82E2D";
          choiceBtn.background = "#D82E2D";
          choiceBtn.children[0].color = "white";
          // 选择判断
          // console.log(index + 1);
          that.chooseAnswer(data.index, index + 1);
        });
        optionsContainer.addControl(choiceBtn);

        if (this._btnsDic[data.index]) {
          this._btnsDic[data.index].push(choiceBtn);
        } else {
          this._btnsDic[data.index] = [choiceBtn];
        }
      });
      optionsContainer.height = height + "px";
    } else {
      // 从上往下排列
      let height: number = 0;
      options.forEach((value, index) => {
        let h = Math.ceil(value.length / 22) * 20 + 20;
        if (h < 40) h = 40;
        // console.warn(`value: ${value} --- h: ${h} -- l: ${value.length} -- a: ${Math.floor(value.length / 22)}`);
        let choiceBtn = BABYLON.GUI.Button.CreateSimpleButton(
          "choice-" + (index + 1),
          value
        );
        choiceBtn.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        choiceBtn.left = "0px";
        choiceBtn.top = height + "px";
        choiceBtn.width = "400px";
        choiceBtn.cornerRadius = 5;
        choiceBtn.height = h + "px";
        choiceBtn.color = "#FFFFFFB2";
        choiceBtn.background = "#FFFFFFB2";
        choiceBtn.children[0].color = "#696969";
        choiceBtn.children[0].fontSize = 16;
        choiceBtn.children[0].paddingLeft = "20px";
        choiceBtn.children[0].paddingRight = "20px";
        choiceBtn.thickness = 0;
        choiceBtn.onPointerClickObservable.add((info) => {
          choiceBtn.color = "#D82E2D";
          choiceBtn.background = "#D82E2D";
          choiceBtn.children[0].color = "white";
          // 选择判断
          // console.log(index + 1);
          that.chooseAnswer(data.index, index + 1);
        });
        optionsContainer.addControl(choiceBtn);

        height += h + 10;

        if (this._btnsDic[data.index]) {
          this._btnsDic[data.index].push(choiceBtn);
        } else {
          this._btnsDic[data.index] = [choiceBtn];
        }
      });
      optionsContainer.height = height - 10 + "px";
    }
    return optionsContainer;
  }

  public chooseAnswer(current_index: number, option: number): void {
    // 判断题型
    let data = this._questions[current_index - 1];
    let isSingle = true;
    if (data.type === "多选题") {
      isSingle = false;
    }

    // 当前按钮是按下还是被抬起？
    if (this._pressedDic[current_index]) {
      if (isSingle) {
        let old: number = this._pressedDic[current_index][0];
        if (old === option) {
          delete this._pressedDic[current_index];
          this._answers[current_index - 1] = false;
          // 按钮抬起
          this._btnsDic[current_index][option - 1].color = "#FFFFFFB2";
          this._btnsDic[current_index][option - 1].background = "#FFFFFFB2";
          this._btnsDic[current_index][option - 1].children[0].color =
            "#696969";
          // 图关闭
          this._correntDic[current_index].isVisible = false;
        } else {
          // 按钮抬起
          this._btnsDic[current_index][old - 1].color = "#FFFFFFB2";
          this._btnsDic[current_index][old - 1].background = "#FFFFFFB2";
          this._btnsDic[current_index][old - 1].children[0].color = "#696969";
          // 按钮按下
          this._btnsDic[current_index][option - 1].color = "#D82E2D";
          this._btnsDic[current_index][option - 1].background = "#D82E2D";
          this._btnsDic[current_index][option - 1].children[0].color = "white";
          this._pressedDic[current_index][0] = option;
          // 判断当前对错
          this._correntDic[current_index].isVisible = true;
          if (this.currentJudge(current_index, option, isSingle, data)) {
            this._correntDic[current_index].source =
              "images/question/correct" + Exhibits.lang_flg + ".png";
          } else {
            this._correntDic[current_index].source =
              "images/question/error" + Exhibits.lang_flg + ".png";
          }
        }
      } else {
        if (this._pressedDic[current_index].indexOf(option) > -1) {
          // 按钮抬起
          this._btnsDic[current_index][option - 1].color = "#FFFFFFB2";
          this._btnsDic[current_index][option - 1].background = "#FFFFFFB2";
          this._btnsDic[current_index][option - 1].children[0].color =
            "#696969";
          let index: number = this._pressedDic[current_index].indexOf(option);
          this._pressedDic[current_index].splice(index, 1);
          if (this._pressedDic[current_index].length > 0) {
            // 判断当前对错
            if (
              this.arrayJudge(this._pressedDic[current_index], data.answers!)
            ) {
              this._answers[current_index - 1] = true;
              this._correntDic[current_index].source =
                "images/question/correct" + Exhibits.lang_flg + ".png";
            } else {
              this._answers[current_index - 1] = false;
              this._correntDic[current_index].source =
                "images/question/error" + Exhibits.lang_flg + ".png";
            }
          } else {
            this._correntDic[current_index].isVisible = false;
          }
        } else {
          // 按钮按下
          this._btnsDic[current_index][option - 1].color = "#D82E2D";
          this._btnsDic[current_index][option - 1].background = "#D82E2D";
          this._btnsDic[current_index][option - 1].children[0].color = "white";
          this._pressedDic[current_index].push(option);
          // 判断当前对错
          this._correntDic[current_index].isVisible = true;
          if (this.currentJudge(current_index, option, isSingle, data)) {
            this._correntDic[current_index].source =
              "images/question/correct" + Exhibits.lang_flg + ".png";
          } else {
            this._correntDic[current_index].source =
              "images/question/error" + Exhibits.lang_flg + ".png";
          }
        }
      }
    } else {
      this._pressedDic[current_index] = [option];
      // 按钮按下
      this._btnsDic[current_index][option - 1].color = "#D82E2D";
      this._btnsDic[current_index][option - 1].background = "#D82E2D";
      this._btnsDic[current_index][option - 1].children[0].color = "white";
      // 判断当前对错
      this._correntDic[current_index].isVisible = true;
      if (this.currentJudge(current_index, option, isSingle, data)) {
        this._correntDic[current_index].source =
          "images/question/correct" + Exhibits.lang_flg + ".png";
      } else {
        this._correntDic[current_index].source =
          "images/question/error" + Exhibits.lang_flg + ".png";
      }
    }
    // 整体判断
    for (let i: number = 0; i < this._answers.length; i++) {
      if (!this._answers[i]) {
        return;
      }
    }
    // 全部正确
    this.finish();
  }

  private currentJudge(
    current_index: number,
    option: number,
    is_single: boolean,
    data: QuestionData
  ): boolean {
    if (is_single) {
      if (data.answer === option) {
        this._answers[current_index - 1] = true;
        return true;
      } else {
        this._answers[current_index - 1] = false;
        return false;
      }
    } else {
      if (data.answers!.indexOf(option) > -1) {
        if (this._pressedDic[current_index]) {
          if (this._pressedDic[current_index].indexOf(option) === -1) {
            this._pressedDic[current_index].push(option);
          }
        } else {
          this._pressedDic[current_index] = [option];
        }
        if (this.arrayJudge(this._pressedDic[current_index], data.answers!)) {
          this._answers[current_index - 1] = true;
          return true;
        } else {
          this._answers[current_index - 1] = false;
          return false;
        }
      } else {
        this._answers[current_index - 1] = false;
        return false;
      }
    }
  }

  private arrayJudge(array1: number[], array2: number[]): boolean {
    if (array1.length !== array2.length) {
      return false;
    }
    for (let i = 0; i < array1.length; i++) {
      if (array2.indexOf(array1[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  public next(current_index: number): void {
    if (current_index < this._questions.length) {
      this._currentIndex++;
      this.show(this._currentIndex);
    }
  }

  public previous(current_index: number): void {
    if (current_index > 1) {
      this._currentIndex--;
      this.show(this._currentIndex);
    }
  }

  public show(current_index: number): void {
    this._uis.forEach((value, index) => {
      if (index + 1 === current_index) {
        value.isVisible = true;
      } else {
        value.isVisible = false;
      }
    });
  }

  public close(): void {
    console.warn("close");
    this._hide = true;
    this._parentRect.isVisible = false;
  }

  public finish(): void {
    console.log("finish");

    this._uis = [];
    this._btnsDic = {};
    this._correntDic = {};
    this._pressedDic = {};
    this._answers = [];
    this._currentIndex = 1;
    this._questions = [];

    // 删除所有元素
    if (this._parentRect) {
      this._parentRect.dispose();
    }
    this._checking = false;
    this._hide = false;

    // 显示成功UI
    this._successUI.isVisible = true;
    setTimeout(this.showSuccess.bind(this), 2000);

    // 把对应的门也删除了
    Question._doors.shift()!.dispose();
    Question._locks.shift()!.parent.dispose();

    // TODO：成绩上传，过一个门多25分

    console.log(
      `当前成绩： ${
        (Question._doorNumbers - Question._doors.length) * Question.singleScore
      } 分`
    );
    xuebei.AddStep(
      "解锁第" + (Question._doorNumbers - Question._doors.length) + "展馆",
      Question.singleScore
    );
    VeryNettyPara.roomIndex = Question._doorNumbers - Question._doors.length;
    if (Question._doors.length === 0) {
      xuebei.Upload();
    }
  }

  public update() {
    this._uis = [];
    this._btnsDic = {};
    this._correntDic = {};
    this._pressedDic = {};
    this._answers = [];
    this._currentIndex = 1;
    this._questions = [];

    // 删除所有元素
    if (this._parentRect) {
      this._parentRect.dispose();
    }
    this._checking = false;
    this._hide = false;
  }
  
  private showSuccess(): void {
    this._successUI.dispose();
  }

  //整体展厅数据加载
  public loadExhibits(info: string): void {
    if (this._exhibitsData[info]) {
      this._exhibits = [];
      for (let i: number = 0; i < this._exhibitsData[info].length; i++) {
        let para: exData = {
          index: this._exhibitsData[info][i].index,
          sceneFile: this._exhibitsData[info][i].sceneFile,
          fileName: this._exhibitsData[info][i].fileName,
          door1: this._exhibitsData[info][i].door1,
          door2: this._exhibitsData[info][i].door2,
        };
        this._exhibits.push(para);
      }
      this.initDoor(this._exhibits);
    }
  }

  public test() {
    this._scene.onPointerObservable.add((info) => {
      if (
        info.type === BABYLON.PointerEventTypes.POINTERDOWN &&
        info.event.button === 0
      ) {
        if (info.pickInfo && info.pickInfo.hit) {
          this.pickedMesh = info.pickInfo.pickedMesh!;
          if (Question._locks.length !== 0) {
            if (this.pickedMesh.name === Question._locks[0].name) {
              let number = Question._doorNumbers + 1 - Question._doors.length;
              console.log("house" + number);
              this.startExam("house" + number);
            }
          }
        }
      }
    });
  }

  public initDoor(data: exData[]): void {
    Question._doors = [];
    Question._locks = [];

    for (let i: number = 0; i < data.length; i++) {
      if (
        this._scene.getMeshByName(data[i].index + "men_00" + data[i].door2[4])
      ) {
        var doorPlane1 = this._scene.getMeshByName(
          data[i].index + "men_00" + data[i].door2[4]
        );
        doorPlane1!.material!.backFaceCulling = false;
        doorPlane1!.visibility = 0.55;
        var lock1 = this._scene.getMeshByName(
          data[i].index + "suo_00" + data[i].door2[4]
        );

        Question._doors.push(doorPlane1!);
        Question._locks.push(lock1);
      }
    }
    Question._doorNumbers = Question._doors.length;
    Question.singleScore = Math.round(100 / Question._doorNumbers);
  }
}

export interface QuestionData {
  type: string;
  index: number;
  question: string;
  options: string[];
  answer?: number | undefined;
  answers?: number[] | undefined;
}

export interface exData {
  index: string;
  sceneFile: string;
  fileName: string;
  door1: string;
  door2: string;
}
