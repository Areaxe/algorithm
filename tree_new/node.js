function Tree (canvas, ctx, opt = {}) {
  this.ctx = ctx;
  this.canvas = canvas;
  this.origin = {  // 初始化源点位置
    x: opt.originX || 30,
    y: opt.originY || 60,
    deep: 1
  };
  this.theme = opt.theme || '#409EFF'
  this.titleColor = opt.titleColor || '#fff'
  this.gridColor = opt.gridColor || '#ddd' // 网格线颜色
  this.contentColor = opt.contentColor || '#666'
  this.deepHeight = new Map()
}
Tree.prototype = {
  render (node) {
    // 根据节点渲染的范围，重置画布宽高
    let contentHeight = this.origin.y + node.realHeight + node.height;
    this.canvas.height = Math.max(contentHeight, document.body.offsetHeight);
    this.renderBg(); // 绘制网格线
    this.renderNode(node)  // 绘制节点
    // let maxHeight = 0;
    // for (let value of this.deepHeight.values()) {
    //   maxHeight = Math.max(value, maxHeight)
    // }
    // this.canvas.height = Math.max(maxHeight, document.body.offsetHeight);
  },
  renderNode (node) {
    if (!node.parent) {  // 如果是根节点，就初始化根节点坐标
      node.x = this.origin.x;
      node.y = this.origin.y;
      node.deep = 1;
    }
    this.createRoundRect(node)  // 绘制节点边框
    this.ctx.beginPath();  // 绘制节点头部
    this.ctx.fillStyle = node.background || this.theme;
    this.ctx.rect(node.x - 1, node.y - 1, node.width + 2, 24);
    this.ctx.fill();
    this.ctx.save();
    // 填充文字
    this.ctx.beginPath();
    this.ctx.fillStyle = node.color || this.titleColor;
    this.ctx.fillText(node.title, node.x + 10, node.y + 16, node.width);
    if (node.content) { // 渲染节点内容
      this.ctx.fillStyle = node.color || this.contentColor;
      this.drawText(node.content, node.x + 10, node.y + 24, node.width - 20)
    }
    this.ctx.save();

    if (node.childs) {
      let curY = this.deepHeight.get(node.deep) || node.y;// 当前元素的Y坐标
      if (node.y - 20 > 0) {  // 计算元素可以上移的位置 待优化
        curY = node.y - 20;
      } else if (node.y - 20 < 0) {
        curY = node.y + 20
      }

      this.deepHeight.set(node.deep, node.y + node.height + node.marginY);
      node.childs.forEach((item) => {
        item.x = node.x + node.width + node.marginX;  // 计算节点的X坐标
        item.deep = node.deep + 1;
        item.y = this.deepHeight.get(item.deep) || curY;  // 节点的Y坐标
        this.renderNode(item)  // 渲染节点

        this.deepHeight.set(item.deep, item.y + item.height + item.marginY);
        node.createArrowTo(this.ctx, item) // 添加箭头

      })



    }
  },
  drawText (text, x, y, w) { // 绘制文字 换行
    var chr = text.split("");
    var temp = "";
    var row = [];

    this.ctx.fillStyle = "black";
    this.ctx.textBaseline = "middle";

    for (var a = 0; a < chr.length; a++) {
      if (this.ctx.measureText(temp).width >= w) {
        row.push(temp);
        temp = "";
      }
      else {
        temp += chr[a];
      }
    }

    row.push(temp);
    for (var b = 0; b < row.length; b++) {
      this.ctx.fillText(row[b], x, y + (b + 1) * 14);
    }
  },
  renderBg () {  // 绘制网格线
    let w = this.canvas.width;
    let h = this.canvas.height;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = this.gridColor
    this.ctx.beginPath();
    let d = 10;
    for (let i = d; i < h; i += d) {
      this.ctx.moveTo(0, i + 0.5);
      this.ctx.lineTo(w, i + 0.5);
      this.ctx.stroke();
      // if (!(i % 3)) {
      //   this.ctx.fillText(i.toString(), 10, i)
      // }
      this.ctx.save();
    }
    for (let i = d; i < w; i += d) {
      this.ctx.moveTo(i + 0.5, 0);
      this.ctx.lineTo(i + 0.5, h);
      this.ctx.stroke();
    }
    this.ctx.save();
  },
  createRoundRect (node) {  // 绘制节点圆角边框
    let ctx = this.ctx;
    let r = 5;
    let { x, y, width, height } = node;
    if (width < 2 * r) { r = width / 2; }
    if (height < 2 * r) { r = height / 2; }
    ctx.beginPath();
    ctx.strokeStyle = '#409EFF';
    ctx.fillStyle = 'white';
    ctx.lineWidth = 1;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.fill();
    ctx.stroke();
    ctx.save();
  },
}

