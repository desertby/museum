import {qsPost} from './axios';

// login
export const userLogin = data => qsPost('https://utp.veryengine.cn/User/Login', data);

export const registerCaptcha=data=>qsPost('https://utp.veryengine.cn/User/Captcha',data);

export const userRegister=data=>qsPost('https://utp.veryengine.cn/User/TelRegister',data);

export const userReregister=data=>qsPost('https://utp.veryengine.cn/User/ReRegister',data);

export const userFindpwd=data=>qsPost('https://utp.veryengine.cn/User/FindPwd',data);

export const BindPersonTag=(data)=>qsPost('https://utp.veryengine.cn/Tag/BindPersonTag',data);
export const queryPersonTag=(data)=>qsPost('https://utp.veryengine.cn/Tag/queryPersonTag',data);