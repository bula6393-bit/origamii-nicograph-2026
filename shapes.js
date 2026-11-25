'use strict';

// Representative connected surfaces for the form explorer, not a mechanics solver.
// Miura and the parallel accordion preserve panel edge lengths along this path.
// The cylindrical and flasher paths illustrate their distinct crease topology.
function meshFor(f,open){
 const r=Math.max(0,Math.min(1,Number(open)/100)),v=[],faces=[];
 const add=p=>{v.push(p);return v.length-1;};
 const face=ids=>faces.push(ids);
 const tau=2*Math.PI;
 const ring=(n,radius,y,phase=0)=>Array.from({length:n},(_,i)=>{
  const angle=tau*i/n+phase;
  return add([radius*Math.cos(angle),y,radius*Math.sin(angle)]);
 });
 if(f==='Miura'){
  const cols=6,rows=5,a=.86,b=.76,alpha=Math.PI/3,theta=1.48*(1-r);
  const height=a*Math.sin(alpha)*Math.sin(theta);
  const dx=Math.sqrt(a*a-height*height);
  const offset=a*b*Math.cos(alpha)/dx;
  const dz=Math.sqrt(Math.max(0,b*b-offset*offset));
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
   add([(i-cols/2)*dx+((j%2)-.5)*offset,((i%2)-.5)*height,(j-rows/2)*dz]);
  }
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
   const a=j*(cols+1)+i;face([a,a+1,a+cols+2,a+cols+1]);
  }
 }else if(f==='Accordion'){
  const panels=10,panelWidth=.56,theta=1.46*(1-r);
  const step=panelWidth*Math.cos(theta),rise=panelWidth*Math.sin(theta);
  for(let i=0;i<=panels;i++)for(const z of [-1.24,1.24]){
   add([(i-panels/2)*step,((i%2)-.5)*rise,z]);
  }
  for(let i=0;i<panels;i++)face([2*i,2*i+2,2*i+3,2*i+1]);
 }else if(f==='Kresling'){
  // Two chiral bays. Successive rings rotate in the same direction.
  // No solid end caps: the folded tube and inner facets remain visible.
  const n=6,bays=2,radius=1.18,height=.42+2.65*r,twist=1.0*(1-r)+.08;
  const rings=Array.from({length:bays+1},(_,j)=>ring(n,radius,(j/bays-.5)*height,j*twist));
  for(let j=0;j<bays;j++)for(let i=0;i<n;i++){
   const next=(i+1)%n;
   face([rings[j][i],rings[j+1][i],rings[j][next]]);
   face([rings[j][next],rings[j+1][i],rings[j+1][next]]);
  }
 }else if(f==='Yoshimura'){
  // Mirror-symmetric, staggered triangular rows form the diamond bellows.
  // Alternate rows reverse their half-sector offset; there is no cumulative twist.
  const n=8,bays=3,height=.62+2.35*r,radius=1.24;
  const rings=[];
  for(let j=0;j<=2*bays;j++){
   const waist=j%2===1,rad=waist?radius*Math.cos(Math.PI/n)-(.31*(1-r)+.025):radius;
   rings.push(ring(n,rad,(j/(2*bays)-.5)*height,waist?Math.PI/n:0));
  }
  for(let j=0;j<2*bays;j++)for(let i=0;i<n;i++){
   const next=(i+1)%n,a=rings[j],b=rings[j+1];
   if(j%2===0){face([a[i],b[i],a[next]]);face([a[next],b[i],b[next]]);}
   else{face([a[i],b[next],a[next]]);face([a[i],b[i],b[next]]);}
  }
 }else if(f==='Waterbomb'){
  // Tubular waterbomb tessellation: each rectangular base has six triangular
  // sectors meeting at one vertex (four corner rays and two transverse rays).
  // Shared boundary vertices make a continuous barrel, rather than a radial fan.
  const n=8,bays=4,height=.72+2.5*r;
  const profile=t=>1.03+.36*Math.sin(Math.PI*t)+.1*(1-r);
  const depth=.1+.37*(1-r);
  const borders=Array.from({length:bays+1},(_,j)=>ring(n,profile(j/bays),(j/bays-.5)*height));
  const sides=Array.from({length:bays},(_,j)=>{
   const t=(j+.5)/bays;return ring(n,profile(t)-depth,(t-.5)*height);
  });
  const centers=Array.from({length:bays},(_,j)=>{
   const t=(j+.5)/bays;return ring(n,profile(t)+.12*(1-r),(t-.5)*height,Math.PI/n);
  });
  for(let j=0;j<bays;j++)for(let i=0;i<n;i++){
   const next=(i+1)%n,c=centers[j][i];
   const boundary=[borders[j][i],sides[j][i],borders[j+1][i],borders[j+1][next],sides[j][next],borders[j][next]];
   for(let k=0;k<6;k++)face([c,boundary[k],boundary[(k+1)%6]]);
  }
 }else if(f==='Flasher'){
  // A single disk with a central hexagon, six spiral arms and concentric folds.
  // All annular patches share their vertices and the angular seam is welded.
  const arms=6,n=arms*2,bands=4,expansion=.17+.83*r,core=.4;
  const rings=[];
  for(let j=0;j<=bands;j++){
   const ids=[];
   for(let i=0;i<n;i++){
    const ridge=i%2===0,angle=tau*i/n+j*(.12+.56*(1-r));
    const polygonFactor=ridge?1:Math.cos(Math.PI/arms);
    const radius=(core+2.05*j/bands*expansion)*polygonFactor;
    const y=j===0?0:(j*.16+(ridge?.24:-.14))*(1-r);
    ids.push(add([radius*Math.cos(angle),y,radius*Math.sin(angle)]));
   }
   rings.push(ids);
  }
  // Polygon includes the collinear mid-edge points so its boundary is shared.
  face([...rings[0]].reverse());
  for(let j=0;j<bands;j++)for(let i=0;i<n;i++){
   const next=(i+1)%n,a=rings[j][i],b=rings[j][next],c=rings[j+1][next],d=rings[j+1][i];
   face([a,d,c]);face([a,c,b]);
  }
 }else throw new Error('Unknown origami family: '+f);
 // Consistent outward winding for tubes; upward winding for sheet/disc models.
 const tubular=['Kresling','Yoshimura','Waterbomb'].includes(f);
 for(const ids of faces){
  const pts=ids.map(i=>v[i]),normal=faceNormal(pts);
  const center=pts.reduce((a,p)=>a.map((x,k)=>x+p[k]/pts.length),[0,0,0]);
  if((tubular?normal[0]*center[0]+normal[2]*center[2]:normal[1])<0)ids.reverse();
 }
 return {v,faces};
}
function faceNormal(points){
 // Newell's normal also works for a polygon with collinear boundary vertices.
 const n=[0,0,0];
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length];
  n[0]+=(a[1]-b[1])*(a[2]+b[2]);
  n[1]+=(a[2]-b[2])*(a[0]+b[0]);
  n[2]+=(a[0]-b[0])*(a[1]+b[1]);
 }
 return n;
}

