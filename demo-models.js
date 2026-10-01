/* Local illustrative models only. No service calls or persistent storage. */
(function(root){
 'use strict';
 const profiles={
  google:{label:'Google',response:{name:'샘플 사용자',email:'user@example.com',picture:'profile.jpg'}},
  kakao:{label:'Kakao',response:{kakao_account:{email:'user@example.com',profile:{nickname:'샘플 사용자',profile_image_url:'profile.jpg'}}}},
  naver:{label:'Naver',response:{response:{name:'샘플 사용자',email:'user@example.com',profile_image:'profile.jpg'}}}
 };
 function normalizeProvider(provider){
  const sample=profiles[provider];
  if(!sample)throw new Error('Unknown illustrative provider');
  const response=sample.response;
  let name,email,photo;
  if(provider==='google'){({name,email}=response);photo=response.picture;}
  if(provider==='kakao'){name=response.kakao_account.profile.nickname;email=response.kakao_account.email;photo=response.kakao_account.profile.profile_image_url;}
  if(provider==='naver'){({name,email}=response.response);photo=response.response.profile_image;}
  return {label:sample.label,response,normalized:{name,email,photo,provider}};
 }
 // One educational virtual action. The immutable receipt is separate from UI state.
 const moneyIntent=Object.freeze({roomId:'story-demo',actorId:'learner-demo',requestId:'demo-001',action:'CARD_PAYMENT',amount:12000,decisionId:null});
 function initialMoneyRecovery(){
  return {postRequests:0,getQueries:0,ledgerWrites:0,balance:30000,receipt:null,view:'ready',displayedBalance:null};
 }
 function sendMoneyCommand(state,amount=moneyIntent.amount,loseResponse=false){
  const next={...state,postRequests:state.postRequests+1};
  if(state.receipt!==null){
   if(state.receipt.amount!==amount)return {...next,view:'conflict'};
   return {...next,view:loseResponse?'pending':'completed',displayedBalance:loseResponse?null:state.receipt.balance};
  }
  const balance=state.balance-amount;
  const receipt=Object.freeze({...moneyIntent,amount,balance,receiptId:'receipt-demo-001'});
  return {...next,ledgerWrites:1,balance,receipt,view:loseResponse?'pending':'completed',displayedBalance:loseResponse?null:receipt.balance};
 }
 function loseMoneyResponse(state){return sendMoneyCommand(state,moneyIntent.amount,true);}
 function lookupMoneyReceipt(state){
  return {...state,getQueries:state.getQueries+1,view:state.receipt===null?'not-observed':'completed',displayedBalance:state.receipt?.balance??null};
 }
 function replayMoneyCommand(state,amount=moneyIntent.amount){return sendMoneyCommand(state,amount,false);}
 // Explanatory counts only: no benchmark timings, Redis, database or API calls.
 function initialSlotAdmission(){
  return {capacity:2,requests:0,accepted:0,beforeLockEntries:0,gateLockEntries:0,gateRejections:0};
 }
 function sendSlotBurst(state){
  const requests=state.requests+6;
  const accepted=Math.min(requests,state.capacity);
  return {...state,requests,accepted,beforeLockEntries:requests,gateLockEntries:accepted,gateRejections:requests-accepted};
 }
 const retryScenarios=Object.freeze({
  version:['version','success'],
  deadlock:['deadlock','success'],
  exhausted:['version','deadlock','version'],
  business:['business']
 });
 function initialSlotRetry(scenario='version'){
  if(!Object.hasOwn(retryScenarios,scenario))throw new Error('Unknown illustrative retry scenario');
  return {scenario,attempts:0,status:'ready',gateReleases:0,events:[]};
 }
 function stepSlotRetry(state){
  if(!['ready','retrying'].includes(state.status))return {...state,events:state.events.map(event=>({...event}))};
  const attempt=state.attempts+1;
  const outcome=retryScenarios[state.scenario][attempt-1];
  const status=outcome==='success'?'succeeded':outcome==='business'?'rejected':attempt===3?'exhausted':'retrying';
  const event={attempt,transaction:`TX-${attempt}`,outcome,rolledBack:outcome!=='success',retryScheduled:status==='retrying'};
  return {...state,attempts:attempt,status,gateReleases:['rejected','exhausted'].includes(status)?1:0,events:[...state.events.map(item=>({...item})),event]};
 }
 const api=Object.freeze({normalizeProvider,moneyIntent,initialMoneyRecovery,loseMoneyResponse,lookupMoneyReceipt,replayMoneyCommand,initialSlotAdmission,sendSlotBurst,initialSlotRetry,stepSlotRetry});
 root.PortfolioDemos=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
