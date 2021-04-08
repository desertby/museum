// import { BabylonEngine } from "./engine";

export class GameObject {


  public get gameObject(): GameObject {
    return this;
  }

  public get transform(): Transform {
    return this._transform;
  }
  public set transform(val: Transform) {
    this._transform = val;
  }
  private _transform: Transform;

  public get name(): string {
    return this.transform.name;
  }
  public set name(val: string) {
    this.transform.name = val;
  }

  public get isEmpty(): boolean {
    return this._transform.isEmpty;
  }

  public get mesh(): Nullable<BABYLON.AbstractMesh> {
    return this._transform.mesh;
  }

  constructor(name?: string, mesh: Nullable<BABYLON.AbstractMesh> = null, node: Nullable<BABYLON.TransformNode> = null) {
    if (mesh) {
      this._transform = new Transform('', mesh);
    } else {
      if (node) {
        this._transform = new Transform('', null, node);
      } else if (name) {
        this._transform = new Transform(name);
      } else {
        this._transform = new Transform();
      }
    }
  }

  // TODO
  // public static Find(name: string, scene?: BABYLON.Scene): Nullable<GameObject> {
  //   if (!scene) {
  //     scene = BabylonEngine.Scene;
  //   }
  //   let node: Nullable<BABYLON.Node> = scene.getNodeByName(name);
  //   if (!node) {
  //     return null;
  //   } else {
  //     if (node instanceof BABYLON.AbstractMesh) {
  //       return new GameObject('', <BABYLON.AbstractMesh>node);
  //     } else if (node instanceof BABYLON.TransformNode) {
  //       return new GameObject('', null, <BABYLON.TransformNode>node);
  //     } else {
  //       console.error('GameObject.Find函数查找到不支持的类型：' + node.getClassName());
  //       return null;
  //     }
  //   }
  // }

  // TODO
  public static Destroy(obj: GameObject): void {
    if(obj) {
      obj.transform.destroy();
    }
  }


  public static CreateInstance(game_object: GameObject): Nullable<GameObject> {
    if (!game_object) {
      return null;
    }

    if (game_object.isEmpty) {
      return new GameObject();
    } else {
      if (game_object.transform.mesh) {
        let tempMesh: BABYLON.AbstractMesh;
        if (game_object.transform.mesh instanceof BABYLON.Mesh) {
          tempMesh = (<BABYLON.Mesh>game_object.transform.mesh).createInstance(game_object.name + '_instance');
        } else {
          tempMesh = (<BABYLON.InstancedMesh>game_object.transform.mesh).sourceMesh.createInstance(game_object.name + '_instance');
        }
        return new GameObject('', tempMesh);
      } else {
        let newNode: Nullable<BABYLON.TransformNode> = game_object.transform.transformNode!.clone(game_object.name + '_intance');
        return new GameObject('', null, newNode);
      }
    }
  }


  // public static empty(name: string): GameObject {

  // }

}


export class Transform {

  // public get gameObject(): GameObject {
  //   return this._gameObject;
  // }
  // private _gameObject: GameObject;

  private _transformNode: BABYLON.Nullable<BABYLON.TransformNode> = null;
  private _mesh: BABYLON.Nullable<BABYLON.AbstractMesh> = null;

  public get transformNode(): Nullable<BABYLON.TransformNode> {
    if (this._mesh) {
      return this._mesh;
    } else if (this._transformNode) {
      return this._transformNode;
    } else {
      return null;
    }
  }

  public get mesh(): Nullable<BABYLON.AbstractMesh> {
    return this._mesh;
  }

  public get isMesh(): boolean {
    if (this._mesh) {
      return true;
    } else {
      return false;
    }
  }

  public get isEmpty(): boolean {
    if (this._transformNode || this._mesh) {
      return false;
    } else {
      return true;
    }
  }

  // public get parent(): Nullable<BABYLON.TransformNode>

  public get name(): string {
    return this._name;
  }
  public set name(val: string) {
    if (this._transformNode) {
      this._transformNode.name = val;
    }
    if (this._mesh) {
      this._mesh.name = val;
    }
    this._name = val;
  }
  private _name: string = '';

