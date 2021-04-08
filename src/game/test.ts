export class change_texture {

    public constructor() {


    }
    public change_texs(mesh1: BABYLON.AbstractMesh, tex: BABYLON.Texture, meshs: Array<BABYLON.AbstractMesh>, direction: BABYLON.Vector3, scene: BABYLON.Scene) {
        let t = mesh1.material?.getActiveTextures();
        if (t != null && t.length > 0) {
            var pixeldata = tex.readPixels();//.readPixels();


            if (pixeldata == null)
                return;
            console.log(pixeldata.byteLength);
            //      let t4=new BABYLON.Texture("./scene/white.jpg", scene);


            let uv_arr = new Array<BABYLON.Vector2>();
            for (let i = 0; i < meshs.length; i++) {
                let mesh2 = meshs[i];
                let p = mesh2.getVerticesData(BABYLON.VertexBuffer.PositionKind);
                let minx = 0;
                let miny = 0;
                let maxx = 0;
                let maxy = 0;
                if (p != null)
                    for (let i = 0; i < p.length; i++) {
                        if (i == 0) {
                            minx = p[i];
                            maxx = p[i];
                        }
                        else if (i == 1) {
                            miny = p[i];
                            maxy = p[i];

                        }
                        else {
                            if (i % 3 == 0) {
                                if (minx > p[i])
                                    minx = p[i];
                                if (maxx < p[i])
                                    maxx = p[i];
                            }
                            else if (i % 3 == 1) {
                                if (miny > p[i])
                                    miny = p[i];
                                if (maxy < p[i])
                                    maxy = p[i];
                            }

                        }

                    }








                let left = this.transform_point(new BABYLON.Vector3(minx, miny, 0), mesh2);
                let right = this.transform_point(new BABYLON.Vector3(maxx, maxy, 0), mesh2);
                let dir = this.transform_normal(direction, mesh2);//



                console.log("left=" + left);
                console.log("right=" + right);
                console.log("dir=" + dir);

                let ray1 = new BABYLON.Ray(left, dir);
                let info1 = scene.pickWithRay(ray1, function (item) {
                    return item !== mesh2;
                });
                let ray2 = new BABYLON.Ray(right, dir);
                let info2 = scene.pickWithRay(ray2, function (item) {
                    return item !== mesh2;
                });


                console.log(info1?.pickedMesh?.name + " " + info1?.bu + " " + info1?.bv + " " + info1?.pickedPoint);
                console.log(info2?.pickedMesh?.name + " " + info2?.bu + " " + info2?.bv + " " + info2?.pickedPoint);
                //      console.log(info1?.getTextureCoordinates());
                let uv1 = info1?.getTextureCoordinates();
                let uv2 = info2?.getTextureCoordinates();
                if (uv1 != null && uv2 != null) {
                    uv_arr.push(uv1);

                    uv_arr.push(uv2);
                }
            }



            let my_w = tex.getSize().width;
            let my_h = tex.getSize().height;
            var texture = new BABYLON.DynamicTexture("dynamic texture", { width: my_w, height: my_h }, scene, true);
            console.log(texture.getSize() + " !! " + pixeldata.byteLength);
            var textureContext = texture.getContext();
            var arr = new Uint8ClampedArray(pixeldata.buffer);



            // console.log(uv1+" "+uv2);

            for (let i = 0; i < uv_arr.length / 2; i++) {
                let uv1 = uv_arr[i * 2];
                let uv2 = uv_arr[i * 2 + 1];
                if (uv1 != null && uv2 != null) {
                    let x1 = uv1.x * my_w;
                    let x2 = uv2.x * my_w;

                    let y1 = uv1.y * my_h;
                    let y2 = uv2.y * my_h;

                    if (x1 > x2) {
                        let temp = x1;
                        x1 = x2;
                        x2 = temp;
                    }
                    if (y1 > y2) {
                        let temp = y1;
                        y1 = y2;
                        y2 = temp;
                    }
                    console.log(x1 + " " + x2);
                    console.log(y1 + "y " + y2);

                    x1 = Math.floor(x1);
                    x2 = Math.floor(x2);
                    y1 = Math.floor(y1);
                    y2 = Math.floor(y2);
                    // y1=Math.floor(y1);
                    console.log(x1 + " x " + x2);
                    console.log(y1 + "y " + y2);

                    let off_left = 18;


                    let start_r = 255 - 20;
                    let start_g = 255 - 25;
                    let start_b = 255 - 30;

                    let first = Math.floor((off_left / 5) * 2);
                    let sec = Math.floor(off_left / 5);
                    let thir = off_left - first - sec;

                    for (let i = my_h - y1 - 1; i >= my_h - y2 - 1; i--) {
                        for (let j = x2 + off_left; j >= x2; j--) {
                            if (x2 + off_left - j <= first) {
                                arr[i * my_h * 4 + j * 4] = start_r - 3 * (x2 + off_left - j);
                                arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * (x2 + off_left - j);
                                arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * (x2 + off_left - j);
                                arr[i * my_h * 4 + j * 4 + 3] = 255;
                                if (i == my_h - y1 - 1)
                                    console.log(arr[i * my_h * 4 + j * 4]);
                            }
                            else if (x2 + off_left - j <= sec + first) {
                                arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * (x2 + off_left - j - first);
                                arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * (x2 + off_left - j - first);
                                arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * (x2 + off_left - j - first);
                                arr[i * my_h * 4 + j * 4 + 3] = 255;
                                if (i == my_h - y1 - 1)
                                    console.log(arr[i * my_h * 4 + j * 4] + " !!");
                            }
                            else {
                                arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec);
                                arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec);
                                arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec);
                                arr[i * my_h * 4 + j * 4 + 3] = 255;
                                if (i == my_h - y1 - 1)
                                    console.log(arr[i * my_h * 4 + j * 4]);
                            }

                        }
                    }


                    //下
                    for (let i = my_h - y2; i >= my_h - y2 - off_left; i--) {
                        for (let j = x2 + off_left; j >= x1; j--)//+off_left
                        {
                            if (x2 + off_left - j <= first) {
                                arr[i * my_h * 4 + j * 4] = start_r - 3 * (x2 + off_left - j) + 6 * (my_h - y2 - i);//+2*(my_h-y2-i)
                                arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * (x2 + off_left - j) + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * (x2 + off_left - j) + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 3] = 255;
                                if (i == my_h - y2 - 1)
                                    console.warn(arr[i * my_h * 4 + j * 4]);
                            }
                            else if (x2 + off_left - j <= sec + first) {
                                arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * (x2 + off_left - j - first) + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * (x2 + off_left - j - first) + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * (x2 + off_left - j - first) + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 3] = 255;
                                if (i == my_h - y2 - 1)
                                    console.warn(arr[i * my_h * 4 + j * 4] + "!!");
                            }
                            else if (x2 + off_left - j <= thir + sec + first) {
                                arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 3] = 255;
                                if (i == my_h - y2 - 1)
                                    console.warn(arr[i * my_h * 4 + j * 4]);
                            }
                            else if (x2 + off_left - j <= thir + 1) {
                                arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * sec - 2 * thir - 10 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;//-10* (x2+off_left-j-first-sec);
                                arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * sec - 2 * thir - 10 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;//-10* (x2+off_left-j-first-sec);
                                arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * sec - 2 * thir - 10 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;//-10* (x2+off_left-j-first-sec);
                                arr[i * my_h * 4 + j * 4 + 3] = 255;
                            }
                            else {
                                arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * sec - 2 * thir - 10 + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * sec - 2 * thir - 10 + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * sec - 2 * thir - 10 + 6 * (my_h - y2 - i);;
                                arr[i * my_h * 4 + j * 4 + 3] = 255;
                            }
                        }
                    }


                    //右侧



                }
            }



            //  console.log(arr);
            //The input data length of pixeldata array should be equal to (4 * width * height).
            var imageData = new ImageData(arr, my_w, my_h);
            textureContext.putImageData(imageData, 0, 0);
            texture.update();
            var sm2 = new BABYLON.StandardMaterial("sm2", scene);
            sm2.diffuseTexture = texture;

            mesh1.material = sm2;

        }
    }
    public change_tex(mesh1: BABYLON.AbstractMesh, tex: BABYLON.Texture, mesh2: BABYLON.AbstractMesh, direction: BABYLON.Vector3, scene: BABYLON.Scene) {

        let t = mesh1.material?.getActiveTextures();
        if (t != null && t.length > 0) {
            var pixeldata = tex.readPixels();//.readPixels();

            //    for(let i=0;i<t.length;i++)

            //     console.log(t[i].name+" "+i+" "+t[i].getSize());

            if (pixeldata == null)
                return;
            console.log(pixeldata.byteLength);
            //      let t4=new BABYLON.Texture("./scene/white.jpg", scene);

            let p = mesh2.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            let minx = 0;
            let miny = 0;
            let maxx = 0;
            let maxy = 0;
            if (p != null)
                for (let i = 0; i < p.length; i++) {
                    if (i == 0) {
                        minx = p[i];
                        maxx = p[i];
                    }
                    else if (i == 1) {
                        miny = p[i];
                        maxy = p[i];

                    }
                    else {
                        if (i % 3 == 0) {
                            if (minx > p[i])
                                minx = p[i];
                            if (maxx < p[i])
                                maxx = p[i];
                        }
                        else if (i % 3 == 1) {
                            if (miny > p[i])
                                miny = p[i];
                            if (maxy < p[i])
                                maxy = p[i];
                        }

                    }

                }

            let my_w = tex.getSize().width;
            let my_h = tex.getSize().height;

            var texture = new BABYLON.DynamicTexture("dynamic texture", { width: my_w, height: my_h }, scene, true);
            console.log(texture.getSize() + " !! " + pixeldata.byteLength);
            var textureContext = texture.getContext();
            var arr = new Uint8ClampedArray(pixeldata.buffer);




            let left = this.transform_point(new BABYLON.Vector3(minx, miny, 0), mesh2);
            let right = this.transform_point(new BABYLON.Vector3(maxx, maxy, 0), mesh2);
            let dir = this.transform_normal(direction, mesh2);//
            console.log("left=" + left);
            console.log("right=" + right);
            console.log("dir=" + dir);

            let ray1 = new BABYLON.Ray(left, dir);
            let info1 = scene.pickWithRay(ray1, function (item) {
                return item !== mesh2;
            });
            let ray2 = new BABYLON.Ray(right, dir);
            let info2 = scene.pickWithRay(ray2, function (item) {
                return item !== mesh2;
            });
            console.log(info1?.pickedMesh?.name + " " + info1?.bu + " " + info1?.bv + " " + info1?.pickedPoint);
            console.log(info2?.pickedMesh?.name + " " + info2?.bu + " " + info2?.bv + " " + info2?.pickedPoint);
            //      console.log(info1?.getTextureCoordinates());
            let uv1 = info1?.getTextureCoordinates();
            let uv2 = info2?.getTextureCoordinates();
            console.log(uv1 + " " + uv2);
            if (uv1 != null && uv2 != null) {
                let x1 = uv1.x * my_w;
                let x2 = uv2.x * my_w;

                let y1 = uv1.y * my_h;
                let y2 = uv2.y * my_h;

                if (x1 > x2) {
                    let temp = x1;
                    x1 = x2;
                    x2 = temp;
                }
                if (y1 > y2) {
                    let temp = y1;
                    y1 = y2;
                    y2 = temp;
                }
                console.log(x1 + " " + x2);
                console.log(y1 + "y " + y2);

                x1 = Math.floor(x1);
                x2 = Math.floor(x2);
                y1 = Math.floor(y1);
                y2 = Math.floor(y2);
                // y1=Math.floor(y1);
                console.log(x1 + " x " + x2);
                console.log(y1 + "y " + y2);

                let off_left = 18;


                let start_r = 255 - 20;
                let start_g = 255 - 25;
                let start_b = 255 - 30;

                let first = Math.floor((off_left / 5) * 2);
                let sec = Math.floor(off_left / 5);
                let thir = off_left - first - sec;

                for (let i = my_h - y1 - 1; i >= my_h - y2 - 1; i--) {
                    for (let j = x2 + off_left; j >= x2; j--) {
                        if (x2 + off_left - j <= first) {
                            arr[i * my_h * 4 + j * 4] = start_r - 3 * (x2 + off_left - j);
                            arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * (x2 + off_left - j);
                            arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * (x2 + off_left - j);
                            arr[i * my_h * 4 + j * 4 + 3] = 255;
                            if (i == my_h - y1 - 1)
                                console.log(arr[i * my_h * 4 + j * 4]);
                        }
                        else if (x2 + off_left - j <= sec + first) {
                            arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * (x2 + off_left - j - first);
                            arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * (x2 + off_left - j - first);
                            arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * (x2 + off_left - j - first);
                            arr[i * my_h * 4 + j * 4 + 3] = 255;
                            if (i == my_h - y1 - 1)
                                console.log(arr[i * my_h * 4 + j * 4] + " !!");
                        }
                        else {
                            arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec);
                            arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec);
                            arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec);
                            arr[i * my_h * 4 + j * 4 + 3] = 255;
                            if (i == my_h - y1 - 1)
                                console.log(arr[i * my_h * 4 + j * 4]);
                        }

                    }
                }





                //左侧
                /* 
                 for(let i=1024-y1-1;i>=1024-y2-11;i--)
                 {
                     for(let j=x2;j<=x2+off_left;j++)
                     {
                        
                         if(j-x2<=8)
                         {
                             arr[i*1024*4+j*4]=180+2*(j-x2);
                             arr[i*1024*4+j*4+1]=172+2*(j-x2);
                             arr[i*1024*4+j*4+2]=161+2*(j-x2);
                             arr[i*1024*4+j*4+3]=10;

                             if(i==1024-y1-1)
                             console.log(arr[i*1024*4+j*4]);
                         }
                         else if(j-x2<=12)
                         
                         {
                             arr[i*1024*4+j*4]=180+16+10*(j-x2-8);
                             arr[i*1024*4+j*4+1]=172+16+10*(j-x2-8);
                             arr[i*1024*4+j*4+2]=161+16+10*(j-x2-8);
                             arr[i*1024*4+j*4+3]=10;
                             if(i==1024-y1-1)
                             console.log(arr[i*1024*4+j*4]);
                         }
                         else
                         {
                             arr[i*1024*4+j*4]=180+16+40+3*(j-x2-16);
                             arr[i*1024*4+j*4+1]=172+16+40+3*(j-x2-16);
                             arr[i*1024*4+j*4+2]=161+16+40+3*(j-x2-16);;
                             arr[i*1024*4+j*4+3]=10;
                             if(i==1024-y1-1)
                             console.log(arr[i*1024*4+j*4]);
                         }*/

                /*
                                           if(x2+off_left-j<=8)
                                           {
                                               arr[i*1024*4+j*4]=70+3*(x2+off_left-j);
                                               arr[i*1024*4+j*4+1]=62+3*(x2+off_left-j);
                                               arr[i*1024*4+j*4+2]=51+3*(x2+off_left-j);
                                               arr[i*1024*4+j*4+3]=10;
                                           }
                                           else if(x2+off_left-j<=14)
                                           
                                           {
                                               arr[i*1024*4+j*4]=70+24+10*(x2+off_left-j-4);
                                               arr[i*1024*4+j*4+1]=62+24+3*(x2+off_left-j-4);
                                               arr[i*1024*4+j*4+2]=51+24+3*(x2+off_left-j-4);
                                               arr[i*1024*4+j*4+3]=10;
                                           }
                                           else
                                           {
                                               arr[i*1024*4+j*4]=70+12+60+10*(x2+off_left-j-7);
                                               arr[i*1024*4+j*4+1]=62+12+60+3*(x2+off_left-j-7);
                                               arr[i*1024*4+j*4+2]=62+12+60+3*(x2+off_left-j-7);
                                               arr[i*1024*4+j*4+3]=10;
                                           }*/

                /*
            if(j<x2+3)
            {
                arr[i*1024*4+j*4]=195;
                arr[i*1024*4+j*4+1]=195;
                arr[i*1024*4+j*4+2]=195;
                arr[i*1024*4+j*4+3]=10;
            } 
            else  if(j<x2+6)
            {
                arr[i*1024*4+j*4]=205;
                arr[i*1024*4+j*4+1]=205;
                arr[i*1024*4+j*4+2]=205;
                arr[i*1024*4+j*4+3]=10;
            }
            else{
                arr[i*1024*4+j*4]=215;
                arr[i*1024*4+j*4+1]=215;
                arr[i*1024*4+j*4+2]=215;
                arr[i*1024*4+j*4+3]=10;
            }*/
                /*          }
                       }*/

                //下
                for (let i = my_h - y2; i >= my_h - y2 - off_left; i--) {
                    for (let j = x2 + off_left; j >= x1; j--)//+off_left
                    {
                        if (x2 + off_left - j <= first) {
                            arr[i * my_h * 4 + j * 4] = start_r - 3 * (x2 + off_left - j) + 6 * (my_h - y2 - i);//+2*(my_h-y2-i)
                            arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * (x2 + off_left - j) + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * (x2 + off_left - j) + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 3] = 255;
                            if (i == my_h - y2 - 1)
                                console.warn(arr[i * my_h * 4 + j * 4]);
                        }
                        else if (x2 + off_left - j <= sec + first) {
                            arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * (x2 + off_left - j - first) + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * (x2 + off_left - j - first) + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * (x2 + off_left - j - first) + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 3] = 255;
                            if (i == my_h - y2 - 1)
                                console.warn(arr[i * my_h * 4 + j * 4] + "!!");
                        }
                        else if (x2 + off_left - j <= thir + sec + first) {
                            arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * sec - 2 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 3] = 255;
                            if (i == my_h - y2 - 1)
                                console.warn(arr[i * my_h * 4 + j * 4]);
                        }
                        else if (x2 + off_left - j <= thir + 1) {
                            arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * sec - 2 * thir - 10 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;//-10* (x2+off_left-j-first-sec);
                            arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * sec - 2 * thir - 10 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;//-10* (x2+off_left-j-first-sec);
                            arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * sec - 2 * thir - 10 * (x2 + off_left - j - first - sec) + 6 * (my_h - y2 - i);;//-10* (x2+off_left-j-first-sec);
                            arr[i * my_h * 4 + j * 4 + 3] = 255;
                        }
                        else {
                            arr[i * my_h * 4 + j * 4] = start_r - 3 * first - 10 * sec - 2 * thir - 10 + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 1] = start_g - 3 * first - 10 * sec - 2 * thir - 10 + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 2] = start_b - 3 * first - 10 * sec - 2 * thir - 10 + 6 * (my_h - y2 - i);;
                            arr[i * my_h * 4 + j * 4 + 3] = 255;
                        }
                    }
                }






                //右侧



            }






            //  console.log(arr);
            //The input data length of pixeldata array should be equal to (4 * width * height).
            var imageData = new ImageData(arr, my_w, my_h);
            textureContext.putImageData(imageData, 0, 0);
            texture.update();
            var sm2 = new BABYLON.StandardMaterial("sm2", scene);
            sm2.diffuseTexture = texture;

            mesh1.material = sm2;

        }
    }


    transform_point(corner: BABYLON.Vector3, my_mesh: BABYLON.AbstractMesh) {
        var transformMatrix1 = my_mesh.computeWorldMatrix(true);;//= col.my_mesh._localMatrix;//.computeWorldMatrix();
        transformMatrix1 = my_mesh.getWorldMatrix();
        return BABYLON.Vector3.TransformCoordinates(corner, transformMatrix1);

    }
    transform_normal(corner: BABYLON.Vector3, my_mesh: BABYLON.AbstractMesh) {
        var transformMatrix1 = my_mesh.computeWorldMatrix(true);;//= col.my_mesh._localMatrix;//.computeWorldMatrix();
        transformMatrix1 = my_mesh.getWorldMatrix();
        return BABYLON.Vector3.TransformNormal(corner, transformMatrix1);

    }




}