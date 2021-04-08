function timedCount()
{
postMessage(0);
setTimeout("timedCount()",100);
}

timedCount();