export class hua_kuang {
  public offset: number = 6;//画框正面厚度
  public w: number = 10;
  public h: number = 10;
  public z1_offset = 6;//画框外侧厚度
  public z2_offset = 1;////画框内侧厚度

  public constructor() {

    // this.create_custom3(scene,material1);
    //   console.log(material1);

  }
  //width:画的宽度  height：画的高度 tex：画框内存贴图 tex1: 画框外侧贴图 tex2 ：画框正面贴图 tex3： 画的贴图
  create_paint(width: number, height: number, tex: BABYLON.Texture, tex1: BABYLON.Texture, tex2: BABYLON.Texture, tex3: BABYLON.Texture, scene: BABYLON.Scene): BABYLON.AbstractMesh {
    this.w = width;
    this.h = height;

    var material3 = new BABYLON.StandardMaterial("texturePlane", scene);
    material3.diffuseTexture = tex;// new BABYLON.Texture("./scene/neikuang.png", scene);

    var material2 = new BABYLON.StandardMaterial("texturePlane1", scene);
    material2.diffuseTexture = tex1;//new BABYLON.Texture("./scene/waikuang.png", scene);
    var material1 = new BABYLON.StandardMaterial("texturePlane2", scene);
    material1.diffuseTexture = tex2;// new BABYLON.Texture("./scene/huakuang.png", scene);
    var material4 = new BABYLON.StandardMaterial("texturePlane3", scene);
    material4.diffuseTexture = tex3;// new BABYLON.Texture("./scene/grass.jpg", scene);
    var multimat = new BABYLON.MultiMaterial("multi", scene);


    multimat.subMaterials.push(material1);
    multimat.subMaterials.push(material2);
    multimat.subMaterials.push(material3);
    multimat.subMaterials.push(material4);
    return this.cacu_points(multimat, scene);
  }



