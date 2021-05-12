export class tex_create {
	public position:BABYLON.Vector3=new BABYLON.Vector3(0,0,0);
    public my_w:number=2048;
    public my_h:number=2048;
	public camera :BABYLON.FreeCamera;
	test_tex_array:Array<BABYLON.Texture>=new Array();

	l1:BABYLON.Nullable<ArrayBufferView>=null;
	l2:BABYLON.Nullable<ArrayBufferView>=null;
	l3:BABYLON.Nullable<ArrayBufferView>=null;
	l4:BABYLON.Nullable<ArrayBufferView>=null;
	l5:BABYLON.Nullable<ArrayBufferView>=null;
	l6:BABYLON.Nullable<ArrayBufferView>=null;

	private _observer: Nullable<BABYLON.Observer<BABYLON.Scene>> = null;
	FIRST_IN=false;
	count=0;

	box:BABYLON.Mesh|null=null;
    public constructor(engine:BABYLON.Engine,scene:BABYLON.Scene) {
       
		this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 170, 0), scene);
		this.box =BABYLON.Mesh.CreateBox("box",170,scene);
		this.box.rotation.y+=Math.PI/2;
		this.box.setEnabled(false);
		this._observer= scene.onBeforeRenderObservable.add(() => 
		{
			if(this.FIRST_IN&&this.test_tex_array.length>0&&this.test_tex_array[0].isReady())
			{
				console.log("ready go!"+this.test_tex_array.length);
				let allready=true;
				for(let i=0;i<this.test_tex_array.length;i++)
				{
					if(!this.test_tex_array[i].isReady())
					{
						allready=false;
						break;
					}
				}
				this.count++;

				if(allready)//&&this.count>400
				{
					var back1=this.test_tex_array[2].readPixels();
					var right1=this.test_tex_array[1].readPixels();
					var front1=this.test_tex_array[0].readPixels();
					var left1=this.test_tex_array[3].readPixels();
					var top1=this.test_tex_array[5].readPixels();
					var bot1=this.test_tex_array[4].readPixels();
 

					console.log(allready+" "+this.count+" "+this.FIRST_IN);

					if(left1!=null&&right1!=null&&top1!=null&&bot1!=null&&front1!=null&&back1!=null&&this.FIRST_IN)//&&this.count>40
					// if(this.count>400)
					{
						console.log( this.test_tex_array[2].getSize()+" size");
						this.FIRST_IN=false;
						
						// this.my_h=1024;
						// this.my_w=1024;
						this.position=this.camera.position;

						console.log(allready+" here "+this.count);
						console.log(back1.byteLength);

						if(left1!=null&&right1!=null&&top1!=null&&bot1!=null&&front1!=null&&back1!=null)
						{
							console.log("ready go@");
							var back=new Uint8ClampedArray(back1.buffer);
							var front=new Uint8ClampedArray(front1.buffer);
							var top=new Uint8ClampedArray(top1.buffer);
							var bot=new Uint8ClampedArray(bot1.buffer);
							var left=new Uint8ClampedArray(left1.buffer);
							var right=new Uint8ClampedArray(right1.buffer);
							this.ConvertToEquirectangular(scene,left,right,top,bot,front,back,1024,1024);
							console.log(this.camera.rotation+"see");
							this.camera.rotation.x+=Math.PI/2;
							console.log(this.camera.rotation+"see");
							// setTimeout(()=>{
							// BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine,this.camera , {width:1200, height:1200});
							// this.FIRST_IN=false;
							// }, 5);
							BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine,this.camera , {width:4096, height:2048});
							this.FIRST_IN=false;
							this.test_tex_array.length=0;
							console.log(this.FIRST_IN+"first");
							// setTimeout(()=>{
							// this.box?.setEnabled(false);}, 1);

						}
					}
				}
			}
		});
}


	public set_position(p:BABYLON.Vector3,engine:BABYLON.Engine,scene:BABYLON.Scene)
	{
		this.camera.position=p;

		this.camera.fov=(Math.PI/4)*2.0;
		console.log(this.camera.rotation+"start");

		// console.log(camera.viewport.height+" "+camera.viewport.width) ;
		this.camera.fovMode=BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED;
		
		   
			// console.log(camera.fovMode);
			  this.camera.rotation.y=0;
			//   console.log(camera.rotation.y);
		let that=this;
		this.test_tex_array.length=0;

		let w=2048;
		let h=2048;
			BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, this.camera, {width:w, height:h}, function(data)
			 {
			   let tex_new1= new BABYLON.Texture(data, scene);
			   
			  that.test_tex_array.push(tex_new1);
			})
			this.camera.rotation.y+=Math.PI/2;
		    
		  BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, this.camera, {width:w, height:h} ,function(data)
		  {
			let tex_new1= new BABYLON.Texture(data, scene);
			that.test_tex_array.push(tex_new1);

			// var box =BABYLON.Mesh.CreateBox("box",170,scene);

			//	 box.position=this.position.subtract(new BABYLON.Vector3(0,170,0));
			// 	  var mat = new BABYLON.StandardMaterial("mat", scene);
			//   mat.diffuseTexture = tex_new1;
			//   console.log(box.position+" "+tex_new1.isReady());
			//   box.position.x=that.camera.position.x;
			//   box.position.y=that.camera.position.y;
			//   box.position.z=that.camera.position.z;
			//   box.position.z-=110;
			//   console.log(box.position);
			// 	  box.material = mat;
		 })
		 // BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, {precision: 1})
		  this.camera.rotation.y+=Math.PI/2;
		 
		
		 
		
		  BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, this.camera, {width:w, height:h}, function(data)
		  {
			let tex_new1= new BABYLON.Texture(data, scene);
		
		
		
			that.test_tex_array.push(tex_new1);//   
			
		
		
		 })
		//  BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, {precision: 1})
		  this.camera.rotation.y+=Math.PI/2;
		  console.log(this.camera.rotation.y);
		  BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, this.camera, {width:w, height:h}, function(data)
		  {
			let tex_new1= new BABYLON.Texture(data, scene);
			that.test_tex_array.push(tex_new1);
		 })
		 // BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, {precision: 1})
		
		 this.camera.rotation.y+=Math.PI/2;
		  this.camera.rotation.x+=Math.PI/2; 
		   BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, this.camera, {width:w, height:h}, function(data)
		  {
			let tex_new1= new BABYLON.Texture(data, scene);
			that.test_tex_array.push(tex_new1); 
		
		  
		 })
		 // BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, {precision: 1})
		  this.camera.rotation.x-=Math.PI;
		  BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, this.camera, {width:w, height:h}, function(data)
		  {
			let tex_new1= new BABYLON.Texture(data, scene);
		
			that.test_tex_array.push(tex_new1);
		 })
		 this.FIRST_IN=true;
		 console.log("start");
	}
	




    public ConvertToEquirectangular(scene:BABYLON.Scene, left:Uint8ClampedArray,right:Uint8ClampedArray,top:Uint8ClampedArray,bot:Uint8ClampedArray,front:Uint8ClampedArray,back:Uint8ClampedArray,  outputWidth:number,outputHeight:number)
    {
        var texture = new BABYLON.DynamicTexture("dynamic texture", {width:this.my_w,height:this.my_h}, scene, true);
		var pixeldata = texture.readPixels();
		if(pixeldata==null)
			return;
        var arr = new Uint8ClampedArray(pixeldata.buffer);
        
        
 //       Texture2D equiTexture = new Texture2D(outputWidth,outputHeight,TextureFormat.ARGB32,false); 
//		//标准化纹理坐标,从0到1,从左下角开始
		let u:number=0;
		let v:number=0;
		//极坐标
		let phi:number=0;
		let theta=0;

		let cubeFaceWidth = 2048;// sourceTexture.width / 4; // 4个水平面
		let cubeFaceHeight = 2048;// sourceTexture.height / 3; // 3个垂直面



		// for(let i=1000;i<2000;i++)
		// {
		// 	console.log(back[i]+" "+i);
		// }

		let tempc=0;

		
		let first = true;
		for(let j = 0; j< this.my_h; j ++)
		{
			//行从底部开始
			v = 1  - (j / this.my_h); 
			theta = v * Math.PI; 
			
			for(let i = 0; i< this.my_w; i ++)
			{
				//列从左边开始
				u =(i / this.my_w); 
				phi = u * 2 * Math.PI; 
				
				//float x,y,z; //单位向量
				let x = Math .sin(phi)* Math.sin(theta)* -1; 
				let y = Math.cos(theta); 
				let z = Math.cos(phi)* Math.sin(theta)* -1; 
				
			//	float xa,ya,za; 
			//	float a; 
		

				let a = 0; //{Math.abs(x),Math.abs(y),Math.abs(z)}

				if(Math.abs(x)>=Math.abs(y))
					a=Math.abs(x);
				else
					a=Math.abs(y);	

				if(a<Math.abs(z))
					a=Math.abs(z);

				
				//向量平行于位于其中一个立方体面上的单位向量
				let xa = x / a; 
				let ya = y / a; 
				let za = z / a; 
				

				// if(i==256)
				// {
				// 	console.log("xa="+xa+" ya="+ya+"za="+za)	;
				// }
				//	颜色; 
				 
				let xOffset=0;
				let yOffset=0; 
				let xPixel=0;
				let yPixel=0;
				
				if(xa == 1)
				{
					// Right 
					xPixel = ((((za + 1)/ 2) -  1) * cubeFaceWidth); 
					xPixel=Math.round(xPixel);
					xOffset = 2 * cubeFaceWidth; //偏移
					yPixel =((((ya + 1)/ 2))* cubeFaceHeight); 
					yPixel=Math.round(yPixel);
					
			
					
					
					
					yOffset = cubeFaceHeight; // Offset 
					xPixel = Math.abs(xPixel); 
					yPixel = Math.abs(yPixel); 
				
					xPixel += xOffset; 
					yPixel += yOffset; 
					//	Debug.Log (xPixel+" right "+yPixel+" j="+j+" i="+i);
					
					xPixel-=2*cubeFaceWidth;
					yPixel-=cubeFaceHeight;
					//	if(xPixel==1024&&yPixel==1023)
					//		Debug.Log(i+" "+j);
					
				
					if(first)
					{
						first=false;
					}
					if(xPixel>=2048)
					xPixel=2047;
					if(yPixel>=2048)
					yPixel=2047;
			
					arr[this.my_h*i*4+j*4]=right[cubeFaceHeight*yPixel*4+xPixel*4];//right
					arr[this.my_h*i*4+j*4+1]=right[cubeFaceHeight*yPixel*4+xPixel*4+1];
					arr[this.my_h*i*4+j*4+2]=right[cubeFaceHeight*yPixel*4+xPixel*4+2];
					arr[this.my_h*i*4+j*4+3]=right[cubeFaceHeight*yPixel*4+xPixel*4+3];

				//	arr[this.my_h*i*4+j*4]=255;
				//	arr[this.my_h*i*4+j*4+1]=0;
				//	arr[this.my_h*i*4+j*4+2]=0;
				//	arr[this.my_h*i*4+j*4+3]=1;
					// if(ya==1)
					// {
					// 	arr[this.my_h*i*4+j*4]=0;
					// 	arr[this.my_h*i*4+j*4+1]=0;
					// 	arr[this.my_h*i*4+j*4+2]=255;
					// 	arr[this.my_h*i*4+j*4+3]=1;
					// }
					// if(ya==1||ya==-1||za==1||za==-1)
					// {
					// 	arr[this.my_h*i*4+j*4]=0;
					// 	arr[this.my_h*i*4+j*4+1]=255;
					// 	arr[this.my_h*i*4+j*4+2]=0;
					// 	arr[this.my_h*i*4+j*4+3]=1;

					// }

				
				} 
				else if(xa == -1)
				{
					//左
					xPixel =((((za + 1) / 2))* cubeFaceWidth); 
					xPixel=Math.round(xPixel);
					xOffset = 0; 
					yPixel =((((ya + 1)/ 2))* cubeFaceHeight); 
					yPixel=Math.round(yPixel);
					yOffset = cubeFaceHeight; 
					xPixel = Math.abs(xPixel); 
					yPixel = Math.abs(yPixel); 
					
					xPixel += xOffset; 
					yPixel += yOffset;
					if(xPixel==cubeFaceWidth)
						xPixel-=1;
			
					//	xPixel-=2*cubeFaceWidth;
					yPixel-=cubeFaceHeight;
					if(xPixel>=2048)
					xPixel=2047;
					if(yPixel>=2048)
					yPixel=2047;
					arr[this.my_h*i*4+j*4]=left[cubeFaceHeight*yPixel*4+xPixel*4];
					arr[this.my_h*i*4+j*4+1]=left[cubeFaceHeight*yPixel*4+xPixel*4+1];
					arr[this.my_h*i*4+j*4+2]=left[cubeFaceHeight*yPixel*4+xPixel*4+2];
					arr[this.my_h*i*4+j*4+3]=left[cubeFaceHeight*yPixel*4+xPixel*4+3];

				//	arr[this.my_h*i*4+j*4]=0;
				//	arr[this.my_h*i*4+j*4+1]=255;
				//	arr[this.my_h*i*4+j*4+2]=0;
				//	arr[this.my_h*i*4+j*4+3]=1;

				// if(ya==1||ya==-1||za==1||za==-1)
				// 	{
				// 		arr[this.my_h*i*4+j*4]=0;
				// 		arr[this.my_h*i*4+j*4+1]=255;
				// 		arr[this.my_h*i*4+j*4+2]=0;
				// 		arr[this.my_h*i*4+j*4+3]=1;

				// 		console.log(xPixel+" xpixel "+i);

				// 	}
				} 
				else if(ya == 1)
				{
					// Up 
					xPixel =((((xa + 1)/ 2)) * cubeFaceWidth); xPixel=Math.round(xPixel);
					xOffset = cubeFaceWidth; 
					yPixel =((((za + 1)/ 2) -  1)* cubeFaceHeight); yPixel=Math.round(yPixel);
					yOffset = 2 * cubeFaceHeight; 
					xPixel = Math.abs(xPixel); 
					yPixel = Math.abs(yPixel); 
					
					xPixel += xOffset; 
					yPixel += yOffset; 
					//Debug.Log (xPixel+" up "+yPixel+" j="+j+" i="+i);
					
					xPixel-=cubeFaceWidth;
					yPixel-=2*cubeFaceHeight;
					if(xPixel>=2048)
					xPixel=2047;if(yPixel>=2048)
					yPixel=2047;
					arr[this.my_h*i*4+j*4]=top[cubeFaceHeight*yPixel*4+xPixel*4];
					arr[this.my_h*i*4+j*4+1]=top[cubeFaceHeight*yPixel*4+xPixel*4+1];
					arr[this.my_h*i*4+j*4+2]=top[cubeFaceHeight*yPixel*4+xPixel*4+2];
					arr[this.my_h*i*4+j*4+3]=top[cubeFaceHeight*yPixel*4+xPixel*4+3];

				//	arr[this.my_h*i*4+j*4]=0;
				//	arr[this.my_h*i*4+j*4+1]=0;
				//	arr[this.my_h*i*4+j*4+2]=255;
				//	arr[this.my_h*i*4+j*4+3]=1;
				} 
				else if(ya == -1)
				{
					// Down 
					xPixel =((((xa + 1)/ 2) )* cubeFaceWidth);  xPixel=Math.round(xPixel);
					xOffset = cubeFaceWidth; 
					yPixel =((((za + 1)/ 2))* cubeFaceHeight);  yPixel=Math.round(yPixel);
					yOffset = 0; 
					xPixel = Math.abs(xPixel); 
					yPixel = Math.abs(yPixel); 
					
					xPixel += xOffset; 
					yPixel += yOffset; 
					//	Debug.Log (xPixel+" down "+yPixel+" j="+j+" i="+i);
					
					xPixel-=cubeFaceWidth;
					//		yPixel-=2*cubeFaceHeight;
					if(xPixel>=2048)
						xPixel=2047;if(yPixel>=2048)
						yPixel=2047;
					arr[this.my_h*i*4+j*4]=bot[cubeFaceHeight*yPixel*4+xPixel*4];
					arr[this.my_h*i*4+j*4+1]=bot[cubeFaceHeight*yPixel*4+xPixel*4+1];
					arr[this.my_h*i*4+j*4+2]=bot[cubeFaceHeight*yPixel*4+xPixel*4+2];
					arr[this.my_h*i*4+j*4+3]=bot[cubeFaceHeight*yPixel*4+xPixel*4+3];

				//	arr[this.my_h*i*4+j*4]=125;
				//	arr[this.my_h*i*4+j*4+1]=125;
				//	arr[this.my_h*i*4+j*4+2]=0;
				//	arr[this.my_h*i*4+j*4+3]=1;
				} 
				else if(za == 1)
				{
					//前
					xPixel =((((xa + 1)/ 2)) * cubeFaceWidth); xPixel=Math.round(xPixel);
					xOffset = cubeFaceWidth; 
					yPixel =((((ya + 1)/ 2))* cubeFaceHeight); yPixel=Math.round(yPixel);
					yOffset = cubeFaceHeight; 
					xPixel = Math.abs(xPixel); 
					yPixel = Math.abs(yPixel); 
					
					xPixel += xOffset; 
					yPixel += yOffset; 
					//	Debug.Log (xPixel+" front "+yPixel+" j="+j+" i="+i);
					
				
					
					xPixel-=cubeFaceWidth;
					yPixel-=cubeFaceHeight;
					if(xPixel>=2048)
					xPixel=2047;if(yPixel>=2048)
					yPixel=2047;
				
					arr[this.my_h*i*4+j*4]=front[cubeFaceHeight*yPixel*4+xPixel*4];
					arr[this.my_h*i*4+j*4+1]=front[cubeFaceHeight*yPixel*4+xPixel*4+1];
					arr[this.my_h*i*4+j*4+2]=front[cubeFaceHeight*yPixel*4+xPixel*4+2];
					arr[this.my_h*i*4+j*4+3]=front[cubeFaceHeight*yPixel*4+xPixel*4+3];

				//	arr[this.my_h*i*4+j*4]=255;
				//	arr[this.my_h*i*4+j*4+1]=0;
				//	arr[this.my_h*i*4+j*4+2]=0;
				//	arr[this.my_h*i*4+j*4+3]=1;
				} 
				else if(za == -1)
				{
					//back
					xPixel =((((xa + 1)/ 2) -  1)* cubeFaceWidth); xPixel=Math.round(xPixel);
					xOffset = 3 * cubeFaceWidth; 
					yPixel =((((ya + 1)/ 2))* cubeFaceHeight); yPixel=Math.round(yPixel);
					yOffset = cubeFaceHeight; 
					xPixel = Math.abs(xPixel); 
					yPixel = Math.abs(yPixel); 
					
					xPixel += xOffset; 
					yPixel += yOffset; 
					//	Debug.Log (xPixel+" back "+yPixel+" j="+j+" i="+i);
					
					xPixel-=3*cubeFaceWidth;
					yPixel-=cubeFaceHeight;
					// if(tempc<1000&&j>400)
					// {
					// 	console.log(i+" "+j+" "+xPixel+" back "+yPixel);
					// 	console.warn(back[cubeFaceHeight*yPixel*4+xPixel*4]);
					// 	console.warn(back[cubeFaceHeight*yPixel*4+xPixel*4+1]);
					// 	console.warn(back[cubeFaceHeight*yPixel*4+xPixel*4+2]);
					// 	tempc++;

						
					// }
					if(xPixel>=2048)
						xPixel=2047;if(yPixel>=2048)
						yPixel=2047;

					arr[this.my_h*i*4+j*4]=back[cubeFaceHeight*yPixel*4+xPixel*4];
						arr[this.my_h*i*4+j*4+1]=back[cubeFaceHeight*yPixel*4+xPixel*4+1];
						arr[this.my_h*i*4+j*4+2]=back[cubeFaceHeight*yPixel*4+xPixel*4+2];
						arr[this.my_h*i*4+j*4+3]=back[cubeFaceHeight*yPixel*4+xPixel*4+3];
				
						// if(xa<-0.99)
						// {
						// 	arr[this.my_h*i*4+j*4]=0;
						// 	arr[this.my_h*i*4+j*4+1]=255;
						// 	arr[this.my_h*i*4+j*4+2]=0;
						// 	arr[this.my_h*i*4+j*4+3]=1;

						// 	console.log(xPixel+" xy "+yPixel);
	
						// }
						

				//	arr[this.my_h*i*4+j*4]=front[cubeFaceHeight*yPixel*4+xPixel*4];
				//	arr[this.my_h*i*4+j*4+1]=front[cubeFaceHeight*yPixel*4+xPixel*4+1];
				//	arr[this.my_h*i*4+j*4+2]=front[cubeFaceHeight*yPixel*4+xPixel*4+2];
				//	arr[this.my_h*i*4+j*4+3]=front[cubeFaceHeight*yPixel*4+xPixel*4+3];

				//	console.log(arr[this.my_h*i*4+j*4]);
				//	console.log(arr[this.my_h*i*4+j*4+1]);
				//	console.log(arr[this.my_h*i*4+j*4+2]);
				//	console.log(arr[this.my_h*i*4+j*4+3]);
				} 
				else//	其他255;//
				{
					//Debug.LogWarning("未知的面孔,出错了"); 
					console.log(i+" "+j+"未知的面孔,出错了"+xa+" "+ya+" "+za);
					xPixel = 0; 
					yPixel = 0; 
					xOffset = 0; 
					yOffset = 0; 
				} 
			}
		}
		var textureContext = texture.getContext();
		var imageData = new ImageData(arr,this.my_w, this.my_h);
		textureContext.putImageData(imageData, 0, 0);
		texture.update();  
		// this.box =BABYLON.Mesh.CreateBox("box",170,scene);
		this.box?.setEnabled(true);
		if(this.box!=null)
		{
			// this.box.setEnabled(true);
			//	 box.position=this.position.subtract(new BABYLON.Vector3(0,170,0));
			var mat = new BABYLON.StandardMaterial("mat", scene);
			mat.diffuseTexture = texture;
			console.log(this.box.position+" "+texture.isReady());
			this.box.position.x=this.camera.position.x;
			this.box.position.y=this.camera.position.y;
			this.box.position.z=this.camera.position.z;
			console.log(this.box.position+" "+texture.isReady());
			this.box.position.z+=170;
			// this.box.position.y+=170;
			console.log(this.box.position+" "+this.camera.position);
			this.box.material = mat;
		}
	
		
		// let _observer: Nullable<BABYLON.Observer<BABYLON.Scene>> = null;

		// _observer = scene.onBeforeRenderObservable.add(() => {

              
			

		   
		//   });

	}
}