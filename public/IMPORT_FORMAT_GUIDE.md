# 📥 导入格式说明文档

## 🎯 概述

题库管理系统支持三种文件格式的题目导入：**HTML**、**XML** 和 **TXT**。每种格式都有特定的结构要求，以确保系统能够正确识别和解析题目内容。

## 📋 支持的格式

### 1. **HTML 格式** (.html)
- 使用HTML标签结构
- 支持复杂的题目格式
- 适合包含富文本内容的题目

### 2. **XML 格式** (.xml)
- 使用XML标签结构
- 标准化的数据格式
- 适合批量导入

### 3. **TXT 格式** (.txt)
- 纯文本格式
- 简单的标记语法
- 适合快速导入

## 📝 格式详细说明

### 🔤 HTML 格式要求

#### 基本结构
```html
<question>
    <title>题目标题</title>
    <content>题目内容</content>
    <type>题目类型</type>
    <subject>学科</subject>
    <difficulty>难度</difficulty>
    <options>
        <option correct="true">正确答案</option>
        <option correct="false">错误选项1</option>
        <option correct="false">错误选项2</option>
        <option correct="false">错误选项3</option>
    </options>
    <correctAnswer>正确答案文本</correctAnswer>
    <programmingLanguage>编程语言</programmingLanguage>
    <testCases>
        <testCase>
            <input>输入值</input>
            <expectedOutput>期望输出</expectedOutput>
            <description>测试描述</description>
        </testCase>
    </testCases>
    <tags>标签1,标签2,标签3</tags>
</question>
```

#### 必填字段
- `title`: 题目标题
- `content`: 题目内容
- `type`: 题目类型 (multiple_choice, true_false, short_answer, programming, essay)
- `subject`: 学科名称
- `difficulty`: 难度级别 (easy, medium, hard)

#### 可选字段
- `options`: 选择题选项（仅选择题需要）
- `correctAnswer`: 正确答案（简答题和论述题需要）
- `programmingLanguage`: 编程语言（编程题需要）
- `testCases`: 测试用例（编程题需要）
- `tags`: 标签（逗号分隔）

#### 完整示例
```html
<question>
    <title>JavaScript变量声明</title>
    <content>在JavaScript中，使用let关键字声明的变量具有什么特性？</content>
    <type>multiple_choice</type>
    <subject>Computer Science</subject>
    <difficulty>easy</difficulty>
    <options>
        <option correct="true">块级作用域</option>
        <option correct="false">函数作用域</option>
        <option correct="false">全局作用域</option>
        <option correct="false">没有作用域限制</option>
    </options>
    <tags>javascript,variables,ES6,basics</tags>
</question>
```

### 🔤 XML 格式要求

#### 基本结构
```xml
<?xml version="1.0" encoding="UTF-8"?>
<questions>
    <question>
        <title>题目标题</title>
        <content>题目内容</content>
        <type>题目类型</type>
        <subject>学科</subject>
        <difficulty>难度</difficulty>
        <options>
            <option correct="true">正确答案</option>
            <option correct="false">错误选项1</option>
            <option correct="false">错误选项2</option>
            <option correct="false">错误选项3</option>
        </options>
        <correctAnswer>正确答案文本</correctAnswer>
        <programmingLanguage>编程语言</programmingLanguage>
        <testCases>
            <testCase>
                <input>输入值</input>
                <expectedOutput>期望输出</expectedOutput>
                <description>测试描述</description>
            </testCase>
        </testCases>
        <tags>
            <tag>标签1</tag>
            <tag>标签2</tag>
            <tag>标签3</tag>
        </tags>
    </question>
</questions>
```

