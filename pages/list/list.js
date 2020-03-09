Page({
  data:{
    imgurls:[
      '../../images/dl.jpg',
      '../../images/lyf.jpg',
      '../../images/yy.jpg',
      '../../images/sy.jpg'
    ],
  },
  gotoPlay: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({//跳转到play界面
      url: '../play/play?id='+ id+'&ids='+this.ids//在播放按钮时同时接收所有音乐id的数组
    });

  },
  onShareAppMessage:function(){//分享页面
    return{
      title:'CT云音乐',
      url:'pages/list/list'
    }
  },
  recordpassword:function(e){
      this.kw=e.detail.value;//当在输入框输入就会调用此方法
  },
  dosearch:function(){
        wx.request({
          // 在播放按钮将所有音乐id数组传到页面
          url: 'https://music.163.com/api/search/get?s='+this.kw+'&type=1&limit=10',
          success:this.getSongs.bind(this)
        })
  },
  getSongs:function(res){
          var arr=res.data.result.songs;
          this.setData({songs:arr})//将音乐信息设置到data中
          this.ids= new Array();//改为this将所有音乐信息定义为全局
          this.picUrls=new Array();
          this.index=0;
          for(var i=0;i<arr.length;i++){
            const mid = arr[i].id;
              this.ids[i]=mid;
              wx.request({
                url: 'https://music.163.com/api/song/detail?id=' + mid + '&ids=[' + mid +']',
                success:this.getUrl.bind(this)
              });
          }
  },
  getUrl:function(res){
    var song = res.data.songs[0];
    var picUrl=song.album.picUrl;
    this.picUrls[this.index]=picUrl;
    this.index=this.index+1;
    this.setData({albumPicUrls:this.picUrls});
  },
  onLoad:function(){
    var kwArr=new Array();
    kwArr[0]='张韶涵';
    kwArr[1]='李荣浩';
    kwArr[2]='张杰';
    kwArr[3]='张靓颖';
    kwArr[4]='张艺兴';
    kwArr[5]='薛之谦';
    var i=Math.random()*kwArr.length;
    var j=Math.floor(i);
    this.kw=kwArr[j];
    this.dosearch();
  }
})