function renderMesh(canvas,f,open,yaw,pitch,thumb=false){
 const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const dpr=Math.min(window.devicePixelRatio||1,2),w=rect.width,h=rect.height;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const mesh=meshFor(f,open),scale=Math.min(w/(thumb?7:7.3),h/(thumb?4:4.7)),dist=14,cx=w*.5,cy=h*(thumb?.5:.49),cyaw=Math.cos(yaw),syaw=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const world=mesh.v.map(([x,y,z])=>{const xx=x*cyaw+z*syaw,zz=-x*syaw+z*cyaw;return [xx,y*cp-zz*sp,y*sp+zz*cp];}),project=([x,y,z])=>[cx+x*scale*dist/(dist-z),cy-y*scale*dist/(dist-z)];
 if(!thumb){ctx.save();ctx.strokeStyle='#7e9ec815';ctx.lineWidth=.7;for(let i=-6;i<=6;i++){let a=project([i,-1.45,-5]),b=project([i,-1.45,5]);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();a=project([-6,-1.45,i]);b=project([6,-1.45,i]);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}ctx.restore();const grad=ctx.createRadialGradient(cx,cy+45,10,cx,cy+45,Math.max(w*.3,80));grad.addColorStop(0,'#000c');grad.addColorStop(1,'#0000');ctx.save();ctx.translate(cx,cy+45);ctx.scale(1,.2);ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(0,0,w*.32,w*.32,0,0,Math.PI*2);ctx.fill();ctx.restore();}
 const sorted=mesh.faces.map((face,i)=>({face,i,z:face.reduce((n,j)=>n+world[j][2],0)/face.length})).sort((a,b)=>a.z-b.z);
 for(const item of sorted){const pts=item.face.map(j=>world[j]),n=faceNormal(pts),len=Math.hypot(...n)||1,light=Math.abs((n[0]*.25+n[1]*.7+n[2]*.65)/len),shade=.38+light*.52;
  const back=n[2]<0;const color=thumb?[Math.round(72+shade*65),Math.round(106+shade*65),Math.round(163+shade*65)]:back?[Math.round(28+shade*48),Math.round(59+shade*61),Math.round(103+shade*79)]:[Math.round(45+shade*108),Math.round(91+shade*105),Math.round(150+shade*100)];ctx.beginPath();pts.map(project).forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle='rgb('+color.join(',')+')';ctx.fill();ctx.strokeStyle=thumb?'#f3f6ffb0':'#b6d3ffb0';ctx.lineWidth=thumb?.55:1;ctx.lineJoin='round';ctx.stroke();
 }

}