  cacu_points(mat: BABYLON.MultiMaterial, scene: BABYLON.Scene): BABYLON.AbstractMesh {
    let half_w = this.w / 2;
    let half_h = this.h / 2;

    let p0 = new BABYLON.Vector3(0 - this.offset - half_w, 0 - this.offset - half_h, 0);
    let p1 = new BABYLON.Vector3(0 - half_w, 0 - this.offset - half_h, 0);
    let p2 = new BABYLON.Vector3(0 + half_w, 0 - this.offset - half_h, 0);
    let p3 = new BABYLON.Vector3(0 + this.offset + half_w, 0 - this.offset - half_h, 0);

    let p0_ = new BABYLON.Vector3(0 - this.offset - half_w, 0 - this.offset - half_h, 0);
    let p3_ = new BABYLON.Vector3(0 + this.offset + half_w, 0 - this.offset - half_h, 0);

    let p4 = new BABYLON.Vector3(0 - this.offset - half_w, 0 - half_h, 0);
    let p5 = new BABYLON.Vector3(0 - half_w, 0 - half_h, 0);
    let p6 = new BABYLON.Vector3(0 + half_w, 0 - half_h, 0);
    let p7 = new BABYLON.Vector3(0 + this.offset + half_w, 0 - half_h, 0);

    let p5_ = new BABYLON.Vector3(0 + half_w, 0 - half_h, 0);
    let p6_ = new BABYLON.Vector3(0 + half_w, 0 - half_h, 0);

    let p8 = new BABYLON.Vector3(0 - this.offset - half_w, 0 + half_h, 0);
    let p9 = new BABYLON.Vector3(0 - half_w, 0 + half_h, 0);
    let p10 = new BABYLON.Vector3(0 + half_w, 0 + half_h, 0);
    let p11 = new BABYLON.Vector3(0 + this.offset + half_w, 0 + half_h, 0);

    let p9_ = new BABYLON.Vector3(0 - half_w, 0 + half_h, 0);
    let p10_ = new BABYLON.Vector3(0 + half_w, 0 + half_h, 0);

    let p12 = new BABYLON.Vector3(0 - this.offset - half_w, 0 + half_h + this.offset, 0);
    let p13 = new BABYLON.Vector3(0 - half_w, 0 + half_h + this.offset, 0);
    let p14 = new BABYLON.Vector3(0 + half_w, 0 + half_h + this.offset, 0);
    let p15 = new BABYLON.Vector3(0 + this.offset + half_w, 0 + half_h + this.offset, 0);

    let p12_ = new BABYLON.Vector3(0 - this.offset - half_w, 0 + half_h + this.offset, 0);
    let p15_ = new BABYLON.Vector3(0 + this.offset + half_w, 0 + half_h + this.offset, 0);



    let _p0 = new BABYLON.Vector3(0 - this.offset - half_w, 0 - this.offset - half_h, 0);
    let _p1 = new BABYLON.Vector3(0 - half_w, 0 - this.offset - half_h, 0);
    let _p2 = new BABYLON.Vector3(0 + half_w, 0 - this.offset - half_h, 0);
    let _p3 = new BABYLON.Vector3(0 + this.offset + half_w, 0 - this.offset - half_h, 0);

    let _p4 = new BABYLON.Vector3(0 - this.offset - half_w, 0 - half_h, 0);
    let _p5 = new BABYLON.Vector3(0 - half_w, 0 - half_h, 0);
    let _p6 = new BABYLON.Vector3(0 + half_w, 0 - half_h, 0);
    let _p7 = new BABYLON.Vector3(0 + this.offset + half_w, 0 - half_h, 0);

    let _p8 = new BABYLON.Vector3(0 - this.offset - half_w, 0 + half_h, 0);
    let _p9 = new BABYLON.Vector3(0 - half_w, 0 + half_h, 0);
    let _p10 = new BABYLON.Vector3(0 + half_w, 0 + half_h, 0);
    let _p11 = new BABYLON.Vector3(0 + this.offset + half_w, 0 + half_h, 0);

    let _p12 = new BABYLON.Vector3(0 - this.offset - half_w, 0 + half_h + this.offset, 0);
    let _p13 = new BABYLON.Vector3(0 - half_w, 0 + half_h + this.offset, 0);
    let _p14 = new BABYLON.Vector3(0 + half_w, 0 + half_h + this.offset, 0);
    let _p15 = new BABYLON.Vector3(0 + this.offset + half_w, 0 + half_h + this.offset, 0);



    let wai_p0 = new BABYLON.Vector3(0 - this.offset - half_w, 0 - this.offset - half_h, 0);
    let wai_p1 = new BABYLON.Vector3(0 + this.offset + half_w, 0 - this.offset - half_h, 0);
    let wai_p2 = new BABYLON.Vector3(0 + this.offset + half_w, 0 - this.offset - half_h, -this.z1_offset);
    let wai_p3 = new BABYLON.Vector3(0 - this.offset - half_w, 0 - this.offset - half_h, -this.z1_offset);


    let wai_p4 = new BABYLON.Vector3(0 - this.offset - half_w, 0 + half_h + this.offset, 0);
    let wai_p5 = new BABYLON.Vector3(0 - this.offset - half_w, 0 - this.offset - half_h, 0);
    let wai_p6 = new BABYLON.Vector3(0 - this.offset - half_w, 0 - this.offset - half_h, -this.z1_offset);
    let wai_p7 = new BABYLON.Vector3(0 - this.offset - half_w, 0 + half_h + this.offset, -this.z1_offset);

    let wai_p8 = new BABYLON.Vector3(0 + this.offset + half_w, 0 + half_h + this.offset, 0);
    let wai_p9 = new BABYLON.Vector3(0 - this.offset - half_w, 0 + half_h + this.offset, 0);
    let wai_p10 = new BABYLON.Vector3(0 - this.offset - half_w, 0 + half_h + this.offset, -this.z1_offset);
    let wai_p11 = new BABYLON.Vector3(0 + this.offset + half_w, 0 + half_h + this.offset, -this.z1_offset);

    let wai_p12 = new BABYLON.Vector3(0 + this.offset + half_w, 0 - this.offset - half_h, 0);
    let wai_p13 = new BABYLON.Vector3(0 + this.offset + half_w, 0 + half_h + this.offset, 0);
    let wai_p14 = new BABYLON.Vector3(0 + this.offset + half_w, 0 + half_h + this.offset, -this.z1_offset);
    let wai_p15 = new BABYLON.Vector3(0 + this.offset + half_w, 0 - this.offset - half_h, -this.z1_offset);

    let nei_p0 = new BABYLON.Vector3(0 + half_w, 0 - half_h, 0);
    let nei_p1 = new BABYLON.Vector3(0 - half_w, 0 - half_h, 0);
    let nei_p2 = new BABYLON.Vector3(0 - half_w, 0 - half_h, -this.z2_offset);
    let nei_p3 = new BABYLON.Vector3(0 + half_w, 0 - half_h, -this.z2_offset);


    let nei_p4 = new BABYLON.Vector3(0 - half_w, 0 - half_h, 0);
    let nei_p5 = new BABYLON.Vector3(0 - half_w, 0 + half_h, 0);
    let nei_p6 = new BABYLON.Vector3(0 - half_w, 0 + half_h, -this.z2_offset);
    let nei_p7 = new BABYLON.Vector3(0 - half_w, 0 - half_h, -this.z2_offset);

    let nei_p8 = new BABYLON.Vector3(0 - half_w, 0 + half_h, 0);
    let nei_p9 = new BABYLON.Vector3(0 + half_w, 0 + half_h, 0);
    let nei_p10 = new BABYLON.Vector3(0 + half_w, 0 + half_h, -this.z2_offset);
    let nei_p11 = new BABYLON.Vector3(0 - half_w, 0 + half_h, -this.z2_offset);

    let nei_p12 = new BABYLON.Vector3(0 + half_w, 0 + half_h, 0);
    let nei_p13 = new BABYLON.Vector3(0 + half_w, 0 - half_h, 0);
    let nei_p14 = new BABYLON.Vector3(0 + half_w, 0 - half_h, -this.z2_offset);
    let nei_p15 = new BABYLON.Vector3(0 + half_w, 0 + half_h, -this.z2_offset);



    let paint_p0 = new BABYLON.Vector3(0 - half_w, 0 - half_h, -this.z2_offset);
    let paint_p1 = new BABYLON.Vector3(0 + half_w, 0 - half_h, -this.z2_offset);
    let paint_p2 = new BABYLON.Vector3(0 + half_w, 0 + half_h, -this.z2_offset);
    let paint_p3 = new BABYLON.Vector3(0 - half_w, 0 + half_h, -this.z2_offset);
    //
    [p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z,
    p4.x, p4.y, p4.z, p5.x, p5.y, p5.z, p6.x, p6.y, p6.z
      , p12.x, p12.y, p12.z, p8.x, p8.y, p8.z, p4.x, p4.y, p4.z, p0.x, p0.y, p0.z, p4.x, p4.y, p4.z, p9.x, p9.y, p9.z, p5.x, p5.y, p5.z];
    var positions =

      [p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z,
      p4.x, p4.y, p4.z, p5.x, p5.y, p5.z, p6.x, p6.y, p6.z, p7.x, p7.y, p7.z,
      p8.x, p8.y, p8.z, p9.x, p9.y, p9.z, p10.x, p10.y, p10.z, p11.x, p11.y, p11.z,
      p12.x, p12.y, p12.z, p13.x, p13.y, p13.z, p14.x, p14.y, p14.z, p15.x, p15.y, p15.z,
      _p0.x, _p0.y, _p0.z, _p3.x, _p3.y, _p3.z, _p5.x, _p5.y, _p5.z, _p6.x, _p6.y, _p6.z,
      _p9.x, _p9.y, _p9.z, _p10.x, _p10.y, _p10.z, _p12.x, _p12.y, _p12.z, _p15.x, _p15.y, _p15.z,
      wai_p0.x, wai_p0.y, wai_p0.z, wai_p1.x, wai_p1.y, wai_p1.z, wai_p2.x, wai_p2.y, wai_p2.z,
      wai_p3.x, wai_p3.y, wai_p3.z,
      wai_p4.x, wai_p4.y, wai_p4.z, wai_p5.x, wai_p5.y, wai_p5.z, wai_p6.x, wai_p6.y, wai_p6.z,
      wai_p7.x, wai_p7.y, wai_p7.z,
      wai_p8.x, wai_p8.y, wai_p8.z, wai_p9.x, wai_p9.y, wai_p9.z, wai_p10.x, wai_p10.y, wai_p10.z,
      wai_p11.x, wai_p11.y, wai_p11.z,
      wai_p12.x, wai_p12.y, wai_p12.z, wai_p13.x, wai_p13.y, wai_p13.z, wai_p14.x, wai_p14.y, wai_p14.z,
      wai_p15.x, wai_p15.y, wai_p15.z,
      nei_p0.x, nei_p0.y, nei_p0.z, nei_p1.x, nei_p1.y, nei_p1.z, nei_p2.x, nei_p2.y, nei_p2.z,
      nei_p3.x, nei_p3.y, nei_p3.z,
      nei_p4.x, nei_p4.y, nei_p4.z, nei_p5.x, nei_p5.y, nei_p5.z, nei_p6.x, nei_p6.y, nei_p6.z,
      nei_p7.x, nei_p7.y, nei_p7.z,
      nei_p8.x, nei_p8.y, nei_p8.z, nei_p9.x, nei_p9.y, nei_p9.z, nei_p10.x, nei_p10.y, nei_p10.z,
      nei_p11.x, nei_p11.y, nei_p11.z,
      nei_p12.x, nei_p12.y, nei_p12.z, nei_p13.x, nei_p13.y, nei_p13.z, nei_p14.x, nei_p14.y, nei_p14.z,
      nei_p15.x, nei_p15.y, nei_p15.z,
      paint_p0.x, paint_p0.y, paint_p0.z, paint_p1.x, paint_p1.y, paint_p1.z, paint_p2.x, paint_p2.y, paint_p2.z,
      paint_p3.x, paint_p3.y, paint_p3.z,

      ];


    let uv0 = new BABYLON.Vector2(this.w / this.offset + 2, 1);
    let uv1 = new BABYLON.Vector2(this.w / this.offset + 1, 1);
    let uv2 = new BABYLON.Vector2(1, 1);
    let uv3 = new BABYLON.Vector2(0, 1);
    let uv5 = new BABYLON.Vector2(this.w / this.offset + 1, 0);
    let uv6 = new BABYLON.Vector2(1, 0);

    let _uv0 = new BABYLON.Vector2(0, 1);
    let uv4 = new BABYLON.Vector2(1, 1);//new BABYLON.Vector2(1,1);
    let _uv5 = new BABYLON.Vector2(1, 0);
    let uv8 = new BABYLON.Vector2(this.h / this.offset + 1, 1);
    let uv9 = new BABYLON.Vector2(this.h / this.offset + 1, 0);
    let uv12 = new BABYLON.Vector2(this.h / this.offset + 2, 1);;//(this.h/this.offset+2,1);


    let _uv9 = new BABYLON.Vector2(1, 0);
    let uv10 = new BABYLON.Vector2(this.w / this.offset + 1, 0);
    let _uv12 = new BABYLON.Vector2(0, 1);
    let uv13 = new BABYLON.Vector2(1, 1);
    let uv14 = new BABYLON.Vector2(this.w / this.offset + 1, 1);
    let uv15 = new BABYLON.Vector2(this.w / this.offset + 2, 1);

    let _uv3 = new BABYLON.Vector2(this.h / this.offset + 2, 1);
    let _uv6 = new BABYLON.Vector2(this.h / this.offset + 1, 0);
    let _uv10 = new BABYLON.Vector2(1, 0);
    let _uv15 = new BABYLON.Vector2(0, 1);
    let uv7 = new BABYLON.Vector2(this.h / this.offset + 1, 1);
    let uv11 = new BABYLON.Vector2(1, 1);

    let wai_uv0 = new BABYLON.Vector2(0, 0);
    let wai_uv1 = new BABYLON.Vector2(6, 0);
    let wai_uv2 = new BABYLON.Vector2(6, 1);
    let wai_uv3 = new BABYLON.Vector2(0, 1);

    let wai_uv4 = new BABYLON.Vector2(0, 0);
    let wai_uv5 = new BABYLON.Vector2(6, 0);
    let wai_uv6 = new BABYLON.Vector2(6, 1);
    let wai_uv7 = new BABYLON.Vector2(0, 1);
    let wai_uv8 = new BABYLON.Vector2(0, 0);
    let wai_uv9 = new BABYLON.Vector2(6, 0);
    let wai_uv10 = new BABYLON.Vector2(6, 1);
    let wai_uv11 = new BABYLON.Vector2(0, 1);

    let wai_uv12 = new BABYLON.Vector2(0, 0);
    let wai_uv13 = new BABYLON.Vector2(6, 0);
    let wai_uv14 = new BABYLON.Vector2(6, 1);
    let wai_uv15 = new BABYLON.Vector2(0, 1);

    let nei_uv0 = new BABYLON.Vector2(0, 0);
    let nei_uv1 = new BABYLON.Vector2(6, 0);
    let nei_uv2 = new BABYLON.Vector2(6, 1);
    let nei_uv3 = new BABYLON.Vector2(0, 1);

    let nei_uv4 = new BABYLON.Vector2(0, 0);
    let nei_uv5 = new BABYLON.Vector2(6, 0);
    let nei_uv6 = new BABYLON.Vector2(6, 1);
    let nei_uv7 = new BABYLON.Vector2(0, 1);
    let nei_uv8 = new BABYLON.Vector2(0, 0);
    let nei_uv9 = new BABYLON.Vector2(6, 0);
    let nei_uv10 = new BABYLON.Vector2(6, 1);
    let nei_uv11 = new BABYLON.Vector2(0, 1);

    let nei_uv12 = new BABYLON.Vector2(0, 0);
    let nei_uv13 = new BABYLON.Vector2(6, 0);
    let nei_uv14 = new BABYLON.Vector2(6, 1);
    let nei_uv15 = new BABYLON.Vector2(0, 1);


    let paint_uv0 = new BABYLON.Vector2(0, 0);
    let paint_uv1 = new BABYLON.Vector2(1, 0);
    let paint_uv2 = new BABYLON.Vector2(1, 1);
    let paint_uv3 = new BABYLON.Vector2(0, 1);
    //   positions = [0,0,0,60,0,0,60,0,60,0,0,60];//0,0,0,60,0,0,60,0,60,0,0,60//[0+half_w,0-half_h,0,0+half_w,0-this.offset-half_h,0,0+half_w,0-half_h,0,0+half_w,0-this.offset-half_h,0];
    //5,1,0, 6, 2, 1, 6,1,5, 6,3,2,   18,16,4,  7,17,19,
    var indices =// [5,1,0,18,16,4, 6, 2, 1, 6,1,5, 7,17,19, 6,3,2,];//,6, 2, 1, 6,1,5, ,0,2,3  0,1,2,  , 6,1,5, 6,3,2,
      [5, 1, 0, 6, 2, 1, 6, 1, 5, 6, 3, 2, 18, 16, 4, 7, 17, 19,
        9, 18, 4, 9, 4, 8, 11, 7, 19, 11, 19, 21,
        13, 20, 22, 12, 9, 8, 14, 20, 13, 14, 10, 20,
        23, 11, 21, 15, 10, 14,
        24, 25, 27, 25, 26, 27, 28, 29, 31, 29, 30, 31,
        32, 33, 35, 33, 34, 35, 36, 37, 39, 37, 38, 39,
        40, 41, 43, 41, 42, 43, 44, 45, 47, 45, 46, 47,
        48, 49, 51, 49, 50, 51, 52, 53, 55, 53, 54, 55,
        58, 57, 56, 58, 56, 59,
      ];//9,5,4, //14,21,20,

    [
      9, 5, 4, 9, 4, 8, 11, 7, 6, 11, 6, 10,
      13, 20, 22, 12, 9, 8, 14, 10, 9, 14, 9, 13,
      15, 11, 10, 23, 21, 14,
      24, 25, 27, 25, 26, 27, 28, 29, 31, 29, 30, 31,
      32, 33, 35, 33, 34, 35, 36, 37, 39, 37, 38, 39,
      40, 41, 43, 41, 42, 43, 44, 45, 47, 45, 46, 47,
      48, 49, 51, 49, 50, 51, 52, 53, 55, 53, 54, 55,
      58, 57, 56, 58, 56, 59,

    ];// 57,56,55,
    //uv5.y,uv5.x,uv1.y,uv1.x,uv0.y,uv0.x,  _uv5.y,_uv5.x,_uv0.y,_uv0.x,uv4.y,uv4.x,
    var uvs =


      [uv0.x, uv0.y, uv1.x, uv1.y, uv2.x, uv2.y, uv3.x, uv3.y, uv4.x, uv4.y, uv5.x, uv5.y, uv6.x, uv6.y,
      uv7.x, uv7.y, uv8.x, uv8.y, uv9.x, uv9.y, uv10.x, uv10.y, uv11.x, uv11.y, uv12.x, uv12.y, uv13.x, uv13.y,
      uv14.x, uv14.y, uv15.x, uv15.y, _uv0.x, _uv0.y, _uv3.x, _uv3.y, _uv5.x, _uv5.y, _uv6.x, _uv6.y, _uv9.x, _uv9.y,
      _uv10.x, _uv10.y, _uv12.x, _uv12.y, _uv15.x, _uv15.y,
      wai_uv0.x, wai_uv0.y, wai_uv1.x, wai_uv1.y, wai_uv2.x, wai_uv2.y, wai_uv3.x, wai_uv3.y,
      wai_uv4.x, wai_uv4.y, wai_uv5.x, wai_uv5.y, wai_uv6.x, wai_uv6.y, wai_uv7.x, wai_uv7.y,
      wai_uv8.x, wai_uv8.y, wai_uv9.x, wai_uv9.y, wai_uv10.x, wai_uv10.y, wai_uv11.x, wai_uv11.y,
      wai_uv12.x, wai_uv12.y, wai_uv13.x, wai_uv13.y, wai_uv14.x, wai_uv14.y, wai_uv15.x, wai_uv15.y,
      nei_uv0.x, nei_uv0.y, nei_uv1.x, nei_uv1.y, nei_uv2.x, nei_uv2.y, nei_uv3.x, nei_uv3.y,
      nei_uv4.x, nei_uv4.y, nei_uv5.x, nei_uv5.y, nei_uv6.x, nei_uv6.y, nei_uv7.x, nei_uv7.y,
      nei_uv8.x, nei_uv8.y, nei_uv9.x, nei_uv9.y, nei_uv10.x, nei_uv10.y, nei_uv11.x, nei_uv11.y,
      nei_uv12.x, nei_uv12.y, nei_uv13.x, nei_uv13.y, nei_uv14.x, nei_uv14.y, nei_uv15.x, nei_uv15.y,
      paint_uv0.x, paint_uv0.y, paint_uv1.x, paint_uv1.y, paint_uv2.x, paint_uv2.y, paint_uv3.x, paint_uv3.y,
      ];//, 0,1, 1, 0, 0,0  0,1,0,2,0,0   0,1, 2, 1, 2, 0,  0,0, 1,0, 1,1, 


    [uv5.x, uv5.y, uv1.x, uv1.y, uv0.x, uv0.y, _uv5.x, _uv5.y, _uv0.x, _uv0.y, uv4.y, uv4.y,
    uv6.x, uv6.y, uv2.x, uv2.y, uv1.x, uv1.y, uv6.x, uv6.y, uv1.x, uv1.y, uv5.x, uv5.y,
    uv7.x, uv7.y, _uv3.x, _uv3.y, _uv6.x, _uv6.y, uv6.x, uv6.y, uv3.x, uv3.y, uv2.x, uv2.y,
    uv9.x, uv9.y, uv5.x, uv5.y, uv4.x, uv4.y, uv9.x, uv9.y, uv4.x, uv4.y, uv8.x, uv8.y,
    uv11.x, uv11.y, uv7.x, uv7.y, uv6.x, uv6.y, uv11.x, uv11.y, uv6.x, uv6.y, uv10.x, uv10.y,
    uv13.x, uv13.y, _uv9.x, _uv9.y, _uv12.x, _uv12.y, uv12.x, uv12.y, uv9.x, uv9.y, uv8.x, uv8.y,
    uv14.x, uv14.y, uv10.x, uv10.y, uv9.x, uv9.y, uv14.x, uv14.y, uv9.x, uv9.y, uv13.x, uv13.y,
    _uv15.x, _uv15.y, uv11.x, uv11.y, _uv10.x, _uv10.y, uv15.x, uv15.y, uv10.x, uv10.y, uv14.x, uv14.y,

    ];

    var normals = new Array<number>();
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    console.log(normals[0] + " " + normals[1] + " " + normals[2]);

    var customMesh = new BABYLON.Mesh("custom3", scene);
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;




    vertexData.indices = indices;
    vertexData.uvs = uvs;
    vertexData.normals = normals;
    vertexData.applyToMesh(customMesh);
    customMesh.material = mat;

    //     console.log(indices.length+"##");
    //    var verticesCount = customMesh.getTotalVertices();

    customMesh.subMeshes = [];
    new BABYLON.SubMesh(0, 0, 24, 0, 48, customMesh);
    new BABYLON.SubMesh(1, 0, 36, 48, 24, customMesh);
    new BABYLON.SubMesh(2, 0, 36, 72, 24, customMesh);
    new BABYLON.SubMesh(3, 0, 36, 96, 6, customMesh);
    //      console.log("verticesCount="+verticesCount);
    return customMesh;
  }


  create_custom3(scene: BABYLON.Scene, mat: BABYLON.Material) {
    var customMesh = new BABYLON.Mesh("custom3", scene);

    var positions = [0, 0, 0, 60, 0, 0, 60, 0, 60, 0, 0, 60];
    var indices = [0, 2, 3];//0, 1, 2, 0,2,3
    var uv = [0, 0, 5, 0, 5, 1];//, 0,5, 1,5, 0,0

    var vertexData = new BABYLON.VertexData();

    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.uvs = uv;
    vertexData.applyToMesh(customMesh);
    customMesh.material = mat;
    customMesh.position = new BABYLON.Vector3(0, 40, 30);
  }
}