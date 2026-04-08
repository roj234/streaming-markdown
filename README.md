# FastMD - Fast incremental renderer for LLMs' markdown
- 修改自 https://github.com/thetarnav/streaming-markdown

## 优点
- **允许对用户消息关闭折叠换行**  
  -  不需要恼人的两个空格了
- **真正的增量渲染** - 尽管公式和语法高亮不是
  - 我对它们使用 morphdom
- **正确加粗/斜体下面的字符串**，它们经常出现在LLM的中文回复中
  - 这就是**“我得到吨”**与商业**“比比拉布”**的典型差异。
  - 这就是*开源“我得到吨”*与**商业“比比拉布”**的典型差异。
  - 目前没有常见（我能找到）的解析库支持，因为不符合所谓的`CommonMark规范`
- **100% 抗 XSS 攻击**
  - 直接设置 `textContent`
  - 唯一的元素白名单是 &lt;br /&gt;
- **100% 抗 ReDoS 攻击**
  - 正则表达式唯一的用途是匹配同类字符，如 `/\p{P}/u`
  - 剩余部分均为人类勉强能维护的复杂状态机
- **体积小巧**
  - 打包后体积比 marked 小30KB左右

### 修复原项目的bug
- 不再使用定长数组，虽然原有的24容量大概也永远不会溢出
- 修复了LaTex表达式解析和美元符号或非标准格式冲突的corner case
  - 例如：苹果卖 $100, 但是橘子卖 $200
- 修复部分行内代码块解析错乱的问题
  - `\n ```abc `
  - `` x ``
  - ` ` (仍然有问题：空格被trim了)
- 但不包括这些本身就不是那么合法的？
  - ``a` (显示为 &lt;code&gt;a&#96;&lt;/code&gt;)
  - `` (大问题)
- 修复了image没有title的问题
- 支持开关折叠换行
-  _这种斜体_ 必须left prefix, right postfix是空白，而left postfix和right prefix不是
- 加入了token回退函数，这允许撤回最终被发现是 incomplete 的贪婪匹配，例如
  - 正则表达式而不是链接/图片： /[abc](/
- 其它很多改动

### 增加的新功能
- 比起原项目额外支持的特性如下
  - 表格对齐（以及嵌套列表项）

    ```
    emb ode
    ```

  | Left Align | Center Align | Right Align |
    |:---|:---:|---:|
  | Text 1 | Text 2 | Text 3 |
  | Text A | Text B | Text C |

  > 列表嵌套目前还有一些bug，不过至少**部分支持**了
> 表格对齐完全支持
>> aaaa
> > > bbbb

- 自定义代码块渲染器
  - 貌似不在这个项目里，反正可以实现

## 缺点
- 针对LLM会生成而人类不一定会写的markdown格式优化
- 不支持CommonMark规范
- 没有生成HTML字符串的默认渲染器实现
- 没有文档

### 不支持部分markdown特性（LLM基本上不会用）
- - 单行嵌套列表 （如这行）
- 除BR外（non-void）的HTML标签（你就饶了手写状态机吧）
- 引用链接 [link][ref]

[ref]: http://example.com

### 有这么多问题我怎么还提枪上马直接把marked和markdown-it换掉了？
- ~~Kick UziTech's ass! How dare you close my issue as not planned?~~
- 你行你上。我一直说，我上我真行，不是吗？

## 使用方法
1. 编写一个渲染器，你可以参考[我的实现](https://github.com/roj234/aichat/blob/main/src/fastmd-renderer.js)
2. 参考用法：
   ```js
   import {FastMDParser} from 'better-marked';
   const renderer = new HTMLRenderer(container, options);
   const parser = new FastMDParser(renderer);
   parser.write("# Hell");
   parser.write("o world\n- New render");
   parser.write("er");
   // 生成完毕之后调用 end
   parser.end();
   ```