function Node (node, opt = {}) {
  this.childs = [];
  this.width = node.width || opt.width || 130; // 节点宽度
  this.height = node.height || opt.height || 110; // 节点高度
  this.title = node.title // 标题
  this.marginX = node.marginX || opt.marginX || 80; // X间距 向右
  this.marginY = node.marginY || opt.marginY || 20; // Y间距 向下
  this.realHeight = this.height + this.marginY; // 实际占用空间 节点包括子节点占用的高
  this.realWidth = this.width + this.marginX; // 实际占用空间 节点包括子节点占用的宽
  this.childHeight = 0; // 子孙节点高度  目前没用到
  this.childWidth = 0; // 子孙节点宽度  目前没用到
  this.content = node.content;
  if (node.childs) {  // 如果有子数据，则创建子节点
    node.childs.forEach(item => {
      if (item) {
        this.appendChild(new Node(item, { ...opt }))
      }
    })
  }
}

Node.prototype = {
  appendChild (node) {
    this.childHeight = this.childHeight + node.height + node.marginY; // 子元素的宽度 =  历史子元素高度 + 新节点的高度 + 新节点的Y方向的间距
    this.childWidth = Math.max(this.childWidth, node.width) + this.marginX; // 子元素宽度 = 当前子节点宽度 + 子节点Y方向的间距
    this.childs.push(node)
    let h = 0, w = 0;
    this.childs.forEach(item => {
      h += item.realHeight
      w += item.realWidth
    });
    this.realHeight = h; // 当前节点实际所占用的空间 = 子节点实际占用空间之和
    this.realWidth = w;
    node.parent = this; // 新增节点的父节点指向当前节点
  },

  createArrowTo (ctx, node) {  // 创建箭头指向
    // 从当前节点出发，到目标节点 // 目前只有指向右的索引
    let [beginX, beginY, endX, endY] = [this.x + this.width, this.y + this.height / 2, node.x, node.y + node.height / 2]
    ctx.moveTo(beginX, beginY);
    let { cpx, cpy, cpx1, cpy1, } = this.computedBesaier(beginX, beginY, endX, endY);  // 获取贝塞尔锚点
    ctx.bezierCurveTo(cpx, cpy, cpx1, cpy1, endX, endY);
    ctx.stroke();
    this.drawArrow(ctx, endX, endY) // 绘制箭头 不会，用圆点代替
  },

  drawArrow (ctx, endX, endY) {  // 绘制圆点
    ctx.beginPath();
    ctx.fillStyle = '#409EFF'
    ctx.arc(endX, endY, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.save();
  },
  // 注意： js中的y坐标与数学上的y坐标是反向的
  computedBesaier: function (beginX, beginY, endX, endY) {  // 计算贝塞尔曲线
    //beginX  起点X
    //beginY  起点Y
    //endX 结束点X
    //endY  结束点Y
    if (beginX > endX) {
      cpx = (beginX + endX) / 2
    } else if (beginX < endX) {
      cpx = (endX + beginX) / 2
    } else {
      cpx = (endX + beginX) / 2
    }
    if (beginY > endY) {
      cpy = (endY * 2 - beginY)
    } else if (beginY < endY) {
      cpy = (2 * endY - beginY)
    } else {
      cpy = (endY + beginY) / 2
    }
    return {
      cpx: (beginX + endX) / 2,
      cpy: beginY,
      cpx1: (beginX + endX) / 2,
      cpy1: endY,
    }
  },
}