  private _tempVec: BABYLON.Vector3 = BABYLON.Vector3.Zero();

  public get parent(): Nullable<Transform> {
    return this._parent;
  }
  private _parent: Nullable<Transform> = null;

  public set parent(val: Nullable<Transform>) {
    if (!this.isEmpty) {
      if (val && !val.isEmpty) {
        this._transformNode!.setParent(val.transformNode);
        this._parent = val;
      } else {
        this._transformNode!.setParent(null);
        this._parent = null;
      }
    }
  }

  /**
   * 获取相对坐标
   */
  public get localPosition(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      this._tempVec.copyFrom(this.transformNode!.position);
      return this._tempVec;
    }
  }

  /**
   * 设置相对坐标
   */
  public set localPosition(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      this.transformNode!.position = val;
    }
  }

  /**
   * 获取绝对坐标
   */
  public get position(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      this._tempVec.copyFrom(this.transformNode!.getAbsolutePosition());
      return this._tempVec;
    }
  }

  /**
   * 设置绝对坐标
   */
  public set position(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      this.transformNode!.setAbsolutePosition(val);
    }
  }

  /**
   * 获取相对欧拉角度
   */
  public get localEulerAngles(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      let para: number = 180 / Math.PI;
      return this.transformNode!.rotation.multiplyByFloats(para, para, para);
    }
  }

  /**
   * 设置相对欧拉角度
   */
  public set localEulerAngles(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      let para: number = Math.PI / 180;
      this.transformNode!.rotation = val.multiplyByFloats(para, para, para);
    }
  }

  /**
   * 获取相对角度（弧度）
   */
  public get localRotation(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      this._tempVec.copyFrom(this.transformNode!.rotation);
      return this._tempVec;
    }
  }

  /**
   * 设置相对角度（弧度）
   */
  public set localRotation(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      this.transformNode!.rotation = val;
    }
  }

  /**
   * 获取绝对欧拉角度
   */
  public get eulerAngles(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      let parent: Nullable<BABYLON.Node> = this.transformNode!.parent;
      let para: number = 180 / Math.PI;
      this.transformNode!.setParent(null);
      let result: BABYLON.Vector3 = this.transformNode!.rotation.multiplyByFloats(para, para, para);
      this.transformNode!.setParent(parent);
      return result;
    }
  }

  /**
   * 设置绝对欧拉角度
   */
  public set eulerAngles(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      let parent: Nullable<BABYLON.Node> = this.transformNode!.parent;
      let para: number = Math.PI / 180;
      this.transformNode!.setParent(null);
      this.transformNode!.rotation = val.multiplyByFloats(para, para, para);
      this.transformNode!.setParent(parent);

    }
  }

  /**
   * 获取绝对角度（弧度）
   */
  public get rotation(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      let parent: Nullable<BABYLON.Node> = this.transformNode!.parent;
      this.transformNode!.setParent(null);
      this._tempVec.copyFrom(this.transformNode!.rotation);
      this.transformNode!.setParent(parent);
      return this._tempVec;
    }
  }

  /**
   * 设置绝对角度（弧度）
   */
  public set rotation(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      let parent: Nullable<BABYLON.Node> = this.transformNode!.parent;
      this.transformNode!.setParent(null);
      this.transformNode!.rotation = val;
      this.transformNode!.setParent(parent);
    }
  }


  public get childCount(): number {
    return 0;
  }

  public forward: BABYLON.Vector3 = BABYLON.Vector3.Forward();


  public get hierarchyCount(): number {
    return 0;
  }

  public localScale: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 1);



  constructor(name?: string, mesh: Nullable<BABYLON.AbstractMesh> = null, node: Nullable<BABYLON.TransformNode> = null) {
    if (mesh) {
      this._mesh = mesh;
      this._transformNode = mesh;
      this._name = mesh.name;
    } else {
      if (node) {
        this._mesh = null;
        this._transformNode = node;
        this._name = node.name;
      } else if (name) {
        this._mesh = null;
        this._transformNode = new BABYLON.TransformNode(name);
        this._name = name;
      } else {
        this._mesh = null;
        this._transformNode = null;
        this._name = '';
      }
    }

    // 设置父物体
    if (this._transformNode) {
      let tempParent: Nullable<BABYLON.Node> = this._transformNode.parent;
      if (tempParent) {
        if (tempParent instanceof BABYLON.AbstractMesh) {
          this._parent = new Transform(tempParent.name, <BABYLON.AbstractMesh>tempParent);
        } else {
          this._parent = new Transform(tempParent.name, null, <BABYLON.TransformNode>tempParent);
        }
      }
    } else {
      this._parent = null;
    }
  }

  /**
   * 沿世界或局部坐标系平移；
   * @param translation 平移方向向量；
   * @param relativeTo 平移参考系，LOCAL为局部坐标，WORLD为世界坐标；
   */
  public translate(translation: BABYLON.Vector3, relativeTo: BABYLON.Space): void {
    if (this.transformNode) {
      this.transformNode.translate(translation, 1, relativeTo);
    }
  }

  /**
   * 沿着某个参考物体的局部方向向量平移，参考物体为null时，则沿世界坐标移动；
   * @param translation 参考物体的局部方向向量；
   * @param trans 平移参考物体；
   */
  public translateRelativeTo(translation: BABYLON.Vector3, trans: Transform): void {
    if (this.transformNode) {
      let direction: BABYLON.Vector3 = translation.clone();
      if (trans && trans.transformNode) {
        direction = this.transformDirection(direction);
      }
      this.transformNode.translate(direction, 1, BABYLON.Space.WORLD);
    }
  }





  /**
   * 局部坐标位置转世界坐标位置；
   * @param local_position 局部坐标位置；
   * 返回新Vector3向量；
   */
  public transformPosition(local_position: BABYLON.Vector3): BABYLON.Vector3 {
    if (this.transformNode) {
      let matrix: BABYLON.Matrix = this.transformNode.computeWorldMatrix();
      return BABYLON.Vector3.TransformCoordinates(local_position, matrix);
    } else {
      return local_position;
    }
  }

  /**
   * 局部方向向量转世界方向向量，转换后保持向量长度相等；
   * @param local_direction 局部方向向量；
   * 返回新Vector3向量；
   */
  public transformDirection(local_direction: BABYLON.Vector3): BABYLON.Vector3 {
    if (this.transformNode) {
      let matrix: BABYLON.Matrix = this.transformNode.computeWorldMatrix();
      return BABYLON.Vector3.TransformCoordinates(local_direction, matrix).subtract(this.transformNode.getAbsolutePosition());
    } else {
      return local_direction;
    }
  }

  /**
   * 世界坐标位置转局部坐标位置；
   * @param global_position 世界坐标位置；
   * 返回新Vector3向量；
   */
  public inverseTransformPosition(global_position: BABYLON.Vector3): BABYLON.Vector3 {
    if (this.transformNode) {
      let matrix: BABYLON.Matrix = BABYLON.Matrix.Invert(this.transformNode.computeWorldMatrix());
      return BABYLON.Vector3.TransformCoordinates(global_position, matrix);
    } else {
      return global_position;
    }
  }

  /**
   * 世界方向向量转局部方向向量，转换后保持向量长度相等；
   * @param global_direction 世界方向向量；
   * 返回新Vector3向量；
   */
  public inverseTransformDirection(global_direction: BABYLON.Vector3): BABYLON.Vector3 {
    if (this.transformNode) {
      let matrix: BABYLON.Matrix = BABYLON.Matrix.Invert(this.transformNode.computeWorldMatrix());
      let pointA: BABYLON.Vector3 = BABYLON.Vector3.TransformCoordinates(global_direction, matrix);
      let pointOrigin: BABYLON.Vector3 = BABYLON.Vector3.TransformCoordinates(BABYLON.Vector3.Zero(), matrix);
      return pointA.subtract(pointOrigin);
    } else {
      return global_direction;
    }
  }


  public destroy(): void {
    if(this.mesh) this.mesh.dispose();
    if(this.transformNode) this.transformNode.dispose();
  }

}


// let trans: Transform = new Transform();
// let trans2: Transform = new Transform(null, null, 'my name');
// let trans3: Transform = new Transform(new BABYLON.TransformNode('a', null));