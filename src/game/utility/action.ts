export class action0
{
    private _value:Array<()=>void>=new Array();

    public add(act:()=>void)
    {
        this._value.push(act);
    }

    public run()
    {
        for(let i=0;i<this._value.length;i++)
        {
            this._value[i]();
        }
    }

    public remove(act:()=>void)
    {
        let index=this._value.indexOf(act);
        if(index>-1)
        {
            this._value.splice(index,1);
        }
    }

    public get count()
    {
        return this._value.length;
    }
}
export class action1<T>
{
    private _value:Array<(action:T)=>void>=new Array();

    public add(act:(action:T)=>void)
    {
        this._value.push(act);
    }

    public run(action:T)
    {
        for(let i=0;i<this._value.length;i++)
        {
            this._value[i](action);
        }
    }

    public remove(act:(action:T)=>void)
    {
        let index=this._value.indexOf(act);
        if(index>-1)
        {
            this._value.splice(index,1);
        }
    }

    public get count()
    {
        return this._value.length;
    }
}

export class action2<K,V>
{
    private _value:Array<(act1:K,act2:V)=>void>=new Array();

    public add(act:(act1:K,act2:V)=>void)
    {
        this._value.push(act);
    }

    public run(act1:K,act2:V)
    {
        for(let i=0;i<this._value.length;i++)
        {
            this._value[i](act1,act2);
        }
    }

    public remove(act:(act1:K,act2:V)=>void)
    {
        let index=this._value.indexOf(act);
        if(index>-1)
        {
            this._value.splice(index,1);
        }
    }
    
    public get count()
    {
        return this._value.length;
    }
}