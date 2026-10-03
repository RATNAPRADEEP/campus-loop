const MODEL='gpt-5.6-luna';
function json(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body))}
module.exports=async function(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!process.env.OPENAI_API_KEY)return json(res,503,{error:'AI is not configured. Add OPENAI_API_KEY in Vercel environment variables.'});
 try{
  const body=req.body||{},message=String(body.message||'').trim();if(!message)return json(res,400,{error:'Enter a question.'});
  const context=Array.isArray(body.resources)?body.resources.slice(0,12):[];
  const input=[{role:'system',content:'You are CampusLoop AI, a helpful assistant for a student campus-sharing platform. Help students discover resources, improve “I Need” requests, suggest categories, and explain safe sharing workflows. Treat supplied resource records as read-only factual context. Never invent availability, prices, identities, or verification status. Do not expose private records beyond what the user supplies.'},{role:'user',content:message+'\n\nCURRENT RESOURCE CONTEXT:\n'+JSON.stringify(context)}];
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,input,max_output_tokens:600,store:false})});
  const data=await response.json();if(!response.ok)return json(res,response.status,{error:data?.error?.message||'AI service error.'});
  return json(res,200,{answer:String(data.output_text||'').trim()});
 }catch(e){return json(res,500,{error:'Unable to reach the AI service right now.'})}
};