async function login(b){await busy(b,async()=>{const m=$('#l-mobile').value.trim(),p=$('#l-pass').value;
if(!m||!p)return toast('Enter mobile number and password.');
const{data,error}=await sb.from('users').select(SAFE).eq('mobile',m).eq('password',p).maybeSingle();
if(error)return toast('Server error: '+error.message);if(!data)return toast('Invalid mobile number or password.');
if(!data.is_active)return toast('Your account is currently inactive. Please contact admin.');
setUser(data);if(data.role==='admin')location.href='admin.html';else if(data.role==='sub_admin')location.href='sub-admin.html';else enterApp()})}
async function register(b){await busy(b,async()=>{const f=n=>$('#r-'+n).value.trim();const name=f('name'),mobile=f('mobile'),pw=$('#r-pass').value,ref=f('ref');
if(!name||!/^\d{10}$/.test(mobile)||pw.length<4)return toast('Enter name, a 10-digit mobile and password (min 4).');
if(pw!==$('#r-pass2').value)return toast('Passwords do not match.');
if(ref){const{data}=await sb.from('referral_codes').select('id').eq('code',ref).eq('is_active',true).maybeSingle();if(!data)return toast('Invalid referral code.')}
const{error}=await sb.from('users').insert({name,mobile,email:f('email')||null,password:pw,role:'user',ssc_gd_premium:false,is_active:true,referral_code_used:ref||null});
if(error)return toast(error.code==='23505'?'This mobile number is already registered.':'Registration failed: '+error.message);
toast('Account created. Please login.');showSection('login')})}
function logout(){sessionStorage.removeItem('ssc_user');if($('#s-home')){TE.stop&&TE.stop();document.body.classList.remove('in');showSection('home')}else location.replace('index.html')}
async function guard(role){const u=getUser();if(!u||u.role!==role){location.replace('index.html');return null}
const{data}=await sb.from('users').select(SAFE).eq('id',u.id).maybeSingle();if(!data||!data.is_active||data.role!==role){sessionStorage.removeItem('ssc_user');location.replace('index.html');return null}return data}
