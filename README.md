# package安装依赖
## 指定package安装依赖

```shell
# 推荐
$ lerna add lodash packages/module-1
# 或者
$ lerna add lodash --scope=module-1
# 或者
$ lerna add lodash **/module-1
# 或者
$ yarn workspace module-1 add lodash
```

## 给所有的package安装依赖

```shell
$ lerna add lodash
```

## workspace之间安装依赖

```shell
$ lerna add module-2 --scope module-1
# 或者
$ lerna add module-2 packages/module-1
```

## 清除依赖(全局)

```shell
yarn clean
```

## 项目启动

本项目使用yarn做workspace隔离, 因此必须使用yarn

1. 创建mp文件夹
2. 在mp中拉取git子模块
3. 安装依赖


```shell
# 安装yarn

# 安装lerna, 若存在则不需要

# 全局安装lerna
yarn global add lerna

mkdir mp

# 到此处克隆子模块
cd ./mp

# 退到最外层
cd ../../

# 安装依赖（并全局链接）
yarn bootstrap
```

4. 启动ui库

```shell
# 进入components目录下
cd components

# 开发调试(其实也是在不停的构建)(二选一)
yarn serve

# 打包构建(均可)
yarn build
```

5. 启动项目

```shell
# 进入mp下任意项目目录(如此处的e_dy_fe)
cd ./mp/e_dy_fe

# 启动项目
yarn dev:mp-xxx

# 或自定义修改 build命令
```

## monorepo项目目录说明
`.`

`├── ./husky                       # husky命令路径`

`├── ./components                  # @xiaoe/uni-ui开发路径(此包不发布)`

`│   ├── ./build                   # ui组件库核心构建脚本`

`│   ├── ./docs                    # ui组件库文档`

`│   ├── ./package                 # ui组件库发包文件夹`

`│   ├── ./temps                   # 使用示例(后续完善后补充)`

`│   ├── ./uni_modules             # 开发文件(uni_modules规范)`

`│   ├── ./gulpfile.js             # 构建命令`

`│   └── ./package.json            # 依赖配置文件`

`├── ./modules                     # 业务模块根路径`

`├── ./mp/*                        # 项目路径(独立项目)`

`├── ./typings                     # ts声明文件`

`├── ./eslintrc.js                 # eslint配置文件`

`├── ./tsconfig.json               # ts配置文件`

`├── ./package.json                # monorepo项目配置`

`└── ./lerna.json                  # lerna配置(需配合package.json)`

## 本地链接方式

1. 使用bootstrap命令全局链接
2. 使用局部依赖安装命令实现单一模块链接

## 发包

关于发包使用ci自动发包

## 创建模块

1. 命令创建: `lerna create xxx`
2. 自动创建后添加配置

## vue3/2兼容性处理

模块编写的时候使用vue2语法, 但需要注意vue3不支持的api

### 兼容性

1. `filter`过滤器废弃
2. `$parent`、 `$children`废弃
3. `vm.$attrs` 包含了`$listeners`的功能
4. `vm.$scopedSlots`废弃, 关于插槽, 在使用时, 必须使用`v-slot`指令
5. `vm.$listeners`废弃
6. `vm.$set`废弃
7. `vm.$delete`废弃
8. `vm.$on`、`vm.$once`、 `vm.$off` 废弃(vue不支持enventBus, 如需使用需手写发布订阅器)
9. `vm.$mount`废弃
10. `vm.$destroy`废弃
11. `v-bind`指令去除.prop、.sync、.camel
12. 关于`v-model`, 可以继续使用vue2的语法
13. `v-for`内部使用ref不会自动创建数组, 需要如下方式, 同时循环时, key要放在template上, 但是疑似可以继续使用(我们可以试试)
14. 组件接收事件需要显示声明, 如 `emits: ['change]` 声明一个chang事件


```js
const template = `<div v-for="item in list" :ref="setItemRef"></div>`
setItemRef(el) {
  this.itemRefs.push(el)
}
```
## 分包控制(此处需要注意)

模块加载必然会导致主包过大的问题, 因此除必要页面应全部使用分包


## lerna配置说明

lerna.json

