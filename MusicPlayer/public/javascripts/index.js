function $(s){
	console.log("success");
	return document.querySelectorAll(s);
}
var lis=$("#list li");
for(var i=0;i<lis.length;i++){
	lis[i].onclick=function(){
		for(var j=0;j<lis.length;j++){
			lis[j].className="";
		}
		this.className="selected";
		load("/media/"+this.title);
	}
}
var xhr=new XMLHttpRequest();
//截取音频数据
var ac=new(window.AudioContext||window.webkitAudioContext)();
//创建音量控制节点,链接到硬件
var gainNode=ac.createGain();
gainNode.connect(ac.destination);
//分析数据的节点
var analyser=ac.createAnalyser();
var size=512/2;
analyser.fftsize=512;
analyser.connect(gainNode);
var source=null;
var count=0;
var box=$("#box")[0];
var height,width;
var canvas=document.createElement("canvas");
var cxt=canvas.getContext("2d");
box.appendChild(canvas);
//圆点的数组
var Dots=[];
var line;
function random(m,n){
	return Math.round(Math.random()*(n-m)+m);
}
function getDots(){
	Dots=[];
	for(var i=0;i<size;i++){
		var x=random(0,width);
		var y=random(0,height);
		var color="rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+","+0+")";
		Dots.push({
			x:x,
			y:y,
			dx:random(1,4),
			color:color,
			cap:0
		})
	}
}
function resize(){
	height=box.clientHeight;
	width=box.clientWidth;
	canvas.height=height;
	canvas.width=width;
 line=cxt.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,'green');
	
	getDots();
}
resize();
window.onresize=resize;
function draw(arr){
	cxt.clearRect(0,0,width,height);
var w=width/size;
	
cxt.fillStyle=line;
for(var i=0;i<size;i++)
{
	var o=Dots[i];
	if(draw.type=="column"){
		//因为频域是256
	var h=arr[i]/256*height;
	//小帽的高度
	var capH=w*0.6;
	cxt.fillRect(w*i,height-h,w*0.6,h);

	//小帽
	cxt.fillRect(w*i,height-o.cap-capH,w*0.6,capH);
	o.cap--;
	if(o.cap<0){
		o.cap=0;
	}
	if(h>0&&o.cap<h+40){
		o.cap=h+40>height-capH?height-capH:h+40;

	}
}else if(draw.type=="dot"){
	cxt.beginPath();

	var r=10+arr[i]/256*(height>width?width:height)/20;
	cxt.arc(o.x,o.y,r,0,Math.PI*2,true);
	var g=cxt.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
	g.addColorStop(0,"#fff");
	g.addColorStop(1,o.color);
	cxt.fillStyle=g;
	cxt.fill();
	o.x+=o.dx;
	o.x=o.x>width?0:o.x;
}
	
}
}
draw.type="column";
var types =$("#type li");
for(var i=0;i<types.length;i++){
	types[i].onclick=function(){
		for(var j=0;j<types.length;j++){
			types[j].className="";
			
		}
		this.className="selected";
		draw.type=this.getAttribute("data-type");
	}
	
	
}
function load(url){
	//防止用户快速点击多次,造成资源下载错乱
	var n=++count;
	//判断source是否已经存在，防止多首音乐同时播放
	source && source[source.stop?"stop":noteOff]();
	xhr.abort();//终结以前的ajax请求
		xhr.open("GET",url);
	xhr.responseType="arraybuffer";
	xhr.onload=function(){
		if(n!=count) return;
		//当音频加载完成后解码，解码之后音频存储在AudioBuffer中，执行第二个回掉函数
		ac.decodeAudioData(xhr.response,function(buffer){
			if(n!=count) return;
			var bufferSource=ac.createBufferSource();//创建一个声音源
			bufferSource.buffer=buffer;//告诉声音源播放何物
			bufferSource.connect(analyser);
			
			//bufferSource.connect(ac.destination);//链接到硬件
			bufferSource.start(0);
			//传递对象的引用，
			source=bufferSource;
		},function(err){
			console.log(err);
		});
	}
	xhr.send();
}
//实时的获取数据
function visualizer(){
	var arr=new Uint8Array(analyser.frequencyBinCount);
	//将分析得到的数据复制到一个数组
	//analyser.getByteFrequencyData(arr);
	//实时获取数据
	requestAnimationFrame=window.requestAnimationFrame||window.webkitrequestAnimationFrame||window.mozrequestAnimationFrame;
	function v(){
		analyser.getByteFrequencyData(arr);
		draw(arr);
		requestAnimationFrame(v);

	}
	requestAnimationFrame(v);
}
visualizer();
function changeVolume(precent){
gainNode.gain.value=precent*precent;
}
$("#volumn")[0].onchange=function(){
	changeVolume(this.value/this.max);
}
$("#volumn")[0].onchange();