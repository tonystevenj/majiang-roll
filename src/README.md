# 游戏规则

## 游戏开始

### Input:
* `Integer total`: 输家总共输了多少, 作为总奖金池 
    * (例子: Y玩家输了 60)
* `List<Integer> winners`: 各位赢家输入自己的数字
    *  (W,L,S玩家分别赢了 10, 20, 30)
* `function mapping(int orgNumber, float diff)` : 由游戏模式决定, 输入是 `本来赢得钱` 和偏差 `diff`
    *  (选激进模式: 0.05 -> ±10%; 0.1-> ±30%, 0.2-> ±100%, 0.4-> ±400%, 0.49-> ±900%)


每个选手来抽奖, 做如下计算:
1. 生成一个 0-1 的正态分布数 α
2. 用最初各自本来该赢的钱作为底, 乘以roll出来的随机数 `diff = α-0.5` 的映射系数 (由游戏模式决定)

用这个例子: 

    Y玩家输了 60
    W,L,S玩家分别赢了 10, 20, 30
W, 来roll点:
* 如果roll到 0.5, 系数就是 1, 拿10块走
* 如果roll到0.7, 那么 `diff = 0.7 - 0.5 = 0.2`, 因为 `0.2-> ±100%`, 所以这个人如果赢了 10 块, 那么就赢20.
* 如果roll到0.3, 那么 `diff = 0.3 - 0.5 = -0.2`, 因为 `0.2-> ±100%`, 那么这个人就是 `10-10=0`就一分没有.
* 如果roll到0.9, 那么 `diff = 0.9 - 0.5 = 0.4`, 因为 `0.4-> ±400%`, 那么这个人就是 `10+40=50`.
* 如果roll到0.1, 那么 `diff = 0.1 - 0.5 = -0.4`, 因为 `0.4-> ±400%`, 那么这个人就是 `10-40=-30`, 贴30出来到池子里.

分析: 不管W结果如何, 他赚赔概率是一样的, 赚赔比例是一样的, 而且根拒正太分布, 大概率是`±100%`. 然后他完事之后, 剩下两个人再按各自比例, 分配到相应的base number, 继续玩这个游戏.

如果W玩家roll了 `0.01`, `0.49-> ±900%`, 倒给80块, 那么池子剩下 140, L,S 玩家的池子就是按比例分配, `20:30 = 2:3`, `L=56`, `S=84`, 他两再来玩 (基本上是一个人60 一个人90)
如果W玩家roll了 `0.99`, 带走100块, 那么池子剩下 -40, L,S 玩家的池子就是按比例分配, 也是 `20:30 = 2:3`, `L=-16`, `S=-24`, 他两再来玩 (基本上是一个人倒给16 一个人倒给24, 但是第二个roll的人也有可能让最后一个人雪上加霜)


## Note:
每次选手抽奖设计为独立事件, 由此来保证公平性.

为了鼓励先抽奖, 如遇小数结果用`round_ceil`处理

