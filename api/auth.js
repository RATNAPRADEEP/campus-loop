const CLOUD_API='https://script.google.com/macros/s/AKfycbyBhy86AN9c3oJX1tJryljtGxUI7MI8q9rSJhTTvSM3cHL1WKumTz-f0aNA8QM6xXes8Q/exec';
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({success:false,error:'Method not allowed'});
  try{
    const body=req.body||{};
    if(!['register','login','reset-password','send-recovery','update-profile'].includes(body.action))return res.status(400).json({success:false,error:'Invalid auth action'});
    const upstream=await fetch(CLOUD_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
    const text=await upstream.text();let result;
    try{result=JSON.parse(text)}catch{return res.status(502).json({success:false,error:'Apps Script returned a non-JSON auth response'})}
    return res.status(upstream.ok&&result.success?200:401).json(result);
  }catch(e){return res.status(500).json({success:false,error:e.message})}
}