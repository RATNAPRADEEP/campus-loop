export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({success:false,error:'Method not allowed'});
  try{
    const {action,phone,code,college}=req.body||{};
    if(action!=='send-recovery'||!phone||!code)return res.status(400).json({success:false,error:'Invalid recovery request'});
    const token=process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId=process.env.WHATSAPP_PHONE_NUMBER_ID;
    if(!token||!phoneNumberId)return res.status(503).json({success:false,error:'WhatsApp recovery is not configured yet.'});
    const to=String(phone).replace(/[^0-9]/g,'');
    const response=await fetch('https://graph.facebook.com/v23.0/'+phoneNumberId+'/messages',{
      method:'POST',
      headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{body:'CampusLoop password recovery for '+String(college||'your college')+'. Your one-time recovery code is '+String(code)+'. It expires in 10 minutes. Do not share this code.'}})
    });
    const data=await response.json();
    if(!response.ok)return res.status(502).json({success:false,error:data?.error?.message||'WhatsApp delivery failed'});
    return res.status(200).json({success:true});
  }catch(e){return res.status(500).json({success:false,error:'Unable to send WhatsApp recovery message.'})}
}