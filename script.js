const canvas=document.getElementById("faceCanvas");
const ctx=canvas.getContext("2d");
let layers=[];let selectedLayer=null;let activeTouches=[];
const categories=["face_shapes","hair","eyes","noses","mouths"];
const gallery=document.getElementById("gallery");

const assets={
"face_shapes":["face1.png","face2.png","face3.png","face4.png","face5.png"],
"hair":["hair1.png","hair2.png","hair3.png","hair4.png","hair5.png"],
"eyes":["eyes1.png","eyes2.png","eyes3.png","eyes4.png","eyes5.png"],
"noses":["nose1.png","nose2.png","nose3.png","nose4.png","nose5.png"],
"mouths":["mouth1.png","mouth2.png","mouth3.png","mouth4.png","mouth5.png"]
};

// Build gallery thumbnails
for(const cat in assets){
 assets[cat].forEach(file=>{
  const img=new Image();
  img.src=`assets/${cat}/${file}`;
  img.className="thumb";
  img.onclick=()=>addLayer(cat,img.src);
  gallery.appendChild(img);
 });
}

function addLayer(cat,src){
 layers=layers.filter(l=>l.cat!==cat);
 const l={cat:cat,img:new Image(),x:150,y:150,scale:1,rotation:0};
 l.img.src=src;
 l.img.onload=draw;
 layers.push(l);
}

function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 categories.forEach(cat=>{
  const l=layers.find(layer=>layer.cat===cat);
  if(l){
   ctx.save();
   ctx.translate(l.x+(l.img.width*l.scale)/2,l.y+(l.img.height*l.scale)/2);
   ctx.rotate(l.rotation);
   ctx.drawImage(l.img,-(l.img.width*l.scale)/2,-(l.img.height*l.scale)/2,l.img.width*l.scale,l.img.height*l.scale);
   ctx.restore();
  }
 });
}

function randomize(){
 layers=[];
 categories.forEach(cat=>{
  const arr=assets[cat];
  const rand=arr[Math.floor(Math.random()*arr.length)];
  addLayer(cat,`assets/${cat}/${rand}`);
 });
}

function saveImage(){
 const link=document.createElement("a");
 link.download="face.png";
 link.href=canvas.toDataURL();
 link.click();
}

// Desktop dragging
canvas.addEventListener("mousedown",e=>{
 const mx=e.offsetX,my=e.offsetY;
 for(let i=layers.length-1;i>=0;i--){
  const l=layers[i];
  if(mx>l.x&&mx<l.x+l.img.width*l.scale&&my>l.y&&my<l.y+l.img.height*l.scale){
   selectedLayer=l;break;
  }
 }
});
canvas.addEventListener("mousemove",e=>{
 if(selectedLayer){selectedLayer.x=e.offsetX-50;selectedLayer.y=e.offsetY-50;draw();}
});
canvas.addEventListener("mouseup",()=>selectedLayer=null);

// Touch gestures
let initialDistance=0,initialAngle=0,initialScale=1,initialRotation=0;
canvas.addEventListener("touchstart",e=>{
 e.preventDefault();activeTouches=e.touches;
 if(e.touches.length===1){
  const t=e.touches[0],rect=canvas.getBoundingClientRect();
  const mx=t.clientX-rect.left,my=t.clientY-rect.top;
  for(let i=layers.length-1;i>=0;i--){
   const l=layers[i];
   if(mx>l.x&&mx<l.x+l.img.width*l.scale&&my>l.y&&my<l.y+l.img.height*l.scale){selectedLayer=l;break;}
  }
 }else if(e.touches.length===2&&selectedLayer){
  initialDistance=getDistance(e.touches);
  initialAngle=getAngle(e.touches);
  initialScale=selectedLayer.scale;
  initialRotation=selectedLayer.rotation;
 }
});
canvas.addEventListener("touchmove",e=>{
 e.preventDefault();
 if(!selectedLayer)return;
 if(e.touches.length===1){
  const t=e.touches[0],rect=canvas.getBoundingClientRect();
  selectedLayer.x=t.clientX-rect.left-50;selectedLayer.y=t.clientY-rect.top-50;
 }else if(e.touches.length===2){
  const dist=getDistance(e.touches),angle=getAngle(e.touches);
  selectedLayer.scale=initialScale*(dist/initialDistance);
  selectedLayer.rotation=initialRotation+(angle-initialAngle);
 }
 draw();
});
canvas.addEventListener("touchend",e=>{if(e.touches.length===0)selectedLayer=null;});
function getDistance(t){const dx=t[1].clientX-t[0].clientX,dy=t[1].clientY-t[0].clientY;return Math.sqrt(dx*dx+dy*dy);}
function getAngle(t){const dx=t[1].clientX-t[0].clientX,dy=t[1].clientY-t[0].clientY;return Math.atan2(dy,dx);}