```json
{
    // 配置哪些属于被lerna管理的模块所在的位置
  "packages": [
    "modules/*", // 表示modules下面每一个文件夹都是一个独立的库
    "components/packages", // 表示components下的packages是一个被lerna管理的库
    "mp/*"
  ],
  "version": "independent", // 表示各个库的版本独立, 不使用统一的版本号发包
  "command": {
    "create": {
        // 标注代码仓库地址
      "homepage": "https://talkcheap.xiaoeknow.com/helpstudy/e_uni_monorepo_fe",
      // 协议规范
      "license": "MIT",
      // npm发包地址
      "registry": "http://localhost:4873"
    },
    "publish": {
        // 发包忽略的文件(如果某一次版本发布不想发其中某个包, 可以加入其中在发包)
        // 同时忽略包的package.json中必须配置 "private": true
      "ignoreChanges": ["ignored-file", "*.md", "mp/*"],
      "message": "chore(release): publish",
      // npm发包地址
      "registry": "http://localhost:4873"
    },
    // * hoist提升说明: 如果两个模块下有相同的库, 那么这个库不会被提升, 比如一个vue2.6, 一个vue3.2, 那么这个vue, 会保留在项目路径下, 而不是monorepo的路径下
    "bootstrap": {
        // * 使用bootstrap命令安装时需要忽略的文件夹(官方文档说明如此, 但是仅仅使用此配置没有意义, 还需要在对应的包的package.json中加上private: true。当然, 这样做了之后, 其实还是不会被忽略, 也许是bug?)
      "ignore": "uni-*",
      "npmClientArgs": ["--no-package-lock"]
    },
    "version": {
    // 允许发包的git分支名
      "allowBranch": [
        "master",
        "release/*",
        "develop",
        "feature/*"
      ]
    }
  },
  // 配置yarn做workspace隔离
  "npmClient": "yarn",
  "useWorkspaces": true
}
```

package.json

```json
{
    // monorepo整个库的名字
  "name": "uni-repo",
  // 必须标识为私有库, 这样才能发到私有域名下
  "private": true,
  "scripts": {
    "dev": "yarn run clean:build && yarn run bootstrap",
    "add": "lerna add",
    "bootstrap": "lerna bootstrap --nohoist 'uni-*' --ignore 'uni-*'",
    "build": "yarn clean:build && yarn build:stream",
    "build:stream": "lerna run build --stream --ignore @xiaoe-*",
    "build:modules": "yarn clean:build && lerna run build --stream --ignore e_*",
    "changed": "lerna changed",
    "clean": "lerna clean && rm -rf node_modules",
    "clean:build": "lerna run clean",
    "create": "lerna create",
    "lint": "eslint --ext .js,.vue",
    "publish:package": "lerna version --no-private --force-publish --yes && lerna publish from-package",
    "test": "lerna run test",
    "import": "lerna import"
  },
  "devDependencies": {
    "husky": "^7.0.4",
    "stylelint": "^13.9.0",
    "lerna": "^3.22.1",
    "prettier": "^2.0.5"
  },
  "license": "MIT",
  "dependencies": {
    "typescript": "^4.5.2",
    "node-sass": "^7.0.1"
  },
  // 工作区配置
  "workspaces": {
  // 和lerna.json保持统一
    "packages": [
      "modules/*",
      "components/packages",
      "mp/*"
    ],
    // 这里才是重点, lerna中bootstrap下的ignore配置不起作用, 但是在这里配置不需要提升的依赖, 这样需要直接安装到项目中的依赖就不会被提升到全局。(uni-app查找直接使用的库, 如果node_modules下的库不在当前模块的根路径下, 会报错, 因此要使用的ui库, 模块库等, 不能提升到全局)
    // 正常情况下, 模块专用的依赖, 不必提升到全局中
    "nohoist": [
      "**/@ltestrepo/**",
      "**/@dcloudio/**",
      "**/gulp",
      "**/gulp-*"
    ]
  },
  // 配置husky
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  // js校验, 配合husky
  "lint-staged": {
    "**/*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix",
      "git add"
    ],
      // style校验， 同样配合husky
    "**/*.{css,scss}": [
      "stylelint --fix"
    ]
  }
}
```


6. 处理 组件中未知的 ts 报错
   + 1.cd components
   + 2.`yarn install` 
   + 3.`rm -rf ./components/packages/node_modules`
   + 4.重启
   + 原因: @xiaoe/uni-ui本地链接时走入了 components/node_modules 或者 components/packages/node_modules, 应该让他们走项目本身的node_modules

> 注意: 非必要情况禁止提交配置文件！
