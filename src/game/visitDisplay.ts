export class visitDisplay{
    
    
    public static caution: boolean = false;
    
    
    
    public static setCookie(name:any,value:any,expires:any,path?:any,domain?:any,secure?:any) 
    {
        let curCookie=name+"="+escape(value) +
        ((expires)?";expires="+expires.toGMTString() : "") +
        ((path)?"; path=" + path : "") +
        ((domain)? "; domain=" + domain : "") +
        ((secure)?";secure" : "")
        if(!this.caution||(name + "=" + escape(value)).length <= 4000)
        {
            document.cookie = curCookie
          }
            else if(confirm("Cookie exceeds 4KB and will be cut!"))
        {
            document.cookie = curCookie
          }
  }
  
  
  public static getCookie(name:any) :any
  {
      let prefix = name + "="
      let cookieStartIndex = document.cookie.indexOf(prefix)
      if (cookieStartIndex == -1)
      {
          return null
        }    
      let cookieEndIndex=document.cookie.indexOf(";",cookieStartIndex+prefix.length)
      if(cookieEndIndex == -1)
      {
          cookieEndIndex = document.cookie.length
       }
      return unescape(document.cookie.substring(cookieStartIndex+prefix.length,cookieEndIndex))
  }
  
  
  public static deleteCookie(name:any, path:any, domain:any) 
  {
    if(visitDisplay.getCookie(name)) 
    {
      document.cookie = name + "=" + 
      ((path) ? "; path=" + path : "") +
      ((domain) ? "; domain=" + domain : "") +"; expires=Thu, 01-Jan-70 00:00:01 GMT"
     }
  }
  public static fixDate(date:any) 
  {
    let base=new Date(0)
    let skew=base.getTime()
    if(skew>0)
    {
      date.setTime(date.getTime()-skew)
    }    
  }
}