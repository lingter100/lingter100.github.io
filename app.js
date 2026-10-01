const dialog=document.querySelector('#image-dialog');
const dialogImage=document.querySelector('#dialog-image');
const dialogCaption=document.querySelector('#dialog-caption');
let lastImageTrigger=null;
for(const button of document.querySelectorAll('[data-image]')){
 button.addEventListener('click',()=>{
  lastImageTrigger=button;
  dialogImage.src=button.dataset.image;
  dialogImage.alt=button.querySelector('img')?.alt||button.dataset.caption;
  dialogCaption.textContent=button.dataset.caption;
  dialog.showModal();
  document.body.style.overflow='hidden';
 });
}
function closeImage(){if(dialog.open)dialog.close();}
dialog.querySelector('.dialog-close').addEventListener('click',closeImage);
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeImage();}});
dialog.addEventListener('close',()=>{document.body.style.overflow='';lastImageTrigger?.focus();});
if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
 document.documentElement.classList.add('js-motion');
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:.06});
 for(const element of document.querySelectorAll('.case-top,.showcase,.outcome-row,.section-intro,.about-grid')){element.classList.add('reveal');observer.observe(element);}
}

// Project principles are local illustrations, never calls to the original services.
const demos=globalThis.PortfolioDemos;
function feedback(selector){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 for(const node of document.querySelectorAll(selector)){
  node.classList.remove('result-updated');
  requestAnimationFrame(()=>{node.classList.add('result-updated');});
 }
}
function renderProvider(provider,announce){
 const sample=demos.normalizeProvider(provider);
 document.querySelector('#provider-name').textContent=sample.label;
 document.querySelector('#provider-response').textContent=JSON.stringify(sample.response,null,2);
 const list=document.querySelector('#normalized-user');
 list.replaceChildren();
 for(const [key,label] of [['name','이름'],['email','이메일'],['photo','사진'],['provider','제공자']]){
  const row=document.createElement('div'),term=document.createElement('dt'),value=document.createElement('dd');
  term.textContent=label;value.textContent=sample.normalized[key];row.append(term,value);list.append(row);
 }
 for(const button of document.querySelectorAll('[data-provider]'))button.setAttribute('aria-pressed',String(button.dataset.provider===provider));
 if(announce)document.querySelector('#provider-status').textContent=`${sample.label}의 응답을 공통 필드로 변환했습니다. 이메일과 제공자를 함께 사용해 회원을 조회합니다. 저장된 ROLE_USER 권한과 세션 사용자 정보로 로그인 상태를 연결합니다.`;
}
for(const button of document.querySelectorAll('[data-provider]'))button.addEventListener('click',()=>{renderProvider(button.dataset.provider,true);feedback('.mapping-panels');});
renderProvider('google',false);
let moneyState=demos.initialMoneyRecovery();
const moneyMessages={ready:'12,000원의 가상 카드 결제를 처리한 뒤 응답만 유실되는 상황을 시작해 보세요.',pending:'가상 원장과 완료 기록은 저장됐지만 브라우저는 응답을 받지 못했습니다. 새로고침 후 결과 조회로 본인의 완료 기록을 확인해 보세요.',completed:'본인의 저장된 완료 기록을 표시합니다. 가상 원장을 다시 실행하거나 당시 결과를 다시 계산하지 않습니다.',conflict:'같은 요청 번호에 다른 금액이 담겨 요청 충돌로 거부했습니다. 원장 잔액과 저장된 완료 기록은 바뀌지 않습니다.','not-observed':'아직 처리 기록을 찾지 못했습니다. 실패로 단정하거나 실행 요청을 자동으로 보내지 않습니다.'};
function renderMoneyRecovery(message){
 for(const [id,key] of [['money-post-count','postRequests'],['money-get-count','getQueries'],['money-write-count','ledgerWrites']])document.getElementById(id).textContent=moneyState[key];
 document.querySelector('#money-ledger-balance').textContent=moneyState.balance.toLocaleString('ko-KR');
 document.querySelector('#money-receipt-balance').textContent=moneyState.displayedBalance===null?'아직 확인하지 못함':`${moneyState.displayedBalance.toLocaleString('ko-KR')}원`;
 document.querySelector('#money-browser-state').textContent={ready:'실행 전',pending:'응답 대기',completed:'완료 기록 확인',conflict:'요청 충돌','not-observed':'처리 기록 미확인'}[moneyState.view];
 document.querySelector('#money-receipt-state').textContent=moneyState.receipt===null?'저장 전':'완료 기록 1건 보존';
 document.querySelector('#lose-money-response').disabled=moneyState.receipt!==null;
 document.querySelector('#replay-money-request').disabled=moneyState.receipt===null;
 document.querySelector('#conflict-money-request').disabled=moneyState.receipt===null;
 document.querySelector('#money-recovery-status').textContent=message||moneyMessages[moneyState.view];
}
document.querySelector('#lose-money-response').addEventListener('click',()=>{moneyState=demos.loseMoneyResponse(moneyState);renderMoneyRecovery();feedback('.money-state-panels, .money-counters, #money-recovery-status');});
document.querySelector('#lookup-money-receipt').addEventListener('click',()=>{moneyState=demos.lookupMoneyReceipt(moneyState);renderMoneyRecovery(moneyState.receipt===null?moneyMessages['not-observed']:'새로고침 복구를 모의 실행했습니다. 완료 기록 GET 조회만 추가하고 저장된 18,000원 결과를 확인했습니다. 실행 POST와 원장 반영 횟수는 늘지 않습니다.');feedback('.money-state-panels, .money-counters, #money-recovery-status');});
document.querySelector('#replay-money-request').addEventListener('click',()=>{moneyState=demos.replayMoneyCommand(moneyState);renderMoneyRecovery('원래 요청 번호와 금액으로 명시적으로 다시 확인했습니다. POST는 늘지만 같은 완료 기록을 반환하므로 원장 반영은 1회입니다.');feedback('.money-counters, #money-recovery-status');});
document.querySelector('#conflict-money-request').addEventListener('click',()=>{moneyState=demos.replayMoneyCommand(moneyState,16000);renderMoneyRecovery();feedback('.money-counters, #money-recovery-status');});
document.querySelector('#reset-money-recovery').addEventListener('click',()=>{moneyState=demos.initialMoneyRecovery();renderMoneyRecovery('초기화했습니다. 가상 잔액 30,000원과 실행 전 상태로 돌아왔습니다.');feedback('.money-state-panels, .money-counters, #money-recovery-status');});
let admissionState=demos.initialSlotAdmission();
function renderSlotAdmission(reset=false){
 for(const [id,key] of [['slot-request-count','requests'],['slot-before-count','beforeLockEntries'],['slot-after-count','gateLockEntries'],['slot-gate-rejections','gateRejections'],['slot-accepted-count','accepted']])document.getElementById(id).textContent=admissionState[key];
 document.querySelector('#slot-admission-status').textContent=reset?'초기화했습니다. 예시 요청 6건을 보내 두 방식의 DB 예약 락 진입 수를 비교해 보세요.':`누적 예시 요청 ${admissionState.requests}건 중 예약 ${admissionState.accepted}건. DB 락만 사용할 때는 ${admissionState.beforeLockEntries}건, Redis 게이트를 둘 때는 ${admissionState.gateLockEntries}건이 DB 예약 락에 진입합니다. 게이트의 사전 거부는 ${admissionState.gateRejections}건입니다.`;
}
document.querySelector('#send-slot-burst').addEventListener('click',()=>{admissionState=demos.sendSlotBurst(admissionState);renderSlotAdmission();feedback('.admission-panels, #slot-admission-status');});
document.querySelector('#reset-slot-burst').addEventListener('click',()=>{admissionState=demos.initialSlotAdmission();renderSlotAdmission(true);feedback('.admission-panels, #slot-admission-status');});
let retryState=demos.initialSlotRetry();
const retrySelect=document.querySelector('#slot-retry-scenario');
const retryOutcomeLabels={version:'@Version 충돌',deadlock:'FK 잠금 승격 데드락',business:'업무 조건 실패',success:'예약 저장 성공'};
const retryMessages={ready:'시나리오를 고르고 첫 트랜잭션을 실행해 보세요. 매번 새 트랜잭션에서 시도합니다.',retrying:'동시성 실패로 롤백했습니다. 짧은 무작위 대기(지터) 후 다음 시도는 새 트랜잭션에서 진행합니다.',succeeded:'새 트랜잭션에서 예약을 저장했습니다. 이 시나리오의 실행을 마쳤습니다.',exhausted:'첫 시도를 포함해 3회 모두 실패했습니다. 재시도를 멈추고 Redis 임시 슬롯을 한 번 반환합니다.',rejected:'업무 조건 실패는 재시도하지 않습니다. Redis 임시 슬롯을 한 번 반환합니다.'};
function renderSlotRetry(){
 const terminal=!['ready','retrying'].includes(retryState.status);
 const button=document.querySelector('#step-slot-retry');
 button.disabled=terminal;
 button.textContent=terminal?'시나리오 실행 완료':retryState.attempts===0?'첫 트랜잭션 실행':'다음 트랜잭션 실행';
 document.querySelector('#slot-retry-count').textContent=retryState.attempts;
 const log=document.querySelector('#slot-retry-log');
 log.replaceChildren();
 if(retryState.events.length===0){const item=document.createElement('li');item.className='retry-empty';item.textContent='실행 전 · 이 영역에 각 트랜잭션의 결과가 표시됩니다.';log.append(item);}
 for(const event of retryState.events){
  const item=document.createElement('li'),label=document.createElement('strong'),detail=document.createElement('span');
  label.textContent=event.transaction;
  detail.textContent=retryOutcomeLabels[event.outcome]+(event.rolledBack?' → 롤백':' → 커밋')+(event.retryScheduled?' → 지터 후 재시도':'');
  item.append(label,detail);log.append(item);
 }
 document.querySelector('#slot-retry-status').textContent=retryMessages[retryState.status];
}
retrySelect.addEventListener('change',()=>{retryState=demos.initialSlotRetry(retrySelect.value);renderSlotRetry();});
document.querySelector('#step-slot-retry').addEventListener('click',()=>{retryState=demos.stepSlotRetry(retryState);renderSlotRetry();feedback('#slot-retry-log, #slot-retry-status');});
document.querySelector('#reset-slot-retry').addEventListener('click',()=>{retryState=demos.initialSlotRetry(retrySelect.value);renderSlotRetry();document.querySelector('#slot-retry-status').textContent='선택한 시나리오를 초기화했습니다. 첫 트랜잭션부터 다시 실행할 수 있습니다.';});
// Expand a linked disclosure before native anchor navigation, including deep links.
function revealHash(hash,scroll=false){
 let id;
 try{id=decodeURIComponent(hash.slice(1));}catch{return;}
 if(!id)return;
 const target=document.getElementById(id);
 if(!target)return;
 let node=target,opened=false;
 while(node){
  if(node instanceof HTMLDetailsElement&&!node.open){node.open=true;opened=true;}
  node=node.parentElement;
 }
 if(opened&&scroll)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
}
for(const link of document.querySelectorAll('a[href^="#"]'))link.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 revealHash(link.hash);
});
window.addEventListener('hashchange',()=>revealHash(window.location.hash,true));
revealHash(window.location.hash,true);

// Printing includes every disclosure; duplicate print events keep the first snapshot.
let printDetails=null;
function preparePrint(){
 if(printDetails)return;
 printDetails=[...document.querySelectorAll('details')].map(detail=>[detail,detail.open]);
 for(const [detail] of printDetails)detail.open=true;
}
function restoreAfterPrint(){
 if(!printDetails)return;
 for(const [detail,wasOpen] of printDetails)detail.open=wasOpen;
 printDetails=null;
}
window.addEventListener('beforeprint',preparePrint);
window.addEventListener('afterprint',restoreAfterPrint);
const printMedia=window.matchMedia('print');
printMedia.addEventListener('change',event=>event.matches?preparePrint():restoreAfterPrint());
