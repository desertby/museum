export class UIControl {

  private _uiSet: { [key: string]: BABYLON.GUI.Control } = {};
  private _lastKey: string = "";

  private _uiControlSet: { [key: string]: UIControl } = {};

  public constructor() {

  }

  // 假设通过一个统一的UI管理器去管理所有场景中的UI，那就存在一定的并列显示关系，并不是所有都是排斥项；
  // 排斥和多选并存，需要事先总结出所有的逻辑操作可能性，并提供入口函数控制；
  // 大致UI结构，散、散、嵌套、散、嵌套，类似这样的结构；
  // 1、关闭所有菜单；
  // 2、排斥显示某一顶级菜单，可能为散，也可能为嵌套，嵌套的还要定好是嵌套中的哪一个元素；
  // 3、同时显示某些顶级菜单，同时关闭某些顶级菜单；
  // 4、不改变顶级菜单的情况下，处理嵌套关系中的菜单，可能为互斥，可能也是类似同时显示的控制；

  /**
   * 初始显示UI；
   * @param initial_key 初始显示值
   */
  public init(initial_key: string): void {
    this._lastKey = initial_key;
    Object.keys(this._uiSet).forEach((key: string) => {
      if (key === initial_key) {
        this._uiSet[key].isVisible = true;
      } else {
        this._uiSet[key].isVisible = false;
      }
    });
  }

  /**
   * 添加UI元素及其key值；
   * @param key UI key值，字符串，该值可嵌套，规则为“key1:str1”、“key1:str2”，其中key1为一组；
   * @param element UI元素；
   */
  public add(key: string, element: BABYLON.GUI.Control): void {
    let lastIndex: number = key.lastIndexOf(':');
    if (lastIndex > -1) {
      let frontKey: string = key.substring(0, lastIndex);
      let afterKey: string = key.substring(lastIndex + 1);
      if (!this._uiControlSet[frontKey]) {
        this._uiControlSet[frontKey] = new UIControl();
      }
      this._uiControlSet[frontKey].add(afterKey, element);
    } else {
      this._uiSet[key] = element;
    }
  }

  /**
   * 显示某个UI元素，若不存在该key值，则全部隐藏；
   * @param key UI key值；
   */
  public display(key: string): void {
    if (key !== this._lastKey) {
      if (this._uiSet[this._lastKey]) {
        this._uiSet[this._lastKey].isVisible = false;
      }
      if (this._uiSet[key]) {
        this._uiSet[key].isVisible = true;
      }
      this._lastKey = key;
    }
  }


  public meanwhile(): void {
    // 1、只显示指定的，其他的都隐藏；
    // 2、增加显示某一些，其他的暂时保持原样；
  }

  public exclude(key: string): void {
    // 确定层级：当前层级间关系处理，当前子层级关系处理
    // 

    let lastIndex: number = key.lastIndexOf(':');
    if (lastIndex > -1) {

    } else {

    }
  }



  /**
   * 隐藏所有UI元素；
   */
  public close(): void {
    // 同级
    Object.keys(this._uiSet).forEach((key: string) => {
      this._uiSet[key].isVisible = false;
    });
    // 嵌套子集
    Object.keys(this._uiControlSet).forEach((key: string) => {
      this._uiControlSet[key].close();
    });
    this._lastKey = "";
  }



}