#### 完整示例
```xml
<?xml version="1.0" encoding="UTF-8"?>
<questions>
    <question>
        <title>Python递归函数</title>
        <content>编写一个Python函数计算阶乘</content>
        <type>programming</type>
        <subject>Computer Science</subject>
        <difficulty>medium</difficulty>
        <programmingLanguage>python</programmingLanguage>
        <testCases>
            <testCase>
                <input>5</input>
                <expectedOutput>120</expectedOutput>
                <description>计算5的阶乘</description>
            </testCase>
            <testCase>
                <input>0</input>
                <expectedOutput>1</expectedOutput>
                <description>计算0的阶乘</description>
            </testCase>
        </testCases>
        <tags>
            <tag>python</tag>
            <tag>recursion</tag>
            <tag>functions</tag>
        </tags>
    </question>
</questions>
```

### 🔤 TXT 格式要求

#### 基本语法
```
Q: 题目标题
A: 题目内容
OPT: 选项1
OPT: 选项2
OPT: 选项3
OPT: 选项4
CORRECT: 正确答案序号
```

#### 字段说明
- `Q:` - 题目标题（必需）
- `A:` - 题目内容（必需）
- `OPT:` - 选择题选项（选择题必需）
- `CORRECT:` - 正确答案序号（选择题必需，从1开始）

#### 完整示例
```
Q: JavaScript变量提升
A: 在JavaScript中，var声明的变量会发生变量提升。以下代码的输出是什么？
console.log(x);
var x = 5;
OPT: 5
OPT: undefined
OPT: 报错
OPT: null
CORRECT: 2
```

## 🎯 题目类型说明

### 1. **选择题 (multiple_choice)**
- 需要 `options` 字段
- 需要 `CORRECT` 标记（TXT格式）
- 支持4个选项

### 2. **判断题 (true_false)**
- 需要 `options` 字段
- 只有两个选项：True/False

### 3. **简答题 (short_answer)**
- 需要 `correctAnswer` 字段
- 不需要选项

### 4. **编程题 (programming)**
- 需要 `programmingLanguage` 字段
- 需要 `testCases` 字段
- 支持Java和Python

### 5. **论述题 (essay)**
- 需要 `correctAnswer` 字段
- 不需要选项

## ⚠️ 重要注意事项

### 1. **编码格式**
- 所有文件必须使用 **UTF-8** 编码
- 确保中文字符正确显示

### 2. **必填字段**
- 每个题目都必须包含：title, content, type, subject, difficulty
- 根据题目类型填写相应的必填字段

### 3. **格式验证**
- HTML格式：确保标签正确闭合
- XML格式：确保XML语法正确
- TXT格式：确保标记语法正确

### 4. **特殊字符**
- 在XML中使用HTML实体编码
- 在HTML中正确转义特殊字符
- 在TXT中避免使用特殊标记字符

## 🔧 导入步骤

### 1. **准备文件**
- 按照格式要求创建文件
- 确保编码为UTF-8
- 验证格式正确性

### 2. **上传文件**
- 访问导入页面
- 选择文件格式
- 上传文件

### 3. **验证结果**
- 检查导入数量
- 验证题目内容
- 确认答案正确性

## 📋 常见错误

### 1. **格式错误**
- 标签未正确闭合
- 必填字段缺失
- 编码格式错误

### 2. **内容错误**
- 题目内容为空
- 选项数量不正确
- 正确答案标记错误

### 3. **系统错误**
- 文件大小超限
- 不支持的文件格式
- 服务器处理错误

## 🛠️ 故障排除

### 1. **导入失败**
- 检查文件格式
- 验证必填字段
- 确认编码格式

### 2. **部分导入**
- 检查错误题目
- 修正格式问题
- 重新导入

### 3. **编码问题**
- 确保UTF-8编码
- 检查特殊字符
- 使用标准字符集

## 📞 技术支持

如果遇到导入问题：
1. 检查文件格式是否符合要求
2. 验证所有必填字段是否完整
3. 确认文件编码为UTF-8
4. 查看系统错误日志

---

**注意**: 严格按照格式要求创建导入文件，确保系统能够正确识别和解析题目内容。 