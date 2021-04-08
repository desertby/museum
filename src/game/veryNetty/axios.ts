import axios from 'axios';
import Qs from 'qs';

// import { getToken } from '@/utils/auth';

// 创建axios实例
const instance = axios.create({
	baseURL: 'https://utp.veryengine.cn/',
	withCredentials : true,
	timeout: 5000, // 请求超过5秒即超时返回错误
	//headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
	headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
});
// axios.defaults.withCredentials = true
// request拦截器 如果是jwt，可以默认加token
instance.interceptors.response.use(
	response => {
		if (response.data.code) {
			if (response.data.code === '99998') {
				return Promise.reject(response.data.message);
			}
		}
		return response;
	},
	error => {
		// 默认除了2XX之外的都是错误的，就会走这里
		console.log(`错误：${error}`);
		if (error.response) {
			switch (error.response.status) {
				case 401:
					console.log(`401: ${error.response.status}`);
					break;
				default:
					console.log(`error返回: ${error.response.status}`);
			}
		}
		return Promise.reject(error.response);
	}
);
export const qsPost=(url,data={})=>instance.post(url,Qs.stringify(data,{arrayFormat:'brackets'}),{headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}});
export const qsListPost=(url,data={})=>instance.post(url,Qs.stringify(data,{ arrayFormat: 'repeat' }),{headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}});
export const getBlob=(url)=>axios.get(url,{responseType:'blob'});
export const jsonPost=(url,data)=>instance.post(url,JSON.stringify(data),{headers:{ 'Content-Type': 'application/json;charset=UTF-8'}});


