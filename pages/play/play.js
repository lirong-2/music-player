Page({
   data:{
     jd:0,
     scrollTop:0,
     lineNum:0//歌词行号
        },
 onLoad:function(options){
   const mid = options.id;//  接收从播放页面传过来的音乐id
   this.ids=options.ids.split(",");        //获取包含所有音乐的id数组
    this.setData({id:mid});
    // 根据当前的音乐id获取此音乐的详细信息
    wx.request({
      url: 'https://music.163.com/api/song/detail?id='+mid+'&ids=['+mid+']',
      success:this.playmusic.bind(this)
    });
      // 显示歌词
      this.getlrc(mid);
    },
    playmusic:function(res){
         var song=res.data.songs[0];
         this.setData({song:song});
        this.player = wx.createInnerAudioContext();//设置播放器
      // 将当前的音乐url设置给播放器
        this.player.src = "https://music.163.com/song/media/outer/url?id="+this.data.id;
      // 让播放器进入播放状态
       this.player.play();//让音乐播放
       this.setData({ state: "play" });//用于记录音乐播放器状态
       this.player.onTimeUpdate(this.changetime);//如果播放器时间发生变化,就会执行changtime方法
    },
  changetime:function(){
      //  获取播放器的当前时间
      var playtime=this.player.currentTime;
    if(this.data.lineNum>4){
      this.setData({
        scrollTop:(this.data.lineNum-4)*35
      });
    }
    //遍历所有歌词
    if(this.data.sws.length>0){
       var arr=this.data.sws;
        for(var i=0;i<arr.length;i++){
          if(playtime>=arr[i][0]&&playtime<arr[i+1][0]){
            this.setData({lineNum:i});
            break;
          }
        }
    }
  },
    xuanzhuan:function(){
      if(this.data.state=="play"){
      this.setData({jd:this.data.jd+1});
      }
      setTimeout("xuanzhuan()",10);
    },
   onUnload:function(){
     this.player.pause();//退出播放页面时音乐暂停
   },
  //  音乐中间播放按钮控制播放和暂停
  playorpause:function(){
    if(this.data.state=="play"){
      this.player.pause();
      this.setData({state:'pause'});
    }
    else{
      this.player.play();
      this.setData({state:'play'});
    }
  },
  playnext:function(){
    // 获取当前音乐id
   var currentId=this.data.song.id;
  //  获取当前播放音乐的索引
  var currentIndex=0;
  for(var i=0;i<this.ids.length;i++){
    if(currentId==this.ids[i]){
      currentIndex=i;
      break;
    }
  }
  //  获取下一首音乐id位置
       var nextIndex=currentIndex==this.ids.length-1? 0:currentIndex+1;
  //  获取下一首音乐的id
       const nextId= this.ids[nextIndex];

       wx.request({
         url: 'https://music.163.com/api/song/detail?id='+nextId+'&ids=['+nextId+']',
         success:this.playing.bind(this)//当获取下一首音乐之后，调用playing方法播放下一首音乐
       });
  },
  playing:function(res){
    // console.log(res.data);
    var song=res.data.songs[0];//获取上/下一首音乐详细信息
    // 将上/下一首歌设为正在播放
    this.setData({song:song});
  //  让播放器也播放上/下一首歌
    this.player.src ='https://music.163.com/song/media/outer/url?id='+this.data.song.id;
    this.player.play();
    this.setData({state:'play'});
    // 切换上一曲或者下一曲，歌词要重新获取
   this.getlrc(this.data.song.id);
    // 歌词滚动和歌词行号都要指令
    this.setData({
      scrollTop:0,
      lineNum:0
    });
  },
  playpast:function(){
    var currentId=this.data.song.id;//获取当前音乐id
    var currentIndex=0;//获取当前音乐播放索引
    for(var i=0;i<this.ids.length;i++){
      if(currentId==this.ids[i]){
        currentIndex=i;
        break;
      }
    }
       var pastIndex=currentIndex==0? this.ids.length-1:currentIndex-1;
       const pastId=this.ids[pastIndex];
    wx.request({
      url: 'https://music.163.com/api/song/detail?id=' + pastId + '&ids=[' + pastId + ']',
      success: this.playing.bind(this)//当获取上一首音乐之后，调用playing方法播放下一首音乐
    });
  },
getlrc:function(mid){
  // 根据音乐id查询歌词
  wx.request({
    url: 'https://music.163.com/api/song/lyric?tv=-1&lv=-1&id='+mid,
    success:this.showlrc.bind(this)
  });
},
  showlrc:function(res){
    // 获取歌词信息
    var lrc=res.data.lrc.lyric;
   
    // 解析歌词
    var lrcArr = lrc.split("\n");
    if(lrcArr[lrcArr.length-1]==""){
           lrcArr.pop();
    }

    // 定义一个数组进行存放解析数据
    //  进行格式转换
    var result=[];
    var pattern=/\[\d{2}:\d{2}\.\d{2,3}\]/;
    for(var i=0;i<lrcArr.length;i++){
        var str=lrcArr[i];//时间和歌词
        var time = str.match(pattern);//时间
         if(time!=null){
        var songword=str.replace(pattern,"");//歌词
        // 转换时间为秒
        var timeslice=time[0].slice(1,-1);
        var timeArray=timeslice.split(":");
        var m = timeArray[0];
        var s = timeArray[1];
        var t=parseFloat(m)*60+parseFloat(s);
        result.push([t,songword]);
         }
      }
      this.setData({sws:result});
  }
